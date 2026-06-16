import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { Topbar } from "../components/layout/Topbar";

export default function AdminLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar open={open} setOpen={setOpen} />

      <main className="min-h-screen min-w-0 overflow-x-hidden md:ml-[280px]">
        <div className="fixed left-0 right-0 top-0 z-40 md:left-[280px]">
          <Topbar />
        </div>

        <div className="mx-auto max-w-[1440px] space-y-6 p-4 pt-24 md:p-8 md:pt-24">
          <Outlet />
        </div>
      </main>
    </div>
  );
}