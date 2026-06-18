import { Link } from "react-router-dom";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10 text-navy">
      <section className="w-full max-w-lg rounded-2xl border border-border bg-white p-8 text-center shadow-soft">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-surface-strong text-primary">
          <SearchX className="h-7 w-7" />
        </div>
        <p className="mt-6 text-xs font-black uppercase tracking-widest text-primary">Page not found</p>
        <h1 className="mt-2 text-3xl font-black text-navy">This page does not exist</h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-muted">
          Please check the URL or return to the home page.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-black text-white transition hover:bg-primary/90"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </section>
    </main>
  );
}
