import type { ReactNode } from "react";
import { Card } from "./Card";
import { cn } from "../../utils/cn";

const tones = {
  blue: "bg-surface-strong text-primary",
  green: "bg-emerald-50 text-success",
  orange: "bg-amber-50 text-warning",
};

export function Metric({
  icon,
  label,
  value,
  hint,
  onClick,
  tone = "blue",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
  onClick?: () => void;
  tone?: keyof typeof tones;
}) {
  const content = (
    <Card className="relative h-full overflow-hidden">
      <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-surface-soft" />
      <div className={`relative mb-4 inline-flex rounded-lg p-2 ${tones[tone]}`}>{icon}</div>
      <p className="text-xs font-black uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 break-words text-2xl font-black text-navy sm:text-3xl">{value}</p>
      <p className="mt-2 text-xs font-bold text-muted">{hint}</p>
    </Card>
  );

  if (!onClick) return content;

  return (
    <button
      className={cn("block h-full w-full rounded-lg text-left transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-primary/15")}
      onClick={onClick}
      type="button"
    >
      {content}
    </button>
  );
}
