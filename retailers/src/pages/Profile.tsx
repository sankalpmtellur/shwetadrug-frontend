import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  LockKeyhole,
  MapPin,
  Save,
  Store,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Input } from "../components/common/Input";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { formatDefaultAddress, profileService } from "../services/profileService";
import type { DefaultAddress, RetailerProfile } from "../types";

type ProfileForm = { name: string; phone: string };
type AddressForm = { address: string; city: string; state: string; pincode: string };

const emptyProfileForm: ProfileForm = { name: "", phone: "" };
const emptyAddressForm: AddressForm = { address: "", city: "", state: "", pincode: "" };

export default function Profile() {
  const [profile, setProfile] = useState<RetailerProfile | null>(null);
  const [defaultAddress, setDefaultAddress] = useState<DefaultAddress | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileForm>(emptyProfileForm);
  const [addressForm, setAddressForm] = useState<AddressForm>(emptyAddressForm);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  const [showPasswords, setShowPasswords] = useState({ currentPassword: false, newPassword: false, confirmNewPassword: false });
  const [editingSection, setEditingSection] = useState<"account" | "address" | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isAccountEditing = editingSection === "account";
  const isAddressEditing = editingSection === "address";

  const syncForms = useCallback((nextProfile: RetailerProfile, nextAddress: DefaultAddress | null) => {
    setProfileForm({ name: nextProfile.name, phone: nextProfile.phone ?? "" });
    setAddressForm({
      address: nextAddress?.line1 ?? "",
      city: nextAddress?.city ?? "",
      state: nextAddress?.state ?? "",
      pincode: nextAddress?.pincode ?? "",
    });
  }, []);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    setFieldErrors({});

    try {
      const nextProfile = await profileService.getProfile();
      const nextAddress = nextProfile.retailer?.defaultAddress ?? null;
      setProfile(nextProfile);
      setDefaultAddress(nextAddress);
      syncForms(nextProfile, nextAddress);
    } catch {
      setErrorMessage("Could not load profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [syncForms]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadProfile();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadProfile]);

  const profileRows = useMemo(
    () => [
      { label: "Owner name", value: profile?.name ?? "-" },
      { label: "Pharmacy name", value: profile?.retailer?.pharmacyName ?? "-" },
      { label: "Phone", value: profile?.phone ?? "-" },
      { label: "Email", value: profile?.email ?? "-", locked: true },
    ],
    [profile],
  );

  const addressRows = useMemo(
    () => [
      { label: "Address line", value: defaultAddress?.line1 ?? "-" },
      { label: "City", value: defaultAddress?.city ?? "-" },
      { label: "State", value: defaultAddress?.state ?? "-" },
      { label: "Pincode", value: defaultAddress?.pincode ?? "-" },
    ],
    [defaultAddress],
  );

  function startEditing(section: "account" | "address") {
    if (!profile) return;
    syncForms(profile, defaultAddress);
    setFieldErrors({});
    setEditingSection(section);
  }

  function cancelEditing() {
    if (profile) syncForms(profile, defaultAddress);
    setFieldErrors({});
    setEditingSection(null);
  }

  function validateProfile() {
    const errors: Record<string, string> = {};
    if (!profileForm.name.trim()) errors.name = "Owner name is required.";
    if (!/^\d{10}$/.test(profileForm.phone.trim())) errors.phone = "Enter a valid 10 digit mobile number.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function validateAddress() {
    const errors: Record<string, string> = {};
    if (!addressForm.address.trim()) errors.address = "Address line is required.";
    if (!addressForm.city.trim()) errors.city = "City is required.";
    if (!addressForm.state.trim()) errors.state = "State is required.";
    if (!/^\d{6}$/.test(addressForm.pincode.trim())) errors.pincode = "Enter a valid 6 digit pincode.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function saveProfile() {
    if (!validateProfile()) return;

    setIsSavingProfile(true);
    try {
      const nextProfile = await profileService.updateProfile({
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
      });
      setProfile(nextProfile);
      syncForms(nextProfile, defaultAddress);
      setEditingSection(null);
      toast.success("Account information updated.");
    } catch {
      toast.error("Could not update account information.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function saveAddress() {
    if (!validateAddress()) return;

    setIsSavingAddress(true);
    try {
      const nextAddress = await profileService.updateAddress({
        address: addressForm.address.trim(),
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        pincode: addressForm.pincode.trim(),
      });
      setDefaultAddress(nextAddress);
      if (profile) syncForms(profile, nextAddress);
      setEditingSection(null);
      toast.success("Address updated.");
    } catch {
      toast.error("Could not update address.");
    } finally {
      setIsSavingAddress(false);
    }
  }

  async function changePassword() {
    const errors: Record<string, string> = {};
    if (!passwordForm.currentPassword) errors.currentPassword = "Current password is required.";
    if (passwordForm.newPassword.length < 8) errors.newPassword = "New password must be at least 8 characters.";
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) errors.confirmNewPassword = "Passwords must match.";
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setIsChangingPassword(true);
    try {
      await profileService.changePassword(passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      setFieldErrors({});
      toast.success("Password changed successfully.");
    } catch {
      toast.error("Could not change password. Check your current password.");
    } finally {
      setIsChangingPassword(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-5">
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
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary text-white">
                    <Store className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-green-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {profile.retailer?.status ?? profile.status}
                    </p>
                    <h1 className="mt-2 break-words text-2xl font-black text-navy">{profile.retailer?.pharmacyName ?? profile.name}</h1>
                    <p className="mt-1 break-words text-sm font-semibold text-muted">{formatDefaultAddress(defaultAddress)}</p>
                  </div>
                </div>
              </div>
            </section>

            <ProfileSection
              title="Account Information"
              icon={<UserRound className="h-5 w-5" />}
              action={
                !isAccountEditing ? (
                  <Button type="button" variant="secondary" onClick={() => startEditing("account")}>
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </Button>
                ) : null
              }
            >
              {isAccountEditing ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Owner name" error={fieldErrors.name}>
                      <Input value={profileForm.name} onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))} />
                    </Field>
                    <Field label="Phone" error={fieldErrors.phone}>
                      <Input
                        inputMode="numeric"
                        value={profileForm.phone}
                        onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value.replace(/\D/g, "").slice(0, 10) }))}
                      />
                    </Field>
                    <ReadOnlyField label="Pharmacy name" value={profile.retailer?.pharmacyName ?? "-"} />
                    <ReadOnlyField label="Email" value={profile.email} />
                  </div>
                  <ActionRow onCancel={cancelEditing} onSave={saveProfile} isSaving={isSavingProfile} />
                </div>
              ) : (
                <DetailsGrid rows={profileRows} />
              )}
            </ProfileSection>

            <ProfileSection
              title="Business / Address Information"
              icon={<MapPin className="h-5 w-5" />}
              action={
                !isAddressEditing ? (
                  <Button type="button" variant="secondary" onClick={() => startEditing("address")}>
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </Button>
                ) : null
              }
            >
              {isAddressEditing ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Address line" error={fieldErrors.address} wide>
                      <Input value={addressForm.address} onChange={(event) => setAddressForm((current) => ({ ...current, address: event.target.value }))} />
                    </Field>
                    <Field label="City" error={fieldErrors.city}>
                      <Input value={addressForm.city} onChange={(event) => setAddressForm((current) => ({ ...current, city: event.target.value }))} />
                    </Field>
                    <Field label="State" error={fieldErrors.state}>
                      <Input value={addressForm.state} onChange={(event) => setAddressForm((current) => ({ ...current, state: event.target.value }))} />
                    </Field>
                    <Field label="Pincode" error={fieldErrors.pincode}>
                      <Input
                        inputMode="numeric"
                        value={addressForm.pincode}
                        onChange={(event) => setAddressForm((current) => ({ ...current, pincode: event.target.value.replace(/\D/g, "").slice(0, 6) }))}
                      />
                    </Field>
                  </div>
                  <ActionRow onCancel={cancelEditing} onSave={saveAddress} isSaving={isSavingAddress} />
                </div>
              ) : (
                <DetailsGrid rows={addressRows} />
              )}
            </ProfileSection>

            <ProfileSection title="Security" icon={<LockKeyhole className="h-5 w-5" />}>
              <div className="grid gap-4 lg:grid-cols-3">
                <PasswordInput label="Current password" value={passwordForm.currentPassword} error={fieldErrors.currentPassword} show={showPasswords.currentPassword} onToggle={() => setShowPasswords((current) => ({ ...current, currentPassword: !current.currentPassword }))} onChange={(value) => setPasswordForm((current) => ({ ...current, currentPassword: value }))} />
                <PasswordInput label="New password" value={passwordForm.newPassword} error={fieldErrors.newPassword} show={showPasswords.newPassword} onToggle={() => setShowPasswords((current) => ({ ...current, newPassword: !current.newPassword }))} onChange={(value) => setPasswordForm((current) => ({ ...current, newPassword: value }))} />
                <PasswordInput label="Confirm new password" value={passwordForm.confirmNewPassword} error={fieldErrors.confirmNewPassword} show={showPasswords.confirmNewPassword} onToggle={() => setShowPasswords((current) => ({ ...current, confirmNewPassword: !current.confirmNewPassword }))} onChange={(value) => setPasswordForm((current) => ({ ...current, confirmNewPassword: value }))} />
              </div>
              <div className="mt-4 flex justify-end">
                <Button type="button" className="w-full sm:w-auto" onClick={changePassword} disabled={isChangingPassword}>
                  {isChangingPassword ? "Changing..." : "Change Password"}
                </Button>
              </div>
            </ProfileSection>

            <ProfileSection title="Account Status" icon={<Building2 className="h-5 w-5" />}>
              <DetailsGrid
                rows={[
                  { label: "Retailer code", value: profile.retailer?.code ?? "-" },
                  { label: "GST number", value: profile.retailer?.gstNumber ?? "-" },
                  { label: "Drug license", value: profile.retailer?.drugLicenseNumber ?? "-" },
                  { label: "Status", value: profile.retailer?.status ?? profile.status },
                ]}
              />
            </ProfileSection>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

