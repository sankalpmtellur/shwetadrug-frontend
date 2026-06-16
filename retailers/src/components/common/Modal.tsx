import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-semibold text-navy">{title}</h2>
          <Button variant="ghost" className="h-9 w-9 p-0" onClick={onClose} aria-label="Close modal">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
