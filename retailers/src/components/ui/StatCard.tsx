import type { ReactNode } from "react";
import { Card } from "../common/Card";

export function StatCard({ label, value, icon, hint }: { label: string; value: string; icon: ReactNode; hint: string }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-lg bg-surface-strong p-2 text-primary">{icon}</div>
        <span className="text-xs font-semibold text-success">{hint}</span>
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-navy">{value}</p>
    </Card>
  );
}
