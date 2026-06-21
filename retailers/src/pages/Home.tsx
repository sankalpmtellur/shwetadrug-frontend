import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import heroImage from "../assets/home-hero.png";

function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-500/10 selection:text-blue-600">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 h-16 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Retailer Portal
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-600/10 hover:bg-blue-700 active:scale-[0.98] transition-all"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-white py-12 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">

            <div className="flex flex-col lg:col-span-6 z-10 text-center sm:text-left items-center sm:items-start">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.1] text-center sm:text-left">
                Shweta Drug Distributors
              </h1>

              <p className="mt-6 text-base sm:text-lg leading-relaxed text-slate-600 font-medium max-w-xl text-center sm:text-left">
                Streamline your daily wholesale medicine purchasing. Log in to check live stock, build exact orders without communication errors, and download invoice-ready history anytime.
              </p>

              <div className="mt-8 flex flex-col gap-3 w-full sm:w-auto sm:flex-row sm:items-center">
                <Link
                  to="/login"
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all w-full sm:w-auto"
                >
                  Start Ordering
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] transition-all w-full sm:w-auto"
                >
                  Create Retailer Account
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 flex flex-col items-center lg:items-end justify-center w-full">
              <div className="relative w-full max-w-md lg:max-w-none rounded-2xl border border-slate-200/80 bg-slate-50 p-2 shadow-xl shadow-slate-100 overflow-hidden">
                <img
                  src={heroImage}
                  alt="Shweta Drug Distributors Portal Preview"
                  className="h-48 sm:h-72 lg:h-auto lg:aspect-[1.2] w-full rounded-xl object-cover object-center"
                />

                <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:bottom-6 sm:right-auto sm:max-w-xs rounded-xl border border-white/80 bg-white/95 p-4 sm:p-5 shadow-xl backdrop-blur-md ring-1 ring-black/5 transition-all duration-300">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-slate-900 text-sm">Built for repeat ordering</h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500 font-medium">
                        Fast medicine search, cart review, and invoice-ready order history.
                      </p>
                    </div>
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

export default Home;