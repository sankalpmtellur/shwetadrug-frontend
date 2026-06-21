import { useState, type FormEvent, type ReactNode } from "react";
import { Eye, EyeOff, LockKeyhole, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { clearAuth, saveAuth } from "../lib/auth";
import { authService } from "../services/authService";

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const auth = await authService.login({ email, password });

            if (auth.user.role !== "EMPLOYEE") {
                clearAuth();
                await authService.logout().catch(() => undefined);
                setError("Please use an employee account for this portal.");
                return;
            }

            saveAuth(auth);
            navigate("/dashboard", { replace: true });
        } catch {
            setError("Invalid email or password.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="min-h-screen overflow-hidden bg-[#f6f8fc] px-4 py-8">
            <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_.95fr]">
                <section className="hidden lg:block">
                    <p className="text-xs font-black uppercase tracking-widest text-primary">Employee Portal</p>
                    <h1 className="mt-4 max-w-xl text-5xl font-black leading-tight text-navy">Operations workspace for orders and stock control.</h1>
                    <p className="mt-4 max-w-lg text-base font-semibold leading-7 text-muted">Review retailer orders, update inventory, and keep expiry-sensitive batches under control.</p>
                    <div className="mt-8 grid max-w-xl gap-3">
                        <Feature icon={<Truck />} title="Incoming Orders" />
                        <Feature icon={<PackageCheck />} title="Stock Updates" />
                        <Feature icon={<ShieldCheck />} title="Expiry Control" />
                    </div>
                </section>

                <div className="w-full rounded-lg border border-border bg-white p-6 shadow-xl shadow-slate-200/70 md:p-8">
                    <div>
                        <div className="mb-5 grid h-12 w-12 place-items-center rounded-lg bg-surface-strong text-primary">
                            <LockKeyhole className="h-6 w-6" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest text-primary">Employee Portal</p>
                        <h2 className="mt-2 text-3xl font-black text-navy">Welcome back</h2>
                        <p className="mt-2 text-sm text-muted">Sign in to manage daily warehouse operations.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-bold text-navy">
                                Email Address
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="Enter your email"
                                required
                                className="h-12 w-full rounded-xl border border-border px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold text-navy">
                                Password
                            </label>

                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    className="h-12 w-full rounded-xl border border-border px-4 pr-12 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {error ? (
                            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-error">
                                {error}
                            </div>
                        ) : null}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="h-12 w-full rounded-xl bg-primary text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isLoading ? "Logging in..." : "Login to Dashboard"}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}

function Feature({ icon, title }: { icon: ReactNode; title: string }) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-white/80 p-4 shadow-sm">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-surface-strong text-primary">{icon}</div>
            <p className="font-black text-navy">{title}</p>
        </div>
    );
}
