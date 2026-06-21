import type { ReactNode } from "react";
import { Card } from "./Card";

export function Metric({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <Card>
      <div className={`mb-4 inline-flex rounded-lg bg-surface-strong p-2 ${tone}`}>{icon}</div>
      <p className="text-xs font-bold uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 text-3xl font-black text-navy">{value}</p>
    </Card>
  );
}
