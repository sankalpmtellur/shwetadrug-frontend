import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, MapPin, UserRound } from "lucide-react";
import { AuthLayout } from "../layouts/AuthLayout";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { getApiErrorMessage } from "../lib/api";
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
  password: "",
  confirmPassword: "",
};

const steps = [
  { id: 0, label: "Basic", icon: UserRound },
  { id: 1, label: "Address", icon: MapPin },
  { id: 2, label: "Security", icon: LockKeyhole },
];

export default function Signup() {
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(0);
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const normalizedPhone = form.phone.trim();

  const passwordSummary = useMemo(() => {
    const checks = [
      { label: "At least 8 characters", valid: form.password.length >= 8 },
      { label: "Confirmation matches", valid: Boolean(form.confirmPassword) && form.password === form.confirmPassword },
    ];
    return checks;
  }, [form.confirmPassword, form.password]);

  function updateField(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setFormError("");
  }

  function validateCurrentStep() {
    if (step === 0) {
      if (!form.ownerName.trim() || !form.pharmacyName.trim() || normalizedPhone.length < 8) {
        setFormError("Enter owner, pharmacy, and mobile details.");
        return false;
      }
    }

    if (step === 1) {
      if (!form.address.trim() || form.address.trim().length < 5 || !form.city.trim() || !form.state.trim() || !form.pincode.trim()) {
        setFormError("Enter complete address details.");
        return false;
      }
    }

    if (step === 2) {
      if (form.password.length < 8) {
        setFormError("Password must be at least 8 characters.");
        return false;
      }
      if (form.password !== form.confirmPassword) {
        setFormError("Passwords do not match.");
        return false;
      }
    }

    setFormError("");
    return true;
  }

  function goNext() {
    if (!validateCurrentStep()) return;
    setStep((current) => Math.min(steps.length - 1, current + 1));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateCurrentStep()) return;

    setIsLoading(true);
    try {
      await authService.retailerSignup({
        ownerName: form.ownerName.trim(),
        pharmacyName: form.pharmacyName.trim(),
        phone: normalizedPhone,
        email: form.email.trim(),
        gstNumber: form.gstNumber.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      toast.success("Your account has been created successfully.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not create account"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout title="Create retailer account" subtitle="Complete three quick steps to start ordering medicines.">
      <div className="mb-6">
        <div className="grid grid-cols-3 gap-2">
          {steps.map(({ id, label, icon: Icon }) => {
            const active = id === step;
            const done = id < step;
            return (
              <div key={id} className={`rounded-lg border px-3 py-3 ${active ? "border-primary bg-primary text-white" : done ? "border-green-100 bg-green-50 text-green-700" : "border-border bg-white text-muted"}`}>
                <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wide sm:justify-start">
                  {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  <span>{label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {step === 0 ? (
          <section className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Owner Name">
                <Input value={form.ownerName} onChange={(event) => updateField("ownerName", event.target.value)} placeholder="Owner full name" required />
              </Field>
              <Field label="Pharmacy Name">
                <Input value={form.pharmacyName} onChange={(event) => updateField("pharmacyName", event.target.value)} placeholder="Your pharmacy name" required />
              </Field>
            </div>

            <Field label="Mobile Number">
              <Input className="min-w-0 flex-1" value={form.phone} onChange={(event) => updateField("phone", event.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10 digit mobile number" required />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email Address">
                <Input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="owner@gmail.com" />
              </Field>
              <Field label="GST Number" hint="optional">
                <Input value={form.gstNumber} onChange={(event) => updateField("gstNumber", event.target.value.toUpperCase())} placeholder="GST number if available" />
              </Field>
            </div>
          </section>
        ) : null}

        {step === 1 ? (
          <section className="space-y-4">
            <Field label="Address Line">
              <Input value={form.address} onChange={(event) => updateField("address", event.target.value)} placeholder="Shop number, building, street" required minLength={5} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="City">
                <Input value={form.city} onChange={(event) => updateField("city", event.target.value)} placeholder="City" required />
              </Field>
              <Field label="State">
                <Input value={form.state} onChange={(event) => updateField("state", event.target.value)} placeholder="State" required />
              </Field>
              <Field label="Pincode">
                <Input value={form.pincode} onChange={(event) => updateField("pincode", event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Pincode" required />
              </Field>
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="space-y-4">
            <div className="rounded-lg border border-border bg-surface-soft p-4 text-sm text-muted">
              <p className="font-black text-navy">Password requirements</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {passwordSummary.map((item) => (
                  <div key={item.label} className={`flex items-center gap-2 font-semibold ${item.valid ? "text-green-700" : "text-muted"}`}>
                    <CheckCircle2 className="h-4 w-4" />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <PasswordField label="Password" value={form.password} show={showPassword} onToggle={() => setShowPassword((value) => !value)} onChange={(value) => updateField("password", value)} />
              <PasswordField label="Confirm Password" value={form.confirmPassword} show={showConfirmPassword} onToggle={() => setShowConfirmPassword((value) => !value)} onChange={(value) => updateField("confirmPassword", value)} />
            </div>
          </section>
        ) : null}

        {formError ? <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-error">{formError}</p> : null}

        <div className="grid gap-3 sm:grid-cols-2">
          {step > 0 ? (
            <Button type="button" variant="secondary" onClick={() => setStep((current) => current - 1)} disabled={isLoading}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          ) : (
            <Link className="inline-flex items-center justify-center rounded-lg bg-surface-strong px-4 py-2.5 text-sm font-semibold text-primary" to="/login">
              Already have an account
            </Link>
          )}
          {step < steps.length - 1 ? (
            <Button type="button" onClick={goNext}>
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          )}
        </div>
      </form>
    </AuthLayout>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-navy">
      {label} {hint ? <span className="font-medium text-muted">({hint})</span> : null}
      <div className="mt-2">{children}</div>
    </label>
  );
}

function PasswordField({ label, value, show, onToggle, onChange }: { label: string; value: string; show: boolean; onToggle: () => void; onChange: (value: string) => void }) {
  return (
    <Field label={label}>
      <div className="relative">
        <Input className="pr-11" type={show ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} placeholder="Minimum 8 characters" required minLength={8} autoComplete="new-password" />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-primary" aria-label={show ? `Hide ${label}` : `Show ${label}`}>
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </Field>
  );
}
