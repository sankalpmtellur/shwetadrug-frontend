import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Eye, EyeOff, Send } from "lucide-react";
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
  password: "",
  confirmPassword: "",
};

const otpCooldownSeconds = 45;

export default function Signup() {
  const [form, setForm] = useState(initialForm);
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const normalizedPhone = form.phone.trim();
  const isMobileVerified = Boolean(otpToken) && verifiedPhone === normalizedPhone;

  useEffect(() => {
    if (otpCooldown <= 0) return;

    const timerId = window.setTimeout(() => {
      setOtpCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [otpCooldown]);

  function updateField(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    if (field === "phone") {
      setVerifiedPhone("");
      setOtpToken("");
      setOtp("");
    }
    if (field === "address") {
      setAddressError("");
    }
    if (field === "password" || field === "confirmPassword") {
      setPasswordError("");
    }
  }

  async function handleRequestOtp() {
    if (normalizedPhone.length < 8) {
      toast.error("Enter a valid mobile number.");
      return;
    }

    setIsRequestingOtp(true);
    try {
      await authService.requestSignupOtp({ phone: normalizedPhone });
      setOtpSent(true);
      setOtpCooldown(otpCooldownSeconds);
      toast.success("OTP sent to your mobile number.");
    } catch {
      toast.error("Could not send OTP. Please try again.");
    } finally {
      setIsRequestingOtp(false);
    }
  }

  async function handleVerifyOtp() {
    if (!/^\d{6}$/.test(otp.trim())) {
      toast.error("Enter the 6 digit OTP.");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const result = await authService.verifySignupOtp({ phone: normalizedPhone, otp: otp.trim() });
      setOtpToken(result.verificationToken);
      setVerifiedPhone(normalizedPhone);
      toast.success("Mobile verified.");
    } catch {
      setOtpToken("");
      setVerifiedPhone("");
      toast.error("Invalid or expired OTP.");
    } finally {
      setIsVerifyingOtp(false);
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

    if (form.password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setPasswordError("Passwords do not match.");
      toast.error("Passwords do not match.");
      return;
    }

    if (!isMobileVerified) {
      toast.error("Please verify your mobile number before creating the account.");
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
        password: form.password,
        confirmPassword: form.confirmPassword,
        otpVerificationToken: otpToken,
      });
      toast.success("Your account has been created successfully.");
      navigate("/login", { replace: true });
    } catch {
      toast.error("Could not create account");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout title="Create retailer account" subtitle="Create your account and start ordering medicines.">
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
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <Input className="min-w-0 flex-1" value={form.phone} onChange={(event) => updateField("phone", event.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10 digit mobile number" required />
            <Button
              type="button"
              className="shrink-0"
              variant={isMobileVerified ? "secondary" : "primary"}
              disabled={isRequestingOtp || isMobileVerified || otpCooldown > 0 || normalizedPhone.length < 8}
              onClick={() => void handleRequestOtp()}
            >
              {isMobileVerified ? <CheckCircle2 className="h-4 w-4" /> : <Send className="h-4 w-4" />}
              {isMobileVerified ? "Verified" : otpCooldown > 0 ? `Resend in ${otpCooldown}s` : otpSent ? "Resend OTP" : "Send OTP"}
            </Button>
          </div>
        </label>
        {otpSent && !isMobileVerified ? (
          <div className="rounded-lg border border-primary/20 bg-surface-soft p-4">
            <label className="block text-sm font-semibold text-navy">
              Mobile OTP
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <Input
                  className="min-w-0 flex-1"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter 6 digit OTP"
                  required
                />
                <Button type="button" className="shrink-0" disabled={isVerifyingOtp || otp.length !== 6} onClick={() => void handleVerifyOtp()}>
                  Verify OTP
                </Button>
              </div>
            </label>
          </div>
        ) : null}
        {isMobileVerified ? (
          <div className="flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            Mobile verified
          </div>
        ) : null}
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

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-navy">
            Password
            <div className="relative mt-2">
              <Input
                className="pr-11"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                placeholder="Minimum 8 characters"
                required
                minLength={8}
                autoComplete="new-password"
                aria-invalid={Boolean(passwordError)}
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
          <label className="block text-sm font-semibold text-navy">
            Confirm Password
            <div className="relative mt-2">
              <Input
                className="pr-11"
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(event) => updateField("confirmPassword", event.target.value)}
                placeholder="Re-enter password"
                required
                minLength={8}
                autoComplete="new-password"
                aria-invalid={Boolean(passwordError)}
                aria-describedby={passwordError ? "signup-password-error" : undefined}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-primary"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </label>
        </div>
        {passwordError ? <span id="signup-password-error" className="block text-xs font-semibold text-error">{passwordError}</span> : null}

        <Button type="submit" className="w-full" disabled={isLoading || !isMobileVerified}>
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
