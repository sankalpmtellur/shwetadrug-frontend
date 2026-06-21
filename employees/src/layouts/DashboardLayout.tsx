import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar open={open} setOpen={setOpen} />
      <main className="min-h-screen min-w-0 overflow-x-hidden lg:ml-72">
        <div className="mx-auto max-w-[1440px] space-y-6 px-4 pb-8 pt-20 md:px-8 lg:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
