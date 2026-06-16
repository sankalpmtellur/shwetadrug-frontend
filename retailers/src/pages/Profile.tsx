import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Building2, Mail, MapPin, Phone, ShieldCheck, UserRound } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
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
    void loadProfile();
  }, []);

  async function saveProfile() {
    if (!profileForm.name.trim() || !profileForm.phone.trim()) {
      toast.error("Please enter name and mobile number.");
      return;
    }

    setIsSavingProfile(true);

    try {
      const nextProfile = await profileService.updateProfile({
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
      });
      setProfile(nextProfile);
      toast.success("Profile updated");
    } catch {
      toast.error("Could not update profile");
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
      setAddressForm({
        address: nextAddress?.line1 ?? "",
        city: nextAddress?.city ?? "",
        state: nextAddress?.state ?? "",
        pincode: nextAddress?.pincode ?? "",
      });
      toast.success("Delivery address updated");
    } catch {
      toast.error("Could not update address");
    } finally {
      setIsSavingAddress(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-primary">
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        {isLoading ? (
          <div className="h-48 animate-pulse rounded-3xl bg-white shadow-sm" />
        ) : null}

        {errorMessage ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-semibold text-error">
            <p>{errorMessage}</p>
            <Button type="button" className="mt-3" onClick={loadProfile}>
              Retry
            </Button>
          </div>
        ) : null}

        {!isLoading && !errorMessage && !profile ? (
          <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-black text-navy">Profile not available</h2>
            <p className="mt-2 text-sm text-muted">Please login again to view your retailer profile.</p>
          </div>
        ) : null}

        {!isLoading && !errorMessage && profile ? (
          <>
        <section className="rounded-3xl border border-border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-surface-strong text-primary">
                <UserRound className="h-8 w-8" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-primary">
                  {profile.retailer?.status === "ACTIVE" ? "Verified Retailer" : "Retailer"}
                </p>
                <h1 className="mt-1 text-3xl font-black text-navy">
                  {profile.retailer?.pharmacyName ?? profile.name}
                </h1>
                <p className="text-sm text-muted">Retailer Code: {profile.retailer?.code ?? "Not available"}</p>
              </div>
            </div>
            <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-success">
              {profile.status === "ACTIVE" ? "Account Active" : profile.status}
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <Card className="p-6">
            <h2 className="text-xl font-black text-navy">Account Details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Info icon={<Building2 />} label="Business Name" value={profile.retailer?.pharmacyName ?? "Not available"} />
              <Info icon={<UserRound />} label="Owner" value={profile.name} />
              <Info icon={<Mail />} label="Email" value={profile.email} />
              <Info icon={<Phone />} label="Mobile" value={profile.phone ?? "Not available"} />
              <Info
                icon={<ShieldCheck />}
                label="Licence/GST"
                value={[profile.retailer?.drugLicenseNumber, profile.retailer?.gstNumber].filter(Boolean).join(" / ") || "Not available"}
              />
              <Info icon={<MapPin />} label="Address" value={formatDefaultAddress(defaultAddress)} />
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-surface-strong text-primary">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-navy">Update Profile</h2>
                <p className="text-sm text-muted">Keep owner name and mobile number current.</p>
              </div>
            </div>
            <form className="space-y-4">
              <label className="block text-sm font-semibold text-navy">
                Owner Name
                <Input className="mt-2" value={profileForm.name} onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))} />
              </label>
              <label className="block text-sm font-semibold text-navy">
                Mobile
                <Input className="mt-2" value={profileForm.phone} onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))} />
              </label>
              <Button type="button" className="w-full" disabled={isSavingProfile} onClick={saveProfile}>
                {isSavingProfile ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </Card>
        </div>

        <Card className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-surface-strong text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-navy">Address Management</h2>
              <p className="text-sm text-muted">Update the default delivery address used for orders.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface-soft p-4">
            <p className="text-sm font-black text-primary">Default Address</p>
            <p className="mt-1 text-sm text-muted">{formatDefaultAddress(defaultAddress)}</p>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr_auto]">
            <Input
              placeholder="Address"
              value={addressForm.address}
              onChange={(event) => setAddressForm((current) => ({ ...current, address: event.target.value }))}
            />
            <Input placeholder="City" value={addressForm.city} onChange={(event) => setAddressForm((current) => ({ ...current, city: event.target.value }))} />
            <Input placeholder="State" value={addressForm.state} onChange={(event) => setAddressForm((current) => ({ ...current, state: event.target.value }))} />
            <Input placeholder="Pincode" value={addressForm.pincode} onChange={(event) => setAddressForm((current) => ({ ...current, pincode: event.target.value }))} />
            <Button type="button" onClick={saveAddress} disabled={isSavingAddress}>
              {isSavingAddress ? "Saving..." : "Save"}
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
    <div className="rounded-2xl bg-surface-soft p-4">
      <div className="mb-3 text-primary">{icon}</div>
      <p className="text-xs font-bold uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 font-bold text-navy">{value}</p>
    </div>
  );
}
