import { useState, type FormEvent, type ReactNode } from "react";
import { BarChart3, Building2, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { clearError, error, isAuthenticated, isLoading, login } = useAuth();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();

    if (!email.trim() || !password) {
      return;
    }

    try {
      await login(email.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch {
      return;
    }
  }

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f8fc] px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_.95fr]">
        <section className="hidden rounded-lg border border-blue-100 bg-white p-8 shadow-xl shadow-slate-200/70 lg:block">
          <div className="rounded-lg bg-primary px-6 py-7 text-white shadow-lg shadow-primary/20">
            <p className="text-xs font-black uppercase tracking-widest text-white/75">Owner Console</p>
            <h1 className="mt-3 text-4xl font-black leading-tight">Control room for the distribution business.</h1>
            <p className="mt-4 text-sm font-semibold leading-6 text-white/80">Monitor orders, inventory, retailers, and expiry risk from a cleaner admin workspace.</p>
          </div>
          <div className="mt-5 grid gap-3">
            <LoginFeature icon={<BarChart3 className="h-5 w-5" />} label="Business overview" />
            <LoginFeature icon={<Building2 className="h-5 w-5" />} label="Retailer approvals" />
            <LoginFeature icon={<ShieldCheck className="h-5 w-5" />} label="Inventory governance" />
          </div>
        </section>

        <div className="w-full rounded-lg border border-border bg-white p-6 shadow-xl shadow-slate-200/70 md:p-8">
          <div>
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-lg bg-surface-strong text-primary">
              <LockKeyhole className="h-6 w-6" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-primary">Admin Portal</p>
            <h1 className="mt-2 text-3xl font-black text-navy">Welcome</h1>
            <p className="mt-2 text-sm text-muted">Sign in to manage Shweta Drug Distributors.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-navy">Email</span>
              <input
                className="h-12 w-full rounded-lg border border-border px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="Enter email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                disabled={isLoading}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-navy">Password</span>
              <div className="relative">
                <input
                  className="h-12 w-full rounded-lg border border-border px-4 pr-12 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="Enter password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </label>

            {error ? (
              <p className="rounded-lg border border-error/20 bg-red-50 px-4 py-3 text-sm font-bold text-error">
                {error}
              </p>
            ) : null}

            <button
              className="h-12 w-full rounded-lg bg-primary text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={isLoading || !email.trim() || !password}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

function LoginFeature({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-soft p-4">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-white text-primary">{icon}</div>
      <p className="text-sm font-black text-navy">{label}</p>
    </div>
  );
}
