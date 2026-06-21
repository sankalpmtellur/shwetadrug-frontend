import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "../layouts/AuthLayout";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { saveAuth, clearAuth } from "../lib/auth";
import { authService } from "../services/authService";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const auth = await authService.login({ email, password });

      if (auth.user.role !== "RETAILER") {
        clearAuth();
        await authService.logout().catch(() => undefined);
        toast.error("Please use the correct portal for this account.");
        return;
      }

      saveAuth(auth);
      toast.success("Login successful");
      navigate("/dashboard", { replace: true });
    } catch {
      toast.error("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout title="Welcome" subtitle="Login to continue ordering medicines for your pharmacy.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-semibold text-navy">
          Email
          <Input
            className="mt-2"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter email"
            required
          />
        </label>

        <label className="block text-sm font-semibold text-navy">
          Password
          <div className="relative mt-2">
            <Input
              className="pr-11"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-primary"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </label>

        <Button className="mt-2 w-full" type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login to portal"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">Don't have an account? <Link className="font-semibold text-primary" to="/signup">Sign up</Link></p>
    </AuthLayout>
  );
}
