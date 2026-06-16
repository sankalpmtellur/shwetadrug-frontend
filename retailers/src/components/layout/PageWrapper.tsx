import type { ReactNode } from "react";

export function PageWrapper({ title, eyebrow, children }: { title: string; eyebrow?: string; children: ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        {eyebrow ? <p className="mb-1 text-xs font-bold uppercase tracking-widest text-primary">{eyebrow}</p> : null}
        <h1 className="text-2xl font800 font-bold text-navy md:text-3xl">{title}</h1>
      </div>
      {children}
    </div>
  );
}
