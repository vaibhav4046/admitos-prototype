/**
 * Button — base interactive primitive.
 *
 * Three variants ("primary", "secondary", "ghost") and three sizes
 * ("sm", "md", "lg"). Anything more elaborate (icon-only, loading
 * state, dropdown) belongs in a sibling component, not in here.
 *
 * Why a hand-rolled Button instead of pulling in shadcn/ui or
 * radix-ui? Because the entire visible surface area of the MVP is
 * about 40 components. Owning the primitives keeps the dep tree
 * tiny and lets us style admissions vs. wellbeing namespaces with
 * different colour tokens without fighting third-party theme APIs.
 *
 * Accessibility:
 *   - Renders an actual <button> by default — no rolling our own
 *     onClick on a div.
 *   - When `loading` is true, the button is disabled and aria-busy.
 *   - Focus ring is provided by Tailwind's `focus-visible:` utilities
 *     so keyboard users see it but mouse users don't.
 */

import * as React from "react";

import { cn } from "@/lib/ui/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-300",
  secondary:
    "bg-white text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 active:bg-slate-100 disabled:text-slate-400",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 disabled:text-slate-400",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-2.5 py-1.5 text-xs rounded-md",
  md: "px-3.5 py-2 text-sm rounded-md",
  lg: "px-4 py-2.5 text-base rounded-lg",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      type = "button",
      ...rest
    },
    ref
  ) {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500",
          "disabled:cursor-not-allowed",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className
        )}
        {...rest}
      >
        {loading ? <Spinner /> : null}
        <span className={loading ? "opacity-70" : undefined}>{children}</span>
      </button>
    );
  }
);

function Spinner() {
  return (
    <svg
      aria-hidden="true"
      className="mr-2 h-3 w-3 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="3"
      />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
