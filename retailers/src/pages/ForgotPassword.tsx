import { useState } from "react";
import { CheckCircle2, KeyRound, MessageSquareText, Phone } from "lucide-react";
import { AuthLayout } from "../layouts/AuthLayout";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Verify your registered phone number with OTP, then set a new password."
    >
      <div className="mb-6 grid grid-cols-3 gap-2">
        {[
          { label: "Phone", icon: Phone },
          { label: "OTP", icon: MessageSquareText },
          { label: "Password", icon: KeyRound },
        ].map(({ label, icon: Icon }, index) => (
          <div
            key={label}
            className={`rounded-xl p-3 text-center text-xs font-bold ${
              step >= index + 1 ? "bg-primary text-white" : "bg-surface-soft text-muted"
            }`}
          >
            <Icon className="mx-auto mb-1 h-4 w-4" />
            {label}
          </div>
        ))}
      </div>

      {step === 1 ? (
        <form className="space-y-4">
          <label className="block text-sm font-semibold text-navy">
            Registered Phone Number
            <Input className="mt-2" placeholder="+91 98765 43210" />
          </label>
          <Button type="button" className="w-full" onClick={() => setStep(2)}>
            Send OTP
          </Button>
        </form>
      ) : null}

      {step === 2 ? (
        <form className="space-y-4">
          <div className="rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-success">
            OTP sent to your registered phone number.
          </div>
          <label className="block text-sm font-semibold text-navy">
            Enter OTP
            <Input className="mt-2" placeholder="6 digit OTP" />
          </label>
          <Button type="button" className="w-full" onClick={() => setStep(3)}>
            Verify OTP
          </Button>
        </form>
      ) : null}

      {step === 3 ? (
        <form className="space-y-4">
          <label className="block text-sm font-semibold text-navy">
            New Password
            <Input className="mt-2" type="password" placeholder="Enter new password" />
          </label>
          <label className="block text-sm font-semibold text-navy">
            Confirm Password
            <Input className="mt-2" type="password" placeholder="Confirm new password" />
          </label>
          <Button type="button" className="w-full">
            <CheckCircle2 className="h-4 w-4" />
            Change Password
          </Button>
        </form>
      ) : null}
    </AuthLayout>
  );
}
