import { Button } from "../common/Button";
import { SlidersHorizontal, X } from "lucide-react";

export function Sidebar({ onClose }: { onClose: () => void }) {
  return (
    <aside className="space-y-4 max-lg:fixed max-lg:bottom-0 max-lg:left-0 max-lg:top-[68px] max-lg:z-40 max-lg:w-80 max-lg:max-w-[86vw] max-lg:overflow-y-auto max-lg:bg-surface-soft max-lg:p-4 max-lg:shadow-soft">
      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-white">
              <SlidersHorizontal className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-black text-navy">Medicine List</h2>
              <p className="text-xs font-semibold text-muted">
                Use search to find medicines
              </p>
            </div>
          </div>

          <Button variant="ghost" className="h-9 w-9 p-0" onClick={onClose} aria-label="Close sidebar">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
