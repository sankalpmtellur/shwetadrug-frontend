import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { authService } from "../services/authService";

const initialForm = {
  ownerName: "",
  shopName: "",
  phone: "",
  email: "",
  address: "",
};

export default function Signup() {
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  function updateField(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      await authService.retailerSignup(form);
      toast.success("Signup submitted successfully. Admin approval is required before login.");
      navigate("/login", { replace: true });
    } catch {
      toast.error("Could not create account");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout title="Create retailer account" subtitle="Submit your pharmacy details for admin approval.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-semibold text-navy">
          Owner Name
          <Input className="mt-2" value={form.ownerName} onChange={(event) => updateField("ownerName", event.target.value)} placeholder="Owner full name" required />
        </label>
        <label className="block text-sm font-semibold text-navy">
          Pharmacy Name
          <Input className="mt-2" value={form.shopName} onChange={(event) => updateField("shopName", event.target.value)} placeholder="Your pharmacy name" required />
        </label>
        <label className="block text-sm font-semibold text-navy">
          Phone Number
          <Input className="mt-2" value={form.phone} onChange={(event) => updateField("phone", event.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10 digit mobile number" required />
        </label>
        <label className="block text-sm font-semibold text-navy">
          Email ID
          <Input className="mt-2" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="owner@example.com" required />
        </label>
        <label className="block text-sm font-semibold text-navy">
          Address
          <Input className="mt-2" value={form.address} onChange={(event) => updateField("address", event.target.value)} placeholder="Shop number, building, street" required />
        </label>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Submitting request..." : "Submit Signup Request"}
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
