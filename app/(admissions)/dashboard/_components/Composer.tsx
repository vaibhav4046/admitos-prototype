"use client";

/**
 * Composer — Manus-style textarea + send affordance.
 *
 * Auto-grows up to 220px then scrolls internally. Cmd/Ctrl+Enter
 * submits. Labels + placeholder are driven by the dashboard copy
 * dict so the surface follows the user's locale choice from the
 * LangSwitcher — no hard-coded English here.
 *
 * Copy prop shape: `DashboardCopy["composer"]`.
 */

import { useRef, useState, type KeyboardEvent } from "react";

import type { DashboardCopy } from "@/app/_i18n/types";

export function Composer({
  copy,
  initial = "",
}: {
  copy: DashboardCopy["composer"];
  initial?: string;
}) {
  const [value, setValue] = useState(initial);
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const autosize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(220, el.scrollHeight) + "px";
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      console.log("[composer] submit:", value);
    }
  };

  return (
    <div className="uo-dash-composer">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          autosize();
        }}
        onKeyDown={onKey}
        placeholder={copy.placeholder}
        rows={3}
        aria-label={copy.taskInput}
      />
      <div className="uo-dash-composer-row">
        <div className="uo-dash-composer-tools">
          <button type="button" className="uo-dash-iconbtn" aria-label={copy.attach}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <button type="button" className="uo-dash-iconbtn" aria-label={copy.tools}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" />
            </svg>
          </button>
          <button type="button" className="uo-dash-iconbtn" aria-label={copy.cloudBrowser}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
          </button>
        </div>
        <button
          type="button"
          className="uo-dash-composer-send"
          aria-label={copy.send}
          onClick={() => console.log("[composer] submit:", value)}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
