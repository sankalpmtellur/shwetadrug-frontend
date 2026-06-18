import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "../layouts/AuthLayout";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { authService } from "../services/authService";

const initialForm = {
  shopName: "",
  email: "",
  gstNumber: "",
  phone: "",
  ownerName: "",
  password: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

export default function Signup() {
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  function updateField(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      await authService.retailerSignup({
        ...form,
        drugLicenseNumber: "TO_BE_PROVIDED",
      });
      toast.success("Account created. Please login.");
      navigate("/login", { replace: true });
    } catch {
      toast.error("Could not create account");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout title="Create retailer account" subtitle="Add your pharmacy details to create your retailer login.">
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
        <label className="block text-sm font-semibold text-navy">
          Pharmacy Name
          <Input className="mt-2" value={form.shopName} onChange={(event) => updateField("shopName", event.target.value)} placeholder="Your pharmacy name" required />
        </label>
        <label className="block text-sm font-semibold text-navy">
          Email ID
          <Input className="mt-2" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="owner@example.com" required />
        </label>
        <label className="block text-sm font-semibold text-navy">
          GST Number
          <Input className="mt-2" value={form.gstNumber} onChange={(event) => updateField("gstNumber", event.target.value)} placeholder="GST registration number" required />
        </label>
        <label className="block text-sm font-semibold text-navy">
          Mobile
          <Input className="mt-2" value={form.phone} onChange={(event) => updateField("phone", event.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10 digit mobile number" required />
        </label>
        <label className="block text-sm font-semibold text-navy">
          Owner Name
          <Input className="mt-2" value={form.ownerName} onChange={(event) => updateField("ownerName", event.target.value)} placeholder="Owner full name" required />
        </label>
        <label className="block text-sm font-semibold text-navy">
          Password
          <div className="relative mt-2">
            <Input className="pr-11" type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => updateField("password", event.target.value)} placeholder="Create a strong password" required />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-primary" aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </label>
        <label className="block text-sm font-semibold text-navy sm:col-span-2">
          Address
          <Input className="mt-2" value={form.address} onChange={(event) => updateField("address", event.target.value)} placeholder="Shop number, building, street" required />
        </label>
        <label className="block text-sm font-semibold text-navy">
          City
          <Input className="mt-2" value={form.city} onChange={(event) => updateField("city", event.target.value)} placeholder="City" required />
        </label>
        <label className="block text-sm font-semibold text-navy">
          State
          <Input className="mt-2" value={form.state} onChange={(event) => updateField("state", event.target.value)} placeholder="State" required />
        </label>
        <label className="block text-sm font-semibold text-navy sm:col-span-2">
          Pincode
          <Input className="mt-2" value={form.pincode} onChange={(event) => updateField("pincode", event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Postal pincode" required />
        </label>

        <Button type="submit" className="w-full sm:col-span-2" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link className="font-semibold text-primary" to="/login">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}
