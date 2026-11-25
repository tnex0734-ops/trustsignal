import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const VIEWPORTS = [
  { name: "mobile-320", width: 320, height: 568 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1024", width: 1024, height: 768 },
  { name: "desktop-1440", width: 1440, height: 900 },
] as const;

async function assertNonceScriptCsp(
  response: Awaited<ReturnType<import("@playwright/test").Page["goto"]>>,
) {
  expect(response).not.toBeNull();
  expect(response?.status()).toBe(200);
  const headers = response?.headers() ?? {};
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["referrer-policy"]).toBe("no-referrer");
  expect(headers["x-dns-prefetch-control"]).toBe("off");

  const csp = headers["content-security-policy"] ?? "";
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toContain("connect-src 'self'");
  expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);

  const nonceMatch = csp.match(/'nonce-([^']+)'/);
  expect(nonceMatch).not.toBeNull();
  const body = (await response?.text()) ?? "";
  const scriptNonces = [...body.matchAll(/<script\b[^>]*\bnonce="([^"]+)"/gi)].map((m) => m[1]);
  expect(scriptNonces.length).toBeGreaterThan(0);
  expect(scriptNonces.every((n) => n === nonceMatch?.[1])).toBe(true);
}

test.describe("TrustSignal end-to-end journeys, privacy, security, and accessibility", () => {
  test("homepage loads cleanly with required security headers and zero console errors", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });
    page.on("pageerror", (err) => {
      pageErrors.push(err.message);
    });

    const response = await page.goto("/");
    await assertNonceScriptCsp(response);

    await expect(
      page.getByRole("heading", {
        name: /check suspicious links, scam messages and password strength before you act/i,
      }),
    ).toBeVisible();

    const learnRes = await page.goto("/learn");
    await assertNonceScriptCsp(learnRes);
    await expect(
      page.getByRole("heading", { name: /digital safety guides & rule transparency/i }),
    ).toBeVisible();

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test("API metadata routes return validated JSON and never echo arbitrary query strings", async ({
    request,
  }) => {
    const healthRes = await request.get("/api/health?probe=<script>alert(1)</script>");
    expect(healthRes.status()).toBe(200);
    const healthText = await healthRes.text();
    expect(healthText).not.toContain("probe");
    expect(healthText).not.toContain("<script>");

    const rulesRes = await request.get("/api/rules");
    expect(rulesRes.status()).toBe(200);
    const rulesJson = await rulesRes.json();
    expect(rulesJson.ruleCount).toBeGreaterThanOrEqual(20);

    const guidesRes = await request.get("/api/guides");
    const guidanceRes = await request.get("/api/guidance");
    expect(guidesRes.status()).toBe(200);
    expect(guidanceRes.status()).toBe(200);
    expect(await guidesRes.json()).toEqual(await guidanceRes.json());
  });

  test("Link Check analyzes suspicious and benign links without contacting candidate URLs", async ({
    page,
  }) => {
    const outgoingUrls: string[] = [];
    page.on("request", (req) => {
      outgoingUrls.push(req.url());
    });

    await page.goto("/");

    const linkInput = page.getByLabel(/paste a suspicious or unfamiliar web link/i);
    await linkInput.fill("https://paypal.com@login-check.example.com/verify-account");
    await page.getByRole("button", { name: /analyze link/i }).click();

    const result = page.getByRole("region", { name: /analysis result/i });
    await expect(result.getByText("High risk", { exact: true })).toBeVisible();
    await expect(result.getByText(/username or credentials embedded before @/i)).toBeVisible();
    await expect(result.getByRole("link")).toHaveCount(0);

    // Benign HTTPS check shows Low signal + limitations (never claims safe)
    await page.getByRole("button", { name: /clear/i }).click();
    await linkInput.fill("https://www.example.com/articles/online-safety-guide");
    await page.getByRole("button", { name: /analyze link/i }).click();

    await expect(result.getByText("Low signal", { exact: true })).toBeVisible();
    await expect(result.getByText(/does not certify/i)).toBeVisible();

    // Unsafe javascript: scheme is blocked cleanly without navigation
    await page.getByRole("button", { name: /clear/i }).click();
    await linkInput.fill("javascript:alert(1)");
    await page.getByRole("button", { name: /analyze link/i }).click();
    await expect(page.getByText(/blocked non-web scheme/i)).toBeVisible();

    expect(outgoingUrls.some((u) => u.includes("example.com") || u.includes("paypal.com"))).toBe(
      false,
    );
  });

  test("Message Check catches phishing OTP scams, keeps urgent-only benign, and neutralizes XSS", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: /check a message/i }).click();

    // Benign urgent message
    await page.getByRole("button", { name: /benign control: urgent reminder/i }).click();
    const result = page.getByRole("region", { name: /analysis result/i });
    await expect(result.getByText("Low signal", { exact: true })).toBeVisible();

    // XSS + OTP + IP link phishing message
    await page.getByRole("button", { name: /clear/i }).click();
    const msgInput = page.getByLabel(/paste an sms, email, or chat message/i);
    await msgInput.fill(
      "<script>window.__xssExecuted=true</script> URGENT: Share your 6-digit OTP at http://192.0.2.45/kyc-login",
    );
    await page.getByRole("button", { name: /analyze message/i }).click();

    await expect(result.getByText("High risk", { exact: true })).toBeVisible();
    await expect(
      result.getByText(/requests a one-time passcode \(otp\), pin, or password/i),
    ).toBeVisible();

    const xssFlag = await page.evaluate(
      () => (window as unknown as { __xssExecuted?: boolean }).__xssExecuted,
    );
    expect(xssFlag).toBeUndefined();
  });

  test("Password Check stays 100% in browser memory with zero network or storage leakage", async ({
    page,
  }) => {
    const testSecret = "TestOnlyVault!94Mountain#River";
    const capturedRequests: Array<{ url: string; postData: string | null }> = [];
    page.on("request", (req) => {
      capturedRequests.push({ url: req.url(), postData: req.postData() });
    });

    await page.goto("/");
    await page.getByRole("tab", { name: /check a password/i }).click();

    const pwdInput = page.getByLabel(/test password or passphrase strength locally/i);
    await pwdInput.fill(testSecret);

    const assessment = page.getByRole("region", { name: /password strength assessment/i });
    await expect(assessment.getByText("Low signal")).toBeVisible();
    await expect(assessment.getByText(/does not check whether/i)).toBeVisible();

    // Show/hide toggle
    await page.getByRole("button", { name: /show password/i }).click();
    await expect(pwdInput).toHaveAttribute("type", "text");

    // Verify no network request or browser storage holds the password
    for (const req of capturedRequests) {
      expect(req.url).not.toContain(testSecret);
      expect(req.postData ?? "").not.toContain(testSecret);
    }

    const storageDump = await page.evaluate(() => ({
      local: JSON.stringify(window.localStorage),
      session: JSON.stringify(window.sessionStorage),
      cookies: document.cookie,
      href: window.location.href,
    }));
    expect(storageDump.local).not.toContain(testSecret);
    expect(storageDump.session).not.toContain(testSecret);
    expect(storageDump.cookies).not.toContain(testSecret);
    expect(storageDump.href).not.toContain(testSecret);

    // Clear resets input and result
    await page.getByRole("button", { name: /clear/i }).click();
    await expect(pwdInput).toHaveValue("");
    await expect(assessment).toHaveCount(0);

    // Leaving Password tab clears password state
    await pwdInput.fill("cobalt-lantern-bicycle-meadow-84");
    await page.getByRole("tab", { name: /check a link/i }).click();
    await page.getByRole("tab", { name: /check a password/i }).click();
    await expect(page.getByLabel(/test password or passphrase strength locally/i)).toHaveValue("");
  });

  test("supports keyboard-only navigation across tabs and forms", async ({ page }) => {
    await page.goto("/");

    const linkTab = page.getByRole("tab", { name: /check a link/i });
    await linkTab.focus();
    await page.keyboard.press("ArrowRight");

    const messageTab = page.getByRole("tab", { name: /check a message/i });
    await expect(messageTab).toBeFocused();
    await expect(messageTab).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("Tab");
    const messageBox = page.getByLabel(/paste an sms, email, or chat message/i);
    await expect(messageBox).toBeFocused();
    await page.keyboard.type("Install AnyDesk and share the 9-digit support code.");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");

    const result = page.getByRole("region", { name: /analysis result/i });
    await expect(result.getByText("High risk")).toBeVisible();
  });

  test("renders cleanly without horizontal overflow from 320px to 1440px", async ({ page }) => {
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");
      const overflowHome = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflowHome, `Home overflow at ${vp.name}`).toBe(false);

      await page.goto("/learn");
      const overflowLearn = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflowLearn, `Learn overflow at ${vp.name}`).toBe(false);
    }
  });

  test("passes automated axe-core WCAG 2.2 AA accessibility scans on homepage and learn page", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /high-risk example: embedded credentials/i }).click();

    const homeScan = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(homeScan.violations).toEqual([]);

    await page.goto("/learn");
    const learnScan = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(learnScan.violations).toEqual([]);
  });
});
