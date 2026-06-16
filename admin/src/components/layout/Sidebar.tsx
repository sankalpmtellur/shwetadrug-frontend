import { BarChart3, Boxes, Building2, CreditCard, LogOut, Menu, Pill, RotateCcw, ShoppingBag, Truck, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../common/Button";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/medicines", label: "Medicines", icon: Pill },
  { to: "/inventory", label: "Inventory", icon: Boxes },
  { to: "/retailers", label: "Retailers", icon: Building2 },
  { to: "/orders", label: "Orders", icon: ShoppingBag },
  { to: "/payments", label: "Payments", icon: CreditCard },
  { to: "/claims", label: "Claims", icon: RotateCcw },
  { to: "/deliveries", label: "Deliveries", icon: Truck },
];

export function Sidebar({ open, setOpen }: { open: boolean; setOpen: (value: boolean) => void }) {
  const navigate = useNavigate();
  const { isLoading, logout } = useAuth();

  async function handleLogout() {
    setOpen(false);
    await logout();
    navigate("/login", { replace: true });
  }

  const panel = (
    <aside className="flex h-full flex-col border-r border-border bg-surface-soft p-4">
      <div className="mb-8 flex items-start justify-between px-4 py-4">
        <div>
          <h2 className="text-2xl font-black leading-tight text-primary">Shweta Admin</h2>
          <p className="text-xs font-bold uppercase tracking-widest text-muted">Owner Console</p>
        </div>
        <button className="rounded-lg p-2 md:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="space-y-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold transition ${
                isActive ? "bg-white text-primary shadow-sm" : "text-muted hover:bg-white/70"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-border pt-4">
        <Button
          className="w-full justify-start gap-3"
          variant="ghost"
          onClick={() => void handleLogout()}
          disabled={isLoading}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </aside>
  );

  return (
    <>
      <button className="fixed left-4 top-4 z-30 rounded-lg bg-white p-2 shadow-sm md:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
        <Menu className="h-5 w-5 text-navy" />
      </button>
      <div className="fixed inset-y-0 left-0 z-40 hidden w-[280px] md:block">{panel}</div>
      {open ? (
        <div className="fixed inset-0 z-50 bg-navy/40 md:hidden">
          <div className="h-full w-80 max-w-[86vw]">{panel}</div>
        </div>
      ) : null}
    </>
  );
}
