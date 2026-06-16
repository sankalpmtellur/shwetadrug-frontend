import { useAuth } from "../../hooks/useAuth";

export function Topbar() {
  const { user } = useAuth();

  return (
    <header className="fixed inset-x-0 top-0 z-20 border-b border-border bg-white/95 px-4 py-3 backdrop-blur lg:left-72 md:px-8">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 pl-12 lg:pl-0">
        <div className="min-w-0">
          <p className="truncate text-xl font-black text-navy">Employee Dashboard</p>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Shweta Drug Distributors</p>
        </div>
        <div className="hidden rounded-lg border border-border bg-surface-soft px-3 py-2 text-sm font-bold text-muted sm:block">
          {user?.name ?? "Employee Portal"}
        </div>
      </div>
    </header>
  );
}
