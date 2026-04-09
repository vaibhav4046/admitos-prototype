/**
 * TextField — single-line text input with label, hint, and error.
 *
 * Forwards `ref` so react-hook-form (or whatever form lib we land
 * on for the CEF wizard) can register it directly. The `label` and
 * `hint` are not optional in spirit — please write them — but the
 * type makes them optional so the component is usable in throwaway
 * places like the dev login form.
 *
 * The `error` prop, when set, switches the input to a red border
 * and renders the message below. Setting it to a non-string is a
 * type error so we don't accidentally render a Zod issue object.
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

export interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "id"> {
  label?: string;
  hint?: string;
  error?: string;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField({ label, hint, error, className, ...rest }, ref) {
    const id = useStableId("tf");
    const hintId = hint ? `${id}-hint` : undefined;
    const errorId = error ? `${id}-err` : undefined;

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
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
          className={cn(
            "mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-slate-900",
            "ring-1 ring-inset ring-slate-300 placeholder:text-slate-400",
            "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500",
            error && "ring-rose-500 focus:ring-rose-500",
            className
          )}
          {...rest}
        />
        {hint && !error ? (
          <p id={hintId} className="mt-1 text-xs text-slate-500">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} className="mt-1 text-xs text-rose-600">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);
