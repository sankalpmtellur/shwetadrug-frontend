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
  const hasBottomCart = location.pathname !== "/checkout";

  return (
    <div className="h-[100dvh] overflow-hidden bg-background">
      <div className="fixed left-0 right-0 top-0 z-40">
        <Navbar />
      </div>

      <div className="mx-auto grid h-[100dvh] max-w-[1440px] grid-cols-1 pt-[82px] sm:pb-16 md:pt-[88px]">
        <main className={`min-w-0 overflow-y-auto px-3 md:px-8 ${hasBottomCart ? "pb-36 sm:pb-28" : "pb-6 md:pb-8"}`}>
          {children}
        </main>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 hidden sm:block">
        <Footer />
      </div>
      {hasBottomCart ? <BottomCartBar /> : null}
    </div>
  );
}
