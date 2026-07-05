import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Building2, CheckCircle2, Eye, EyeOff, IdCard, LockKeyhole, Mail, MapPin, Phone, Save, Store, UserRound } from "lucide-react";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Input } from "../components/common/Input";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { formatDefaultAddress, profileService } from "../services/profileService";
import type { DefaultAddress, RetailerProfile } from "../types";

export default function Profile() {
  const [profile, setProfile] = useState<RetailerProfile | null>(null);
  const [defaultAddress, setDefaultAddress] = useState<DefaultAddress | null>(null);
  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [addressForm, setAddressForm] = useState({ address: "", city: "", state: "", pincode: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  const [showPasswords, setShowPasswords] = useState({ currentPassword: false, newPassword: false, confirmNewPassword: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadProfile() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const nextProfile = await profileService.getProfile();
      const nextAddress = nextProfile.retailer?.defaultAddress ?? null;
      setProfile(nextProfile);
      setDefaultAddress(nextAddress);
      setProfileForm({ name: nextProfile.name, phone: nextProfile.phone ?? "" });
      setAddressForm({
        address: nextAddress?.line1 ?? "",
        city: nextAddress?.city ?? "",
        state: nextAddress?.state ?? "",
        pincode: nextAddress?.pincode ?? "",
      });
    } catch {
      setErrorMessage("Could not load profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadProfile();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  async function saveProfile() {
    if (!profileForm.name.trim() || !profileForm.phone.trim()) {
      toast.error("Please enter owner name and mobile number.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const nextProfile = await profileService.updateProfile({
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
      });
      setProfile(nextProfile);
      toast.success("Personal information updated");
    } catch {
      toast.error("Could not update personal information");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function saveAddress() {
    if (!addressForm.address.trim() || !addressForm.city.trim() || !addressForm.state.trim() || !addressForm.pincode.trim()) {
      toast.error("Please enter complete address details.");
      return;
    }

    setIsSavingAddress(true);
    try {
      const nextAddress = await profileService.updateAddress({
        address: addressForm.address.trim(),
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        pincode: addressForm.pincode.trim(),
      });
      setDefaultAddress(nextAddress);
      toast.success("Address updated");
    } catch {
      toast.error("Could not update address");
    } finally {
      setIsSavingAddress(false);
    }
  }

  async function changePassword() {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmNewPassword) {
      toast.error("Please enter all password fields.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      toast.error("New password and confirm password must match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await profileService.changePassword(passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      toast.success("Password changed successfully");
    } catch {
      toast.error("Could not change password. Check your current password.");
    } finally {
      setIsChangingPassword(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-5">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-primary">
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        {isLoading ? <div className="h-48 animate-pulse rounded-lg bg-white shadow-sm" /> : null}

        {errorMessage ? (
          <div className="rounded-lg border border-red-100 bg-red-50 p-5 text-sm font-semibold text-error">
            <p>{errorMessage}</p>
            <Button type="button" className="mt-3" onClick={() => void loadProfile()}>
              Retry
            </Button>
          </div>
        ) : null}

        {!isLoading && !errorMessage && profile ? (
          <>
            <section className="rounded-lg border border-border bg-white p-4 shadow-sm sm:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary text-white sm:h-16 sm:w-16">
                    <Store className="h-7 w-7" />
                  </div>
                  <div className="min-w-0">
                    <p className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-green-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {profile.retailer?.status ?? "Retailer"}
                    </p>
                    <h1 className="mt-2 break-words text-xl font-black text-navy sm:text-3xl">{profile.retailer?.pharmacyName ?? profile.name}</h1>
                    <p className="mt-1 break-words text-sm font-semibold text-muted">{profile.name}</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
                  <QuickFact icon={<Phone className="h-4 w-4" />} label="Mobile" value={profileForm.phone || "Not available"} />
                  <QuickFact icon={<Mail className="h-4 w-4" />} label="Email" value={profile.email} />
                  <QuickFact icon={<MapPin className="h-4 w-4" />} label="City" value={defaultAddress?.city ?? "Not set"} />
                </div>
              </div>
            </section>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-5">
                <ProfileSection title="Personal Information" icon={<UserRound className="h-5 w-5" />}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Owner Name">
                      <Input value={profileForm.name} onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))} />
                    </Field>
                    <Field label="Mobile Number">
                      <Input value={profileForm.phone} onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value.replace(/\D/g, "").slice(0, 10) }))} />
                    </Field>
                    <ReadOnlyField label="Email" value={profile.email} />
                  </div>
                  <div className="mt-4 flex">
                    <Button type="button" className="w-full sm:w-auto sm:ml-auto" onClick={saveProfile} disabled={isSavingProfile}>
                      <Save className="h-4 w-4" />
                      {isSavingProfile ? "Saving..." : "Save Personal Info"}
                    </Button>
                  </div>
                </ProfileSection>

                <ProfileSection title="Address" icon={<MapPin className="h-5 w-5" />}>
                  <div className="mb-4 rounded-lg border border-primary/20 bg-surface-soft p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-muted">Saved Address</p>
                    <p className="mt-2 break-words text-sm font-bold leading-6 text-navy">{formatDefaultAddress(defaultAddress)}</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Address Line" wide>
                      <Input value={addressForm.address} onChange={(event) => setAddressForm((current) => ({ ...current, address: event.target.value }))} />
                    </Field>
                    <Field label="City">
                      <Input value={addressForm.city} onChange={(event) => setAddressForm((current) => ({ ...current, city: event.target.value }))} />
                    </Field>
                    <Field label="State">
                      <Input value={addressForm.state} onChange={(event) => setAddressForm((current) => ({ ...current, state: event.target.value }))} />
                    </Field>
                    <Field label="Pincode">
                      <Input value={addressForm.pincode} onChange={(event) => setAddressForm((current) => ({ ...current, pincode: event.target.value.replace(/\D/g, "").slice(0, 6) }))} />
                    </Field>
                  </div>
                  <div className="mt-4 flex">
                    <Button type="button" className="w-full sm:w-auto sm:ml-auto" onClick={saveAddress} disabled={isSavingAddress}>
                      <Save className="h-4 w-4" />
                      {isSavingAddress ? "Saving..." : "Save Address"}
                    </Button>
                  </div>
                </ProfileSection>

                <ProfileSection title="Security" icon={<LockKeyhole className="h-5 w-5" />}>
                  <div className="mb-4">
                    <h3 className="text-base font-black text-navy">Change Password</h3>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-3">
                    <PasswordInput label="Current Password" value={passwordForm.currentPassword} show={showPasswords.currentPassword} onToggle={() => setShowPasswords((current) => ({ ...current, currentPassword: !current.currentPassword }))} onChange={(value) => setPasswordForm((current) => ({ ...current, currentPassword: value }))} />
                    <PasswordInput label="New Password" value={passwordForm.newPassword} show={showPasswords.newPassword} onToggle={() => setShowPasswords((current) => ({ ...current, newPassword: !current.newPassword }))} onChange={(value) => setPasswordForm((current) => ({ ...current, newPassword: value }))} />
                    <PasswordInput label="Confirm New Password" value={passwordForm.confirmNewPassword} show={showPasswords.confirmNewPassword} onToggle={() => setShowPasswords((current) => ({ ...current, confirmNewPassword: !current.confirmNewPassword }))} onChange={(value) => setPasswordForm((current) => ({ ...current, confirmNewPassword: value }))} />
                  </div>
                  <div className="mt-4 flex">
                    <Button type="button" className="w-full sm:w-auto sm:ml-auto" onClick={changePassword} disabled={isChangingPassword}>
                      {isChangingPassword ? "Changing..." : "Change Password"}
                    </Button>
                  </div>
                </ProfileSection>
              </div>

              <aside className="space-y-5">
                <ProfileSection title="Pharmacy Information" icon={<Building2 className="h-5 w-5" />}>
                  <div className="grid gap-3">
                    <Info icon={<Store className="h-5 w-5" />} label="Pharmacy Name" value={profile.retailer?.pharmacyName ?? "Not available"} />
                    <Info icon={<IdCard className="h-5 w-5" />} label="GST Number" value={profile.retailer?.gstNumber ?? "Not available"} />
                  </div>
                </ProfileSection>

                <ProfileSection title="Account Information" icon={<Mail className="h-5 w-5" />}>
                  <div className="grid gap-3">
                    <Info icon={<CheckCircle2 className="h-5 w-5" />} label="Account Status" value={profile.retailer?.status ?? profile.status} />
                    <Info icon={<IdCard className="h-5 w-5" />} label="Retailer Code" value={profile.retailer?.code ?? "Not available"} />
                    <Info icon={<IdCard className="h-5 w-5" />} label="Drug License" value={profile.retailer?.drugLicenseNumber ?? "Not available"} />
                  </div>
                </ProfileSection>
              </aside>
            </div>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

function ProfileSection({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Card className="p-4 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface-strong text-primary">{icon}</div>
        <div>
          <h2 className="text-lg font-black text-navy">{title}</h2>
        </div>
      </div>
      {children}
    </Card>
  );
}

function QuickFact({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-surface-soft p-3">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <p className="mt-1 truncate text-sm font-black text-navy" title={value}>{value}</p>
    </div>
  );
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return (
    <label className={`block text-sm font-semibold text-navy ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Info({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3 rounded-lg bg-surface-soft p-4">
      <div className="mt-0.5 shrink-0 text-primary">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">{label}</p>
        <p className="mt-1 break-words font-bold text-navy">{value}</p>
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-soft px-3 py-2.5">
      <p className="text-xs font-bold uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-navy">{value}</p>
    </div>
  );
}

function PasswordInput({ label, value, show, onToggle, onChange }: { label: string; value: string; show: boolean; onToggle: () => void; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-semibold text-navy">
      {label}
      <div className="relative mt-2">
        <Input className="pr-11" type={show ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-primary" aria-label={show ? `Hide ${label}` : `Show ${label}`}>
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </label>
  );
}
