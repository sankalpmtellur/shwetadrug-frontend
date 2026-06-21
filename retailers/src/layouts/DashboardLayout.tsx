import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { BottomCartBar } from "../components/layout/BottomCartBar";

type DashboardLayoutProps = {
  children: ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();

  return (
    <div className="h-screen overflow-hidden bg-background">
      <div className="fixed left-0 right-0 top-0 z-40">
        <Navbar />
      </div>

      <div className="mx-auto grid h-screen max-w-[1440px] grid-cols-1 pt-[68px] sm:pb-16">
        <main className="min-w-0 overflow-y-auto pb-3 px-3 md:pb-8 md:px-8">
          {children}
        </main>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 hidden sm:block">
        <Footer />
      </div>
      {location.pathname === "/checkout" ? null : <BottomCartBar />}
    </div>
  );
}