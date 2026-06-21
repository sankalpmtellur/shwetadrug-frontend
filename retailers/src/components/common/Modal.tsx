import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-navy/40 p-0 sm:items-center sm:justify-center sm:p-4" onMouseDown={onClose}>
      <div className="max-h-[92dvh] w-full max-w-2xl overflow-hidden rounded-t-lg bg-white shadow-soft sm:max-h-[calc(100vh-2rem)] sm:rounded-lg" onMouseDown={(event) => event.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-border bg-white p-4">
          <h2 className="min-w-0 break-words pr-2 text-base font-black leading-6 text-navy sm:text-lg">{title}</h2>
          <Button variant="ghost" className="h-9 w-9 p-0" onClick={onClose} aria-label="Close modal">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="max-h-[calc(92dvh-73px)] overflow-y-auto p-3 sm:max-h-[calc(100vh-7rem)] sm:p-4">{children}</div>
      </div>
    </div>
  );
}
