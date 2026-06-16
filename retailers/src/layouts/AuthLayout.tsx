import type { ReactNode } from "react";
import { Pill, Phone } from "lucide-react";

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl overflow-hidden rounded-2xl border border-border bg-white shadow-soft lg:grid-cols-[1fr_1.1fr]">
        <section className="hidden bg-primary p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-8 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
              <Pill className="h-6 w-6" />
            </div>

            <h1 className="text-4xl font-black">
              Shweta Drug Distributors
            </h1>

            <p className="mt-4 max-w-md text-white/80">
              A simple B2B portal for retailers to access products, place
              orders, and manage supply requirements efficiently.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-5">
            <p className="text-sm font-medium text-white/70">
              Need assistance?
            </p>

            <div className="mt-3 flex items-center gap-3">
              <Phone className="h-5 w-5" />
              <span className="text-lg font-bold">9448817062</span>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md">
            <p className="text-sm font-bold uppercase tracking-widest text-primary">
              Retailer Portal
            </p>

            <h2 className="mt-2 text-3xl font-black text-navy">
              {title}
            </h2>

            <p className="mt-2 text-sm text-muted">
              {subtitle}
            </p>

            <div className="mt-8">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}