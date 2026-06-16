import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
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
        <main className="min-h-screen bg-background px-4 py-8">
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">

                <div className="w-full max-w-md rounded-lg border border-border bg-white p-6 shadow-sm md:p-8">
                    <div className="text-center">
                        <p className="text-xs font-bold uppercase tracking-widest text-primary">Employee Portal</p>
                        <h2 className="mt-2 text-3xl font-black text-navy">Login</h2>
                        <p className="mt-2 text-sm text-muted">Access orders, stock updates, and expiry alerts.</p>
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
                            className="h-12 w-full rounded-xl bg-primary text-sm font-bold text-white transition hover:opacity-90"
                        >
                            {isLoading ? "Logging in..." : "Login to Dashboard"}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
