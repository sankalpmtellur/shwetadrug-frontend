import type { ReactNode } from "react";
import { Card } from "./Card";

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
  tone = "blue",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
  tone?: keyof typeof tones;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-surface-soft" />
      <div className={`relative mb-4 inline-flex rounded-lg p-2 ${tones[tone]}`}>{icon}</div>
      <p className="text-xs font-black uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 text-3xl font-black text-navy">{value}</p>
      <p className="mt-2 text-xs font-bold text-muted">{hint}</p>
    </Card>
  );
}
