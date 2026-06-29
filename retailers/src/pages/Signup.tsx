import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { authService } from "../services/authService";

const initialForm = {
  ownerName: "",
  pharmacyName: "",
  phone: "",
  email: "",
  gstNumber: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

export default function Signup() {
  const [form, setForm] = useState(initialForm);
  const [addressError, setAddressError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  function updateField(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    if (field === "address") {
      setAddressError("");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const address = form.address.trim();
    if (!address) {
      setAddressError("Address is required.");
      toast.error("Please enter your pharmacy address.");
      return;
    }

    if (address.length < 5) {
      setAddressError("Address must be at least 5 characters.");
      toast.error("Address must be at least 5 characters.");
      return;
    }

    setIsLoading(true);

    try {
      await authService.retailerSignup({
        ownerName: form.ownerName.trim(),
        pharmacyName: form.pharmacyName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        gstNumber: form.gstNumber.trim(),
        address,
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
      });
      toast.success("Signup submitted. Please wait for admin approval.");
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
          <Input className="mt-2" value={form.pharmacyName} onChange={(event) => updateField("pharmacyName", event.target.value)} placeholder="Your pharmacy name" required />
        </label>
        <label className="block text-sm font-semibold text-navy">
          Phone Number
          <Input className="mt-2" value={form.phone} onChange={(event) => updateField("phone", event.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10 digit mobile number" required />
        </label>
        <label className="block text-sm font-semibold text-navy">
          Email ID
          <Input className="mt-2" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="owner@gmail.com" required />
        </label>
        <label className="block text-sm font-semibold text-navy">
          GST Number <span className="font-medium text-muted">(optional)</span>
          <Input className="mt-2" value={form.gstNumber} onChange={(event) => updateField("gstNumber", event.target.value.toUpperCase())} placeholder="GST number if available" />
        </label>
        <label className="block text-sm font-semibold text-navy">
          Address
          <Input
            className="mt-2"
            value={form.address}
            onChange={(event) => updateField("address", event.target.value)}
            placeholder="Shop number, building, street"
            required
            minLength={5}
            aria-invalid={Boolean(addressError)}
            aria-describedby={addressError ? "signup-address-error" : undefined}
          />
          {addressError ? <span id="signup-address-error" className="mt-1 block text-xs font-semibold text-error">{addressError}</span> : null}
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm font-semibold text-navy">
            City
            <Input className="mt-2" value={form.city} onChange={(event) => updateField("city", event.target.value)} placeholder="City" required />
          </label>
          <label className="block text-sm font-semibold text-navy">
            State
            <Input className="mt-2" value={form.state} onChange={(event) => updateField("state", event.target.value)} placeholder="State" required />
          </label>
          <label className="block text-sm font-semibold text-navy">
            Pincode
            <Input className="mt-2" value={form.pincode} onChange={(event) => updateField("pincode", event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Pincode" required />
          </label>
        </div>

        <div className="rounded-lg border border-primary/20 bg-surface-soft p-4 text-sm font-semibold leading-6 text-muted">
          After submitting your signup request, admin approval is required. Please wait for approval. Once approved, you will receive your login details by phone message or registered email.
        </div>

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
