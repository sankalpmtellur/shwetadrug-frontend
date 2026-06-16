import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("min-w-0 rounded-lg border border-border bg-white p-5 shadow-sm", className)}>{children}</div>;
}
