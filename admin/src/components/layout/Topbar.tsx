import { useLocation } from "react-router-dom";

const pageCopy: Record<string, { title: string }> = {
  "/dashboard": {
    title: "Executive Dashboard",
  },
  "/medicines": {
    title: "Medicines",
  },
  "/inventory": {
    title: "Inventory",
  },
  "/retailers": {
    title: "Retailers",
  },
  "/orders": {
    title: "Orders",
  },
  "/audit-logs": {
    title: "Audit Logs",
  },
};

export function Topbar() {
  const location = useLocation();
  const currentPage = pageCopy[location.pathname] ?? pageCopy["/dashboard"];

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-white/95 px-4 py-3 backdrop-blur md:px-8">
      <div className="mx-auto flex max-w-[1440px] items-center gap-4 pl-12 md:pl-0">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-widest text-primary">Admin Portal</p>
          <h1 className="truncate text-xl font-black text-navy">{currentPage.title}</h1>
        </div>
      </div>
    </header>
  );
}
