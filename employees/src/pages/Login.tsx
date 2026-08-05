import { useState, type FormEvent, type ReactNode } from "react";
import { Boxes, ClipboardCheck, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { isAuthenticated, isLoading: isAuthLoading, login } = useAuth();

    if (!isAuthLoading && isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            await login({ email, password });
            navigate("/dashboard", { replace: true });
        } catch (authError) {
            setError(authError instanceof Error && authError.message.startsWith("Please use") ? authError.message : "Invalid email or password.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="grid min-h-screen grid-cols-1 bg-slate-50 lg:grid-cols-2">
            <section className="relative hidden flex-col justify-between bg-gradient-to-br from-primary to-blue-900 p-12 text-white lg:flex">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 font-semibold uppercase tracking-wider text-white/90">
                        <Boxes className="h-6 w-6 text-blue-300" />
                        <span>Shweta Drug Distributors</span>
                    </div>
                </div>

                <div className="relative z-10 max-w-xl space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-4xl font-extrabold tracking-tight xl:text-5xl">
                            Daily operations, <br />kept focused.
                        </h1>
                        <p className="text-base text-blue-100/80 leading-relaxed">
                            Review orders, update stock, and monitor expiry batches smoothly from one integrated employee workspace.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <LoginFeature icon={<ClipboardCheck className="h-5 w-5" />} label="Order review" />
                        <LoginFeature icon={<Boxes className="h-5 w-5" />} label="Inventory updates" />
                        <LoginFeature icon={<ShieldCheck className="h-5 w-5" />} label="Expiry checks" />
                    </div>
                </div>
            </section>

            <section className="flex items-center justify-center p-6 sm:p-12 md:p-24">
                <div className="w-full max-w-md space-y-8">
                    <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <LockKeyhole className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                            Employee Portal
                        </span>
                        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                            Welcome back
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Sign in to manage daily operations.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="employee-email" className="text-sm font-medium text-slate-700">
                                Email Address
                            </label>
                            <input
                                id="employee-email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="name@company.com"
                                required
                                className="block h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="employee-password" className="text-sm font-medium text-slate-700">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="employee-password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="block h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
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
                            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-600 shrink-0" />
                                {error}
                            </div>
                        ) : null}

                        <button
                            type="submit"
                            disabled={isLoading || isAuthLoading}
                            className="flex h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white shadow-md shadow-primary/10 transition hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isLoading ? "Logging in..." : "Login to Dashboard"}
                        </button>
                    </form>
                </div>
            </section>
        </main>
    );
}

function LoginFeature({ icon, label }: { icon: ReactNode; label: string }) {
    return (
        <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition hover:bg-white/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
                {icon}
            </div>
            <p className="text-sm font-medium text-white">{label}</p>
        </div>
    );
}
