import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { authService } from "../services/authService";

const initialForm = {
  shopName: "",
  email: "",
  gstNumber: "",
  drugLicenseNumber: "",
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
      toast.success("Signup request submitted for verification");
      navigate("/login", { replace: true });
    } catch {
      toast.error("Could not submit signup request");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout title="Create retailer access" subtitle="Submit business and licence details for admin verification.">
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
        <label className="block text-sm font-semibold text-navy">
          Pharmacy Name
          <Input className="mt-2" value={form.shopName} onChange={(event) => updateField("shopName", event.target.value)} placeholder="Enter pharmacy name" required />
        </label>
        <label className="block text-sm font-semibold text-navy">
          Email ID
          <Input className="mt-2" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="owner@pharmacy.com" required />
        </label>
        <label className="block text-sm font-semibold text-navy">
          GST Number
          <Input className="mt-2" value={form.gstNumber} onChange={(event) => updateField("gstNumber", event.target.value)} placeholder="29ABCDE1234F1Z5" required />
        </label>
        <label className="block text-sm font-semibold text-navy">
          Drug Licence
          <Input className="mt-2" value={form.drugLicenseNumber} onChange={(event) => updateField("drugLicenseNumber", event.target.value)} placeholder="KA/DRUG/2041" required />
        </label>
        <label className="block text-sm font-semibold text-navy">
          Mobile
          <Input className="mt-2" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="+91 98765 43210" required />
        </label>
        <label className="block text-sm font-semibold text-navy">
          Owner Name
          <Input className="mt-2" value={form.ownerName} onChange={(event) => updateField("ownerName", event.target.value)} placeholder="Account holder name" required />
        </label>
        <label className="block text-sm font-semibold text-navy">
          Password
          <Input className="mt-2" type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} placeholder="Create password" required />
        </label>
        <label className="block text-sm font-semibold text-navy sm:col-span-2">
          Address
          <Input className="mt-2" value={form.address} onChange={(event) => updateField("address", event.target.value)} placeholder="Shop no, street" required />
        </label>
        <label className="block text-sm font-semibold text-navy">
          City
          <Input className="mt-2" value={form.city} onChange={(event) => updateField("city", event.target.value)} placeholder="Bengaluru" required />
        </label>
        <label className="block text-sm font-semibold text-navy">
          State
          <Input className="mt-2" value={form.state} onChange={(event) => updateField("state", event.target.value)} placeholder="Karnataka" required />
        </label>
        <label className="block text-sm font-semibold text-navy sm:col-span-2">
          Pincode
          <Input className="mt-2" value={form.pincode} onChange={(event) => updateField("pincode", event.target.value)} placeholder="560001" required />
        </label>

        <Button type="submit" className="w-full sm:col-span-2" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Submit verification request"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already verified?{" "}
        <Link className="font-semibold text-primary" to="/login">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}
