import { Link } from "react-router-dom";
import { ArrowLeft, Phone } from "lucide-react";
import { AuthLayout } from "../layouts/AuthLayout";

export default function ForgotPassword() {
  return (
    <AuthLayout title="Password reset" subtitle="Please contact admin/owner to reset your password.">
      <div className="space-y-5">
        <div className="rounded-lg bg-surface-soft p-5 text-sm leading-6 text-muted">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
            <Phone className="h-5 w-5" />
          </div>
          Retailer password reset is handled manually for launch. Admin/owner can provide access support, and you can change your password from Profile after login.
        </div>

        <Link className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 focus-ring" to="/login">
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
      </div>
    </AuthLayout>
  );
}
