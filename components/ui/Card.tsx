/**
 * Card — wrapping container with padding, border, and rounded
 * corners. Used across the dashboard tiles and form sections.
 *
 * Composition shape (Card / CardHeader / CardBody / CardFooter)
 * mirrors the shadcn convention so the JSX reads naturally even
 * if a developer who has used shadcn before drops into the codebase.
 */

import * as React from "react";

import { cn } from "@/lib/ui/cn";

export function Card({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-sm",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("border-b border-slate-200 px-5 py-4", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-base font-semibold text-slate-900 tracking-tight",
        className
      )}
      {...rest}
    >
      {children}
    </h3>
  );
}

export function CardBody({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-5 py-4", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border-t border-slate-200 bg-slate-50 px-5 py-3",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
