"use client";

import dynamic from "next/dynamic";
import { useState, type KeyboardEvent } from "react";
import { KeyRound, Link2, MessageSquareWarning } from "lucide-react";
import { LinkCheckForm } from "@/features/link-check/components/LinkCheckForm";
import { MessageCheckForm } from "@/features/message-check/components/MessageCheckForm";

const PasswordCheckForm = dynamic(
  () =>
    import("@/features/password-check/components/PasswordCheckForm").then(
      (mod) => mod.PasswordCheckForm,
    ),
  {
    ssr: false,
    loading: () => (
      <p className="py-6 text-sm text-slate-700" role="status">
        Loading browser-only password strength analyzer...
      </p>
    ),
  },
);

type ToolTabId = "link" | "message" | "password";

interface ToolTabConfig {
  id: ToolTabId;
  label: string;
  subtitle: string;
  Icon: typeof Link2;
}

const TOOL_TABS: readonly ToolTabConfig[] = [
  {
    id: "link",
    label: "Check a link",
    subtitle: "Inspect suspicious URLs without visiting",
    Icon: Link2,
  },
  {
    id: "message",
    label: "Check a message",
    subtitle: "Detect OTP, payment, and phishing cues",
    Icon: MessageSquareWarning,
  },
  {
    id: "password",
    label: "Check a password",
    subtitle: "Offline browser-only strength guidance",
    Icon: KeyRound,
  },
];

export function TrustSignalWorkbench() {
  const [activeTab, setActiveTab] = useState<ToolTabId>("link");

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % TOOL_TABS.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + TOOL_TABS.length) % TOOL_TABS.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = TOOL_TABS.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      const targetTab = TOOL_TABS[nextIndex];
      if (targetTab) {
        setActiveTab(targetTab.id);
        const targetEl = document.getElementById(`tab-${targetTab.id}`);
        targetEl?.focus();
      }
    }
  };

  return (
    <section
      aria-label="TrustSignal security checks"
      className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <div
        role="tablist"
        aria-label="Choose a security check tool"
        className="grid grid-cols-1 gap-2.5 sm:grid-cols-3"
      >
        {TOOL_TABS.map((tab, index) => {
          const isSelected = activeTab === tab.id;
          const Icon = tab.Icon;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              type="button"
              aria-selected={isSelected}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className={`flex min-h-[60px] cursor-pointer items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors ${
                isSelected
                  ? "border-sky-900 bg-sky-50/90 text-slate-950 shadow-2xs"
                  : "border-slate-200 bg-slate-50/60 text-slate-800 hover:bg-slate-100"
              }`}
            >
              <span
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  isSelected ? "bg-sky-900 text-white" : "bg-white text-slate-700"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold sm:text-base">{tab.label}</span>
                <span className="mt-0.5 block text-xs text-slate-600">{tab.subtitle}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Render only the active panel so leaving Password Check clears sensitive state immediately. */}
      <div
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="mt-6"
      >
        {activeTab === "link" ? <LinkCheckForm /> : null}
        {activeTab === "message" ? <MessageCheckForm /> : null}
        {activeTab === "password" ? <PasswordCheckForm /> : null}
      </div>
    </section>
  );
}
