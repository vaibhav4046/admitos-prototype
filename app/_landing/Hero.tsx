"use client";

/**
 * Hero — S1 per UNIOFFER-SPEC-01 v2.2 (polished).
 *
 * Composition (top → bottom):
 *   H1 display   — "more than offers, we spark futures." (Alice, 400)
 *   Subhead      — "ai-powered admissions for the ai-native generation."
 *   H-03 prompt  — "What can I do for you?" (display-sm)
 *   H-04 input   — auto-grow <textarea> (min 120 / max 320, resize none)
 *   H-04-B send  — circular accent button, arrow-up icon
 *   H-05 chips   — 5 suggestion chips (matching / essay / tutoring /
 *                  strategy / more)
 *
 * Auto-grow behaviour:
 *   The textarea starts at `rows={1}` so the initial height is driven by
 *   the CSS `min-height`. On every `input` event we reset `height: auto`
 *   and then set it to `min(scrollHeight, 320)`. When content exceeds
 *   320px the browser shows an internal scrollbar. The user can never
 *   drag-resize (resize: none in CSS) — the box is always exactly as
 *   tall as the content needs, capped.
 *
 * Handoff:
 *   Submit persists the text to sessionStorage('unioffer-hero-draft')
 *   and navigates to /signup?next=chat. Empty submit focuses the
 *   textarea. Chip click fills the template, re-runs auto-grow, focuses,
 *   and places the caret at the end.
 */

import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUp,
  GraduationCap,
  PenLine,
  BookOpen,
  Target,
  MoreHorizontal,
} from "lucide-react";

type Chip = {
  id: string;
  label: string;
  template: string;
  icon: typeof GraduationCap;
};

const CHIPS: readonly Chip[] = [
  {
    id: "matching",
    label: "University matching",
    template:
      "Help me build a target school list. I want a balanced mix of reach, match, and safety.",
    icon: GraduationCap,
  },
  {
    id: "essay",
    label: "Essay editing",
    template:
      "I have a draft personal statement. Please help me tighten it while keeping my voice.",
    icon: PenLine,
  },
  {
    id: "tutoring",
    label: "Subject tutoring",
    template:
      "I need tutoring support. Help me plan a prep schedule for my upcoming exam.",
    icon: BookOpen,
  },
  {
    id: "strategy",
    label: "Application strategies",
    template:
      "Walk me through a strategy for my applications — timing, choices, and what to prioritise.",
    icon: Target,
  },
  {
    id: "more",
    label: "More",
    template: "",
    icon: MoreHorizontal,
  },
] as const;

/** Height bounds in px. `min` mirrors the CSS min-height so the
 *  growing logic never collapses below what the layout reserves. */
const MIN_H = 120;
const MAX_H = 320;

export function Hero() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /** Snaps the textarea height to `min(scrollHeight, MAX_H)` so the
   *  box grows with the content and caps at MAX_H (scrollbar kicks
   *  in beyond that). Runs on `input` and after chip-fill. */
  const autoGrow = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const next = Math.min(Math.max(ta.scrollHeight, MIN_H), MAX_H);
    ta.style.height = `${next}px`;
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const value = textareaRef.current?.value.trim() ?? "";
      if (!value) {
        textareaRef.current?.focus();
        return;
      }
      try {
        sessionStorage.setItem("unioffer-hero-draft", value);
      } catch {
        /* sessionStorage blocked — navigation still proceeds. */
      }
      router.push("/signup?next=chat");
    },
    [router]
  );

  const handleChip = useCallback(
    (chip: Chip) => {
      const ta = textareaRef.current;
      if (!ta) return;
      if (chip.id === "more") {
        ta.focus();
        return;
      }
      ta.value = chip.template;
      autoGrow();
      ta.focus();
      const len = chip.template.length;
      ta.setSelectionRange(len, len);
    },
    [autoGrow]
  );

  return (
    <section className="uo-hero" aria-labelledby="hero-h1">
      <div className="uo-hero__inner">
        <h1 id="hero-h1" className="uo-hero__h1">
          more than offers,
          <br />
          we spark futures.
        </h1>

        <p className="uo-hero__lede">
          ai-powered admissions for the ai-native generation.
        </p>

        <h2 id="hero-h3" className="uo-hero__prompt">
          What can I do for you?
        </h2>

        <form
          className="uo-hero__form"
          aria-label="Ask UniOffer"
          onSubmit={handleSubmit}
        >
          <label htmlFor="hero-textarea" className="uo-visually-hidden">
            Describe what you need help with
          </label>
          <div className="uo-hero__field">
            <textarea
              id="hero-textarea"
              ref={textareaRef}
              name="prompt"
              className="uo-hero__textarea"
              placeholder="Describe what you need..."
              aria-labelledby="hero-h3"
              rows={1}
              maxLength={2000}
              onInput={autoGrow}
            />
            <button
              type="submit"
              className="uo-hero__send"
              aria-label="Send prompt and continue to sign-up"
            >
              <ArrowUp size={18} strokeWidth={2.4} aria-hidden="true" />
            </button>
          </div>

          <ul
            className="uo-hero__chips"
            aria-label="Suggested starting points"
          >
            {CHIPS.map((chip) => {
              const Icon = chip.icon;
              return (
                <li key={chip.id}>
                  <button
                    type="button"
                    className="uo-hero__chip"
                    onClick={() => handleChip(chip)}
                  >
                    <Icon size={14} strokeWidth={2} aria-hidden="true" />
                    <span>{chip.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </form>
      </div>
    </section>
  );
}
