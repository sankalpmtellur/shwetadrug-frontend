import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import heroImage from "../assets/home-hero.png";

function Home() {
  return (
    <main className="min-h-screen bg-background text-navy">
      <section className="relative isolate flex min-h-screen overflow-hidden">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(248,249,255,.98)_0%,rgba(248,249,255,.9)_36%,rgba(248,249,255,.5)_66%,rgba(248,249,255,.18)_100%)]" />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between gap-4">
            <span className="text-sm font-black uppercase tracking-widest text-primary">Retailer Portal</span>
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
            <div className="max-w-2xl rounded-none">
              <p className="text-xs font-black uppercase tracking-widest text-primary">Wholesale medicine ordering</p>
              <h1 className="mt-4 text-4xl font-black leading-tight text-navy sm:text-5xl lg:text-6xl">
                Shweta Drug Distributors
              </h1>
              <p className="mt-5 text-base font-semibold leading-7 text-muted sm:text-lg">
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
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
