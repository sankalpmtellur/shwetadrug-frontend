import { Link } from "react-router-dom";

function Home() {
  return (
    <main className="min-h-screen bg-background px-4 py-10 text-navy">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col items-center justify-center text-center">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-primary">
          Wholesale Business
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
          Shweta Drug Distributors
        </h1>

        <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-muted sm:text-lg">
          For retailers to checkout inventory and order them.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/login"
            className="rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-soft transition hover:opacity-90"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="rounded-xl border border-border bg-white px-8 py-3 text-sm font-bold text-primary shadow-sm transition hover:bg-surface-soft"
          >
            Sign Up
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Home;