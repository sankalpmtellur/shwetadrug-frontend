import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CheckCircle2, Eye, EyeOff, KeyRound, MessageSquareText, Phone } from "lucide-react";
import { AuthLayout } from "../layouts/AuthLayout";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";

function onlyDigits(value: string, maxLength: number) {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  function sendOtp() {
    if (phone.length !== 10) {
      toast.error("Enter a valid 10 digit mobile number.");
      return;
    }
    setStep(2);
  }

  function verifyOtp() {
    if (otp.length !== 6) {
      toast.error("Enter the 6 digit OTP.");
      return;
    }
    setStep(3);
  }

  function changePassword() {
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    toast.success("Password changed. Please login.");
    navigate("/login", { replace: true });
  }

  return (
    <AuthLayout title="Reset password" subtitle="Verify your registered mobile number and create a new password.">
      <div className="mb-6 grid grid-cols-3 gap-2">
        {[
          { label: "Phone", icon: Phone },
          { label: "OTP", icon: MessageSquareText },
          { label: "Password", icon: KeyRound },
        ].map(({ label, icon: Icon }, index) => (
          <div key={label} className={`rounded-lg p-3 text-center text-xs font-bold ${step >= index + 1 ? "bg-primary text-white" : "bg-surface-soft text-muted"}`}>
            <Icon className="mx-auto mb-1 h-4 w-4" />
            {label}
          </div>
        ))}
      </div>

      {step === 1 ? (
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); sendOtp(); }}>
          <label className="block text-sm font-semibold text-navy">
            Registered Mobile Number
            <Input
              className="mt-2"
              inputMode="numeric"
              value={phone}
              onChange={(event) => setPhone(onlyDigits(event.target.value, 10))}
              placeholder="10 digit mobile number"
              required
            />
          </label>
          <Button type="submit" className="w-full" disabled={phone.length !== 10}>
            Send OTP
          </Button>
        </form>
      ) : null}

      {step === 2 ? (
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); verifyOtp(); }}>
          <div className="rounded-lg bg-emerald-50 p-4 text-sm font-semibold text-success">
            OTP sent to your registered mobile number.
          </div>
          <label className="block text-sm font-semibold text-navy">
            Enter OTP
            <Input
              className="mt-2"
              inputMode="numeric"
              value={otp}
              onChange={(event) => setOtp(onlyDigits(event.target.value, 6))}
              placeholder="6 digit OTP"
              required
            />
          </label>
          <Button type="submit" className="w-full" disabled={otp.length !== 6}>
            Verify OTP
          </Button>
        </form>
      ) : null}

      {step === 3 ? (
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); changePassword(); }}>
          <PasswordField
            label="New Password"
            value={password}
            show={showPassword}
            onToggle={() => setShowPassword((value) => !value)}
            onChange={setPassword}
            placeholder="Enter new password"
          />
          <PasswordField
            label="Confirm Password"
            value={confirmPassword}
            show={showConfirmPassword}
            onToggle={() => setShowConfirmPassword((value) => !value)}
            onChange={setConfirmPassword}
            placeholder="Confirm new password"
          />
          <Button type="submit" className="w-full">
            <CheckCircle2 className="h-4 w-4" />
            Change Password
          </Button>
        </form>
      ) : null}
    </AuthLayout>
  );
}

function PasswordField({
  label,
  value,
  show,
  onToggle,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  show: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block text-sm font-semibold text-navy">
      {label}
      <div className="relative mt-2">
        <Input className="pr-11" type={show ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-primary" aria-label={show ? "Hide password" : "Show password"}>
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </label>
  );
}
