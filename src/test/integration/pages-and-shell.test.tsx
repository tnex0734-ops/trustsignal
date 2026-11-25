import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import LearnPage from "@/app/learn/page";
import HomePage from "@/app/page";
import { SiteFooter } from "@/components/app-shell/SiteFooter";
import { SiteHeader } from "@/components/app-shell/SiteHeader";
import { TrustSignalWorkbench } from "@/features/workbench/TrustSignalWorkbench";

describe("App shell, pages, and keyboard tab interactions", () => {
  it("renders SiteHeader, SiteFooter, HomePage, and LearnPage with core challenge copy", () => {
    render(
      <>
        <SiteHeader />
        <HomePage />
        <SiteFooter />
      </>,
    );

    expect(
      screen.getByRole("heading", {
        name: /check suspicious links, scam messages and password strength before you act/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/pause before they click, pay, reply or share a password/i),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /safety guides/i }).length).toBeGreaterThanOrEqual(
      1,
    );

    render(<LearnPage />);
    expect(
      screen.getByRole("heading", { name: /digital safety guides & rule transparency/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/public detection rule catalogue/i)).toBeInTheDocument();
  });

  it("supports ArrowLeft, Home, End keyboard tab shortcuts and link sample triggers", async () => {
    const user = userEvent.setup();
    render(<TrustSignalWorkbench />);

    const linkTab = screen.getByRole("tab", { name: /check a link/i });
    const messageTab = screen.getByRole("tab", { name: /check a message/i });
    const passwordTab = screen.getByRole("tab", { name: /check a password/i });

    linkTab.focus();
    await user.keyboard("{End}");
    expect(passwordTab).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{ArrowLeft}");
    expect(messageTab).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{Home}");
    expect(linkTab).toHaveAttribute("aria-selected", "true");

    await user.click(screen.getByRole("button", { name: /benign example: standard https page/i }));
    expect(screen.getByText("Low signal", { exact: true })).toBeInTheDocument();
  });
});
