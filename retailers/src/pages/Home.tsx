import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

function Home() {
  return (
    <main className="min-h-screen bg-background px-4 py-6 text-navy sm:py-10">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col justify-between overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
        <div className="grid flex-1 gap-8 p-6 sm:p-8 lg:grid-cols-[1.05fr_.95fr] lg:p-12">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-black uppercase tracking-widest text-primary">Wholesale ordering portal</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-navy sm:text-5xl lg:text-6xl">
              Shweta Drug Distributors
            </h1>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-muted sm:text-lg">
              Search medicines, build orders quickly, and keep your pharmacy supply moving without calls, repeated lists, or manual follow-ups.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/signup"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-white px-6 text-sm font-black text-primary shadow-sm transition hover:bg-surface-soft"
              >
                Sign Up
              </Link>
              <Link
                to="/login"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-black text-white shadow-soft transition hover:bg-primary/90"
              >
                Login
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;