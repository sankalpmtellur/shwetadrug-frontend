import type { InputHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn("w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-navy placeholder:text-muted/70 focus-ring", className)}
      {...props}
    />
  );
}
