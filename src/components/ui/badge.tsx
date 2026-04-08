import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-calm-primary text-white hover:bg-calm-primary-hover": variant === "default",
          "border-transparent bg-calm-surface-2 text-calm-text hover:bg-calm-surface-2/80": variant === "secondary",
          "border-transparent bg-calm-error text-white hover:bg-calm-error/90": variant === "destructive",
          "text-calm-text": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
