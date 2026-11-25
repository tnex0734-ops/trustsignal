import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TrustSignalWorkbench } from "@/features/workbench/TrustSignalWorkbench";
import { MAX_MESSAGE_LENGTH, MAX_URL_LENGTH } from "@/lib/analysis/constants";

describe("TrustSignalWorkbench integration", () => {
  it("runs Link Check flow, blocks unsafe schemes, rejects oversized input, and resets cleanly", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const user = userEvent.setup();
    render(<TrustSignalWorkbench />);

    const linkInput = screen.getByLabelText(/paste a suspicious or unfamiliar web link/i);
    await user.click(linkInput);
    await user.paste("https://paypal.com@login-check.example.com/verify-account");
    await user.click(screen.getByRole("button", { name: /analyze link/i }));

    const resultRegion = screen.getByRole("region", { name: /analysis result/i });
    expect(within(resultRegion).getByText("High risk")).toBeInTheDocument();
    expect(
      within(resultRegion).getByText(/username or credentials embedded before @/i),
    ).toBeInTheDocument();
    expect(within(resultRegion).queryByRole("link")).toBeNull();

    // Unsafe javascript: scheme blocked without opening
    await user.click(screen.getByRole("button", { name: /clear/i }));
    expect(screen.queryByRole("region", { name: /analysis result/i })).toBeNull();

    await user.click(linkInput);
    await user.paste("javascript:alert(1)");
    await user.click(screen.getByRole("button", { name: /analyze link/i }));
    expect(screen.getByText(/blocked non-web scheme/i)).toBeInTheDocument();

    // Synthetic unsafe scheme preset button + assumed-scheme port breakdown
    await user.click(screen.getByRole("button", { name: /unsafe scheme example: javascript:/i }));
    expect(screen.getByText(/blocked non-web scheme/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /clear/i }));
    await user.click(linkInput);
    await user.paste("verify-portal.example.org:8443/home");
    await user.click(screen.getByRole("button", { name: /analyze link/i }));
    expect(screen.getByText(/https: \(assumed\)/i)).toBeInTheDocument();
    expect(screen.getByText(/verify-portal\.example\.org:8443/i)).toBeInTheDocument();

    // Oversized URL rejection
    await user.clear(linkInput);
    await user.click(linkInput);
    await user.paste(`https://example.com/${"a".repeat(MAX_URL_LENGTH)}`);
    await user.click(screen.getByRole("button", { name: /analyze link/i }));
    expect(screen.getByText(/exceeds maximum safe length/i)).toBeInTheDocument();

    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("runs Message Check flow with benign controls, XSS payload safety, and length bounds", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const user = userEvent.setup();
    render(<TrustSignalWorkbench />);

    await user.click(screen.getByRole("tab", { name: /check a message/i }));
    const messageBox = screen.getByLabelText(/paste an sms, email, or chat message/i);

    // Benign urgent message should stay Low signal
    await user.click(screen.getByRole("button", { name: /benign control: urgent reminder/i }));
    const resultRegion = screen.getByRole("region", { name: /analysis result/i });
    expect(within(resultRegion).getByText("Low signal")).toBeInTheDocument();
    expect(within(resultRegion).getByText(/does not certify/i)).toBeInTheDocument();

    // XSS + OTP scam message renders literally as text and triggers High risk
    await user.click(screen.getByRole("button", { name: /clear/i }));
    await user.click(messageBox);
    await user.paste(
      "<img src=x onerror=alert(1)> Share your 6-digit OTP at http://192.0.2.45/kyc-login",
    );
    await user.click(screen.getByRole("button", { name: /analyze message/i }));

    const scamResult = screen.getByRole("region", { name: /analysis result/i });
    expect(within(scamResult).getByText("High risk")).toBeInTheDocument();
    expect(document.querySelectorAll("img[src='x']")).toHaveLength(0);

    // Oversized message check
    await user.clear(messageBox);
    await user.click(messageBox);
    await user.paste("x".repeat(MAX_MESSAGE_LENGTH + 5));
    await user.click(screen.getByRole("button", { name: /analyze message/i }));
    expect(screen.getByText(/exceeds maximum safe length/i)).toBeInTheDocument();

    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("runs Password Check locally, toggles visibility, clears on reset and tab leave", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const user = userEvent.setup();
    render(<TrustSignalWorkbench />);

    // Navigate using keyboard ArrowRight twice from first tab to Password tab
    const linkTab = screen.getByRole("tab", { name: /check a link/i });
    linkTab.focus();
    await user.keyboard("{ArrowRight}{ArrowRight}");

    const passwordTab = screen.getByRole("tab", { name: /check a password/i });
    expect(passwordTab).toHaveAttribute("aria-selected", "true");

    const pwdInput = await screen.findByLabelText(/test password or passphrase strength locally/i);
    expect(pwdInput).toHaveAttribute("type", "password");

    const toggleBtn = screen.getByRole("button", { name: /show password/i });
    await user.click(toggleBtn);
    expect(pwdInput).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: /hide password/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.type(pwdInput, "qwertyuiop123");
    const assessmentRegion = screen.getByRole("region", { name: /password strength assessment/i });
    expect(within(assessmentRegion).getByText("High risk")).toBeInTheDocument();
    expect(within(assessmentRegion).getByText(/does not check whether/i)).toBeInTheDocument();

    // Clear removes password and result
    await user.click(screen.getByRole("button", { name: /clear/i }));
    expect(pwdInput).toHaveValue("");
    expect(screen.queryByRole("region", { name: /password strength assessment/i })).toBeNull();

    // Submitting empty form yields calm empty guidance; demo preset + backspace-to-empty clears
    await user.click(screen.getByRole("button", { name: /check password/i }));
    expect(screen.getByText(/type or paste a sample password/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /test sample: keyboard sequence/i }));
    expect(
      within(screen.getByRole("region", { name: /password strength assessment/i })).getByText(
        "High risk",
      ),
    ).toBeInTheDocument();

    await user.clear(pwdInput);
    expect(screen.queryByRole("region", { name: /password strength assessment/i })).toBeNull();

    // Entering password then switching tabs wipes password state on return
    await user.click(pwdInput);
    await user.paste("cobalt-lantern-bicycle-meadow-84");
    expect(
      within(screen.getByRole("region", { name: /password strength assessment/i })).getByText(
        "Low signal",
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /check a link/i }));
    await user.click(screen.getByRole("tab", { name: /check a password/i }));
    expect(
      await screen.findByLabelText(/test password or passphrase strength locally/i),
    ).toHaveValue("");
    expect(screen.queryByRole("region", { name: /password strength assessment/i })).toBeNull();

    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
