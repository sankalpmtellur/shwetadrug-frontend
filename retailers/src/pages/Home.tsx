import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import heroImage from "../assets/home-hero.webp";

function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900 antialiased selection:bg-blue-500/10 selection:text-blue-600 font-sans">
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
              className="hidden sm:inline-flex text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
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

      <section
        className="relative min-h-[calc(100vh-4rem)] w-full bg-cover bg-center flex items-center overflow-hidden"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent md:to-85% z-0" />

        <div className="relative mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-12 md:py-24 grid grid-cols-1 md:grid-cols-12 gap-12 items-center z-10">

          <div className="flex flex-col items-center text-center md:items-start md:text-left md:col-span-7 lg:col-span-6 z-20">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl leading-[1.1]">
              Shweta Drug Distributors
            </h1>

            <p className="mt-6 text-base sm:text-lg leading-relaxed text-slate-700 font-medium max-w-xl">
              Skip the endless phone calls and manual lists. Search our real-time inventory, place precision-quantity orders instantly, and manage your pharmacy's invoices in one streamlined dashboard.
            </p>

            <div className="mt-10 flex flex-col gap-4 w-full sm:w-auto sm:flex-row sm:items-center">
              <Link
                to="/login"
                className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-blue-600 px-6 font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all w-full sm:w-auto"
              >
                Start Ordering
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/signup"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] transition-all w-full sm:w-auto"
              >
                Create Retailer Account
              </Link>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}

export default Home;