function ProfileSection({ title, icon, action, children }: { title: string; icon: ReactNode; action?: ReactNode; children: ReactNode }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface-strong text-primary">{icon}</div>
          <h2 className="text-lg font-black text-navy">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}

function DetailsGrid({ rows }: { rows: Array<{ label: string; value: string; locked?: boolean }> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {rows.map((row) => (
        <ReadOnlyField key={row.label} label={row.label} value={row.value} locked={row.locked} />
      ))}
    </div>
  );
}

function Field({ label, error, wide, children }: { label: string; error?: string; wide?: boolean; children: ReactNode }) {
  return (
    <label className={`block text-sm font-semibold text-navy ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-1 text-xs font-bold text-error">{error}</p> : null}
    </label>
  );
}

function ReadOnlyField({ label, value, locked }: { label: string; value: string; locked?: boolean }) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-surface-soft px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">{label}</p>
        {locked ? <LockKeyhole className="h-3.5 w-3.5 shrink-0 text-muted" /> : null}
      </div>
      <p className="mt-1 break-words text-sm font-bold text-navy">{value}</p>
    </div>
  );
}

function ActionRow({ onCancel, onSave, isSaving }: { onCancel: () => void; onSave: () => void; isSaving: boolean }) {
  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button type="button" variant="ghost" onClick={onCancel} disabled={isSaving}>
        <X className="h-4 w-4" />
        Cancel
      </Button>
      <Button type="button" onClick={onSave} disabled={isSaving}>
        <Save className="h-4 w-4" />
        {isSaving ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}

function PasswordInput({ label, value, error, show, onToggle, onChange }: { label: string; value: string; error?: string; show: boolean; onToggle: () => void; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-semibold text-navy">
      {label}
      <div className="relative mt-2">
        <Input className="pr-11" type={show ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-primary" aria-label={show ? `Hide ${label}` : `Show ${label}`}>
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {error ? <p className="mt-1 text-xs font-bold text-error">{error}</p> : null}
    </label>
  );
}
