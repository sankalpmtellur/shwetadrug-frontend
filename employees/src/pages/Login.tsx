import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

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
        <main className="min-h-screen overflow-hidden bg-[#f6f8fc] px-4 py-8">
            <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_.95fr]">

                <div className="w-full rounded-lg border border-border bg-white p-6 shadow-xl shadow-slate-200/70 md:p-8">
                    <div>
                        <div className="mb-5 grid h-12 w-12 place-items-center rounded-lg bg-surface-strong text-primary">
                            <LockKeyhole className="h-6 w-6" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest text-primary">Employee Portal</p>
                        <h2 className="mt-2 text-3xl font-black text-navy">Welcome </h2>
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
