import { PackageSearch } from "lucide-react";

export function EmptyState({ title = "No records found", message = "Try changing your filters or search term." }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface-soft p-8 text-center">
      <PackageSearch className="mx-auto mb-3 h-9 w-9 text-primary" />
      <h3 className="font-semibold text-navy">{title}</h3>
      <p className="mt-1 text-sm text-muted">{message}</p>
    </div>
  );
}
