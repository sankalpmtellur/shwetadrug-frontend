import { Boxes, Headset, LayoutDashboard, LogOut, Menu, ShieldAlert, Truck, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "../common/Button";
import { useAuth } from "../../hooks/useAuth";

const links = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/orders", label: "Incoming Orders", icon: Truck },
  { to: "/inventory", label: "Stock Management", icon: Boxes },
  { to: "/expiry", label: "Expiry Control", icon: ShieldAlert },
];

export function Sidebar({ open, setOpen }: { open: boolean; setOpen: (value: boolean) => void }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  async function handleLogout() {
    setOpen(false);
    await logout();
    navigate("/login", { replace: true });
  }

  const panel = (
    <aside className="flex h-full flex-col border-r border-border bg-white p-4">
      <div className="mb-8 flex items-start justify-between px-3 py-4">
        <div>
          <h2 className="text-2xl font-black text-primary">Employee Portal</h2>
          <p className="text-xs font-bold uppercase tracking-widest text-muted">
            {user?.employeeProfile?.designation ?? "Central Operations"}
          </p>
        </div>
        <button className="rounded-lg p-2 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold transition ${
                isActive ? "bg-surface-strong text-primary" : "text-muted hover:bg-surface-soft"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-3 border-t border-border pt-4">
        <div className="rounded-lg bg-surface-soft px-4 py-3 text-xs font-bold text-muted">
          <div className="flex items-center gap-2 text-navy">
            <Headset className="h-4 w-4 text-primary" />
            Support
          </div>
          <p className="mt-1">Contact - 6363002342</p>
        </div>
        <Button
          className="w-full justify-start gap-3"
          variant="ghost"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </aside>
  );

  return (
    <>
      <button className="fixed left-4 top-4 z-30 rounded-lg bg-white p-2 shadow-sm lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
        <Menu className="h-5 w-5 text-navy" />
      </button>
      <div className="fixed inset-y-0 left-0 z-40 hidden w-72 lg:block">{panel}</div>
      {open ? (
        <div className="fixed inset-0 z-50 bg-navy/40 lg:hidden">
          <div className="h-full w-80 max-w-[86vw]">{panel}</div>
        </div>
      ) : null}
    </>
  );
}
