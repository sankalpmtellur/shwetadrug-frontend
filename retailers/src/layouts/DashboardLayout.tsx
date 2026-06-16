import { useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { Sidebar } from "../components/layout/Sidebar";
import { Footer } from "../components/layout/Footer";
import { BottomCartBar } from "../components/layout/BottomCartBar";

type DashboardLayoutProps = {
  children: ReactNode;
  showSidebar?: boolean;
};

export function DashboardLayout({ children, showSidebar = false }: DashboardLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window === "undefined" ? true : window.innerWidth >= 1024
  );
  const canShowSidebar = showSidebar && sidebarOpen;

  return (
    <div className="h-screen overflow-hidden bg-background">
      <div className="fixed left-0 right-0 top-0 z-40">
        <Navbar
          showSidebarToggle={showSidebar}
          onSidebarToggle={() => setSidebarOpen((value) => !value)}
        />
      </div>

      <div
        className={`mx-auto grid h-screen max-w-[1440px] grid-cols-1 pt-[68px] transition-[grid-template-columns] duration-300 sm:pb-16 ${
          canShowSidebar ? "lg:grid-cols-[280px_1fr]" : "lg:grid-cols-[0px_1fr]"
        }`}
      >
        <aside
          className={`overflow-y-auto border-r border-border bg-surface-soft transition-all duration-300 ${
            canShowSidebar ? "p-6" : "pointer-events-none overflow-hidden p-0 opacity-0"
          }`}
        >
          {canShowSidebar ? <Sidebar onClose={() => setSidebarOpen(false)} /> : null}
        </aside>

        <main className="min-w-0 overflow-y-auto p-3 md:p-8">
          {children}
        </main>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 hidden sm:block">
        <Footer />
      </div>
      {location.pathname === "/checkout" ? null : <BottomCartBar />}
      {!canShowSidebar ? null : <div className="fixed inset-0 z-30 hidden bg-navy/30 max-lg:block" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
