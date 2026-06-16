import type { ReactNode } from "react";

type BadgeTone = "green" | "orange" | "red" | "blue";

const tones: Record<BadgeTone, string> = {
  green: "bg-emerald-50 text-success",
  orange: "bg-amber-50 text-warning",
  red: "bg-red-50 text-error",
  blue: "bg-surface-strong text-primary",
};

export function Badge({ children, tone }: { children: ReactNode; tone: BadgeTone }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}
