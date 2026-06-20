import { Link } from "react-router-dom";
import { ArrowRight, ClipboardList, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import type { ReactNode } from "react";
import heroImage from "../assets/home-hero.png";

function Home() {
  return (
    <main className="min-h-screen bg-background text-navy">
      <section className="relative isolate flex min-h-[88svh] overflow-hidden">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(248,249,255,.98)_0%,rgba(248,249,255,.9)_36%,rgba(248,249,255,.5)_66%,rgba(248,249,255,.18)_100%)]" />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between gap-4">
            <span className="text-base font-black text-primary">Shweta Drug</span>
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-black text-primary transition hover:bg-white/70"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-black text-white shadow-soft transition hover:bg-primary/90"
              >
                Sign Up
              </Link>
            </div>
          </nav>

          <div className="flex flex-1 items-center py-12 sm:py-16">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-widest text-primary">Wholesale ordering portal</p>
              <h1 className="mt-4 text-4xl font-black leading-tight text-navy sm:text-5xl lg:text-6xl">
                Shweta Drug Distributors
              </h1>
              <p className="mt-5 text-base font-semibold leading-7 text-muted sm:text-lg">
                Search stock, place medicine orders, track bills, and download invoices from one simple retailer portal.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/login"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-black text-white shadow-soft transition hover:bg-primary/90"
                >
                  Start Ordering
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-white/90 px-6 text-sm font-black text-primary shadow-sm transition hover:bg-white"
                >
                  Create Retailer Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-white">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          <HomePoint icon={<PackageCheck className="h-5 w-5" />} title="Live Stock" text="View available medicines and pack details." />
          <HomePoint icon={<ClipboardList className="h-5 w-5" />} title="Easy Orders" text="Choose exact quantities without fixed bundles." />
          <HomePoint icon={<Truck className="h-5 w-5" />} title="Order Tracking" text="Follow every order from processing to delivery." />
          <HomePoint icon={<ShieldCheck className="h-5 w-5" />} title="PDF Invoices" text="Download and share bills whenever needed." />
        </div>
      </section>
    </main>
  );
}

function HomePoint({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface-soft text-primary">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-black text-navy">{title}</h2>
        <p className="mt-1 text-sm font-semibold leading-5 text-muted">{text}</p>
      </div>
    </div>
  );
}

export default Home;
