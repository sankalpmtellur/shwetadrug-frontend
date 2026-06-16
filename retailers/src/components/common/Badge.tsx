import type { HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & { tone?: "blue" | "green" | "orange" | "red" | "gray" };

export function Badge({ className, tone = "blue", ...props }: BadgeProps) {
  const tones = {
    blue: "bg-surface-strong text-primary",
    green: "bg-emerald-50 text-success",
    orange: "bg-amber-50 text-warning",
    red: "bg-red-50 text-error",
    gray: "bg-slate-100 text-muted",
  };

  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", tones[tone], className)} {...props} />;
}
