/**
 * TextArea — multi-line text input. Mirrors `TextField`'s shape so
 * a developer can swap one for the other without re-learning the
 * prop set. Used by step 6 of the CEF wizard (personal statement
 * working draft) and by the essay upload page.
 */

import * as React from "react";

import { cn } from "@/lib/ui/cn";

let nextId = 0;
function useStableId(prefix: string): string {
  const ref = React.useRef<string | null>(null);
  if (ref.current === null) {
    nextId += 1;
    ref.current = `${prefix}-${nextId}`;
  }
  return ref.current;
}

export interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  label?: string;
  hint?: string;
  error?: string;
  /** Word count to display in the bottom-right. Optional. */
  wordCount?: number;
  /** Soft word limit — exceeding it does not block, just nudges. */
  wordLimit?: number;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea(
    { label, hint, error, className, wordCount, wordLimit, rows = 6, ...rest },
    ref
  ) {
    const id = useStableId("ta");
    const hintId = hint ? `${id}-hint` : undefined;
    const errorId = error ? `${id}-err` : undefined;
    const overLimit =
      wordCount !== undefined && wordLimit !== undefined && wordCount > wordLimit;

    return (
      <div className="w-full">
        {label ? (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
          className={cn(
            "mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-slate-900",
            "ring-1 ring-inset ring-slate-300 placeholder:text-slate-400",
            "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500",
            "resize-y",
            error && "ring-rose-500 focus:ring-rose-500",
            className
          )}
          {...rest}
        />
        <div className="mt-1 flex items-start justify-between gap-4">
          <div className="text-xs">
            {hint && !error ? (
              <span id={hintId} className="text-slate-500">
                {hint}
              </span>
            ) : null}
            {error ? (
              <span id={errorId} className="text-rose-600">
                {error}
              </span>
            ) : null}
          </div>
          {wordCount !== undefined ? (
            <span
              className={cn(
                "text-xs tabular-nums",
                overLimit ? "text-rose-600" : "text-slate-400"
              )}
            >
              {wordCount}
              {wordLimit !== undefined ? ` / ${wordLimit}` : null} words
            </span>
          ) : null}
        </div>
      </div>
    );
  }
);
