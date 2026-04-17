"use client";

/**
 * Hero — S1 per UNIOFFER-SPEC-01 v2.2.
 *
 * Composition (top → bottom):
 *   H1 display   — "more than offers, we spark futures." (Alice, 400, display-xl)
 *   Subhead      — "ai-powered admissions for the ai-native generation."
 *   H-03 prompt  — "What can I do for you?" (display-sm, 64px below subhead)
 *   H-04 input   — <textarea> 720px max, 120px min height, radius-xl
 *   H-04-B send  — circular button bottom-right of textarea, arrow-up icon
 *   H-05 chips   — 5 suggestion chips (university matching, essay editing,
 *                  subject tutoring, application strategies, more)
 *
 * Handoff behaviour:
 *   On submit, the textarea value is persisted to
 *     sessionStorage('unioffer-hero-draft')
 *   then the user is navigated to /signup?next=chat. The /signup page
 *   reads that draft and hands it to the Catie agent once authenticated.
 *
 *   Empty-submit → focus textarea, no navigation.
 *   Chip click → fills the textarea with the chip's prompt template,
 *   focuses the textarea, and scrolls the caret to the end. User still
 *   has to press send to commit.
 *
 * Accessibility:
 *   - form has aria-label "Ask UniOffer"
 *   - textarea has visible label via id + aria-labelledby from H-03
 *   - chips are <button type="button"> with aria-describedby explaining
 *     they fill the prompt
 *   - reduced-motion: no entrance transitions
 *
 * LCP discipline:
 *   - H1 is not animated (fast contentful paint)
 *   - Textarea + chips render immediately (no Suspense, no client-only
 *     gate). The "use client" at the top is needed only for the submit
 *     handler + sessionStorage write; no heavy client work above the fold.
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

export function Hero() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        // sessionStorage may be blocked (private mode, embedded browser).
        // Navigation still proceeds; the signup page will just start
        // Catie with an empty context.
      }
      router.push("/signup?next=chat");
    },
    [router]
  );

  const handleChip = useCallback((chip: Chip) => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (chip.id === "more") {
      // "More" focuses the textarea without a template — invites the
      // user to type their own prompt.
      ta.focus();
      return;
    }
    ta.value = chip.template;
    ta.focus();
    // Move caret to the end so the user can keep typing.
    const len = chip.template.length;
    ta.setSelectionRange(len, len);
  }, []);

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
              rows={3}
              maxLength={2000}
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
