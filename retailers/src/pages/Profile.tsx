import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Building2, Edit3, Eye, EyeOff, LockKeyhole, Mail, MapPin, Save, UserRound, X } from "lucide-react";
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
  const [addressForm, setAddressForm] = useState({
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });
  const [errorMessage, setErrorMessage] = useState("");

  async function loadProfile() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const nextProfile = await profileService.getProfile();
      const nextAddress = nextProfile.retailer?.defaultAddress ?? null;

      setProfile(nextProfile);
      setProfileForm({
        name: nextProfile.name,
        phone: nextProfile.phone ?? "",
      });
      setDefaultAddress(nextAddress);
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

  function cancelEdit() {
    if (!profile) return;
    setProfileForm({
      name: profile.name,
      phone: profile.phone ?? "",
    });
    setAddressForm({
      address: defaultAddress?.line1 ?? "",
      city: defaultAddress?.city ?? "",
      state: defaultAddress?.state ?? "",
      pincode: defaultAddress?.pincode ?? "",
    });
    setIsEditing(false);
  }

  async function saveChanges() {
    if (!profileForm.name.trim() || !profileForm.phone.trim()) {
      toast.error("Please enter name and mobile number.");
      return;
    }
    if (!addressForm.address.trim() || !addressForm.city.trim() || !addressForm.state.trim() || !addressForm.pincode.trim()) {
      toast.error("Please enter complete address details.");
      return;
    }

    setIsSaving(true);

    try {
      const [nextProfile, nextAddress] = await Promise.all([
        profileService.updateProfile({
          name: profileForm.name.trim(),
          phone: profileForm.phone.trim(),
        }),
        profileService.updateAddress({
          address: addressForm.address.trim(),
          city: addressForm.city.trim(),
          state: addressForm.state.trim(),
          pincode: addressForm.pincode.trim(),
        }),
      ]);
      setProfile(nextProfile);
      setDefaultAddress(nextAddress);
      setIsEditing(false);
      toast.success("Profile updated");
    } catch {
      toast.error("Could not update profile");
    } finally {
      setIsSaving(false);
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
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
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
            <Button type="button" className="mt-3" onClick={loadProfile}>
              Retry
            </Button>
          </div>
        ) : null}

        {!isLoading && !errorMessage && !profile ? (
          <Card className="p-8 text-center">
            <h2 className="text-lg font-black text-navy">Profile not available</h2>
            <p className="mt-2 text-sm text-muted">Please login again to view your retailer profile.</p>
          </Card>
        ) : null}

        {!isLoading && !errorMessage && profile ? (
          <>
            <section className="rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-surface-strong text-primary sm:h-16 sm:w-16">
                    <UserRound className="h-7 w-7" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-widest text-primary">
                      {profile.retailer?.status === "ACTIVE" ? "Verified Retailer" : "Retailer"}
                    </p>
                    <h1 className="mt-1 truncate text-2xl font-black text-navy sm:text-3xl">
                      {profile.retailer?.pharmacyName ?? profile.name}
                    </h1>
                  </div>
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button type="button" variant="ghost" onClick={cancelEdit} disabled={isSaving}>
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                      <Button type="button" onClick={saveChanges} disabled={isSaving}>
                        <Save className="h-4 w-4" />
                        {isSaving ? "Saving..." : "Save"}
                      </Button>
                    </>
                  ) : (
                    <Button type="button" onClick={() => setIsEditing(true)}>
                      <Edit3 className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </section>

            <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
              <Card className="p-5">
                <h2 className="text-xl font-black text-navy">Account Details</h2>
                <p className="mt-1 text-sm font-semibold text-muted">Business identity and primary delivery address.</p>
                <div className="mt-5 grid gap-3">
                  <Info icon={<Building2 />} label="Business Name" value={profile.retailer?.pharmacyName ?? "Not available"} />
                  <Info icon={<Mail />} label="Email" value={profile.email} />
                  <Info icon={<MapPin />} label="Default Address" value={formatDefaultAddress(defaultAddress)} />
                </div>
              </Card>

              <Card className="p-5 sm:p-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-xl font-black text-navy">{isEditing ? "Edit Profile & Address" : "Profile Information"}</h2>
                    <p className="text-sm font-semibold text-muted">Keep owner contact and dispatch address accurate.</p>
                  </div>
                </div>

                <div className="mt-5 space-y-6">
                  <section>
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted">Profile Information</h3>
                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      <label className="block text-sm font-semibold text-navy">
                        Owner Name
                        <Input className="mt-2" value={profileForm.name} disabled={!isEditing} onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))} />
                      </label>
                      <label className="block text-sm font-semibold text-navy">
                        Mobile
                        <Input className="mt-2" value={profileForm.phone} disabled={!isEditing} onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value.replace(/\D/g, "").slice(0, 10) }))} />
                      </label>
                    </div>
                  </section>

                  <section className="border-t border-border pt-5">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted">Address Information</h3>
                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      <label className="block text-sm font-semibold text-navy sm:col-span-2">
                        Address
                        <Input className="mt-2" value={addressForm.address} disabled={!isEditing} onChange={(event) => setAddressForm((current) => ({ ...current, address: event.target.value }))} />
                      </label>
                      <label className="block text-sm font-semibold text-navy">
                        City
                        <Input className="mt-2" value={addressForm.city} disabled={!isEditing} onChange={(event) => setAddressForm((current) => ({ ...current, city: event.target.value }))} />
                      </label>
                      <label className="block text-sm font-semibold text-navy">
                        State
                        <Input className="mt-2" value={addressForm.state} disabled={!isEditing} onChange={(event) => setAddressForm((current) => ({ ...current, state: event.target.value }))} />
                      </label>
                      <label className="block text-sm font-semibold text-navy sm:col-span-2">
                        Pincode
                        <Input className="mt-2" value={addressForm.pincode} disabled={!isEditing} onChange={(event) => setAddressForm((current) => ({ ...current, pincode: event.target.value.replace(/\D/g, "").slice(0, 6) }))} />
                      </label>
                    </div>
                  </section>
                </div>
              </Card>
            </div>

            <Card className="p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface-strong text-primary">
                  <LockKeyhole className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-navy">Change Password</h2>
                  <p className="mt-1 text-sm font-semibold text-muted">Use your current password before setting a new one.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                <PasswordInput
                  label="Current Password"
                  value={passwordForm.currentPassword}
                  show={showPasswords.currentPassword}
                  onToggle={() => setShowPasswords((current) => ({ ...current, currentPassword: !current.currentPassword }))}
                  onChange={(value) => setPasswordForm((current) => ({ ...current, currentPassword: value }))}
                />
                <PasswordInput
                  label="New Password"
                  value={passwordForm.newPassword}
                  show={showPasswords.newPassword}
                  onToggle={() => setShowPasswords((current) => ({ ...current, newPassword: !current.newPassword }))}
                  onChange={(value) => setPasswordForm((current) => ({ ...current, newPassword: value }))}
                />
                <PasswordInput
                  label="Confirm New Password"
                  value={passwordForm.confirmNewPassword}
                  show={showPasswords.confirmNewPassword}
                  onToggle={() => setShowPasswords((current) => ({ ...current, confirmNewPassword: !current.confirmNewPassword }))}
                  onChange={(value) => setPasswordForm((current) => ({ ...current, confirmNewPassword: value }))}
                />
              </div>
              <div className="mt-4 flex justify-end">
                <Button type="button" onClick={changePassword} disabled={isChangingPassword}>
                  {isChangingPassword ? "Changing..." : "Change Password"}
                </Button>
              </div>
            </Card>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

function Info({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-soft p-4">
      <div className="mb-3 text-primary">{icon}</div>
      <p className="text-xs font-bold uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 break-words font-bold text-navy">{value}</p>
    </div>
  );
}

function PasswordInput({
  label,
  value,
  show,
  onToggle,
  onChange,
}: {
  label: string;
  value: string;
  show: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-semibold text-navy">
      {label}
      <div className="relative mt-2">
        <Input
          className="pr-11"
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-primary"
          aria-label={show ? `Hide ${label}` : `Show ${label}`}
        >
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </label>
  );
}
