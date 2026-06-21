import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2, ClipboardList, Search, Truck } from "lucide-react";
import heroImage from "../assets/home-hero.png";

function Home() {
  return (
    <main className="min-h-screen bg-background text-navy">
      <section className="relative isolate flex min-h-screen overflow-hidden">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[62%_center] sm:object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(248,249,255,.98)_0%,rgba(248,249,255,.92)_48%,rgba(248,249,255,.76)_100%)] md:bg-[linear-gradient(90deg,rgba(248,249,255,.99)_0%,rgba(248,249,255,.94)_43%,rgba(248,249,255,.60)_72%,rgba(248,249,255,.20)_100%)]" />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between gap-4 rounded-lg border border-white/70 bg-white/70 px-3 py-2 shadow-sm backdrop-blur">
            <span className="min-w-0 text-sm font-black uppercase tracking-widest text-primary">Retailer Portal</span>
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

          <div className="grid flex-1 items-center gap-8 py-10 sm:py-14 md:grid-cols-[minmax(0,1fr)_minmax(260px,.7fr)] lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)]">
            <div className="max-w-2xl rounded-none">
              <p className="text-xs font-black uppercase tracking-widest text-primary">Wholesale medicine ordering</p>
              <h1 className="mt-4 text-4xl font-black leading-tight text-navy sm:text-5xl lg:text-6xl">
                Shweta Drug Distributors
              </h1>
              <p className="mt-5 max-w-xl text-base font-semibold leading-7 text-muted sm:text-lg">
                A clean ordering portal for retailers to search medicines, create exact-quantity orders, and manage bills without repeated calls or manual lists.
              </p>
              <p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-muted">
                Built for daily pharmacy purchasing: quick login, direct ordering, and a smoother path from selection to checkout.
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

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <HomeStep icon={<Search className="h-4 w-4" />} label="Search stock" />
                <HomeStep icon={<ClipboardList className="h-4 w-4" />} label="Place orders" />
                <HomeStep icon={<Truck className="h-4 w-4" />} label="Track delivery" />
              </div>
            </div>
            <div className="hidden min-h-[420px] md:flex md:items-end md:justify-end" aria-hidden="true">
              <div className="mb-8 w-full max-w-xs rounded-lg border border-white/70 bg-white/85 p-4 shadow-soft backdrop-blur">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-black text-navy">Built for repeat ordering</p>
                    <p className="mt-1 text-sm font-semibold leading-5 text-muted">Fast medicine search, cart review, and invoice-ready order history.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function HomeStep({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/70 bg-white/80 px-3 py-3 text-sm font-black text-navy shadow-sm backdrop-blur">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-strong text-primary">{icon}</span>
      {label}
    </div>
  );
}

export default Home;
