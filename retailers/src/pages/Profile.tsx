import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Building2, CheckCircle2, LockKeyhole, MapPin, Store, UserRound } from "lucide-react";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { formatDefaultAddress, profileService } from "../services/profileService";
import type { DefaultAddress, RetailerProfile } from "../types";

export default function Profile() {
  const [profile, setProfile] = useState<RetailerProfile | null>(null);
  const [defaultAddress, setDefaultAddress] = useState<DefaultAddress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const nextProfile = await profileService.getProfile();
      const nextAddress = nextProfile.retailer?.defaultAddress ?? null;
      setProfile(nextProfile);
      setDefaultAddress(nextAddress);
    } catch {
      setErrorMessage("Could not load profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      { label: "Email", value: profile?.email ?? "-" },
    ],
    [profile],
  );

  const addressRows = useMemo(
    () => [
      { label: "Address", value: formatDefaultAddress(defaultAddress) },
      { label: "City", value: defaultAddress?.city ?? "-" },
      { label: "State", value: defaultAddress?.state ?? "-" },
      { label: "Pincode", value: defaultAddress?.pincode ?? "-" },
    ],
    [defaultAddress],
  );

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
            </section>

            <ProfileSection title="Account Information" icon={<UserRound className="h-5 w-5" />}>
              <DetailsGrid rows={profileRows} />
            </ProfileSection>

            <ProfileSection title="Business / Address Information" icon={<MapPin className="h-5 w-5" />}>
              <DetailsGrid rows={addressRows} />
            </ProfileSection>

            <ProfileSection title="Security" icon={<LockKeyhole className="h-5 w-5" />}>
              <p className="rounded-lg border border-border bg-surface-soft px-4 py-3 text-sm font-semibold leading-6 text-muted">
                Password changes are handled by the distributor team for this release.
              </p>
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

function ProfileSection({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface-strong text-primary">{icon}</div>
        <h2 className="text-lg font-black text-navy">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

function DetailsGrid({ rows }: { rows: Array<{ label: string; value: string }> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {rows.map((row) => (
        <ReadOnlyField key={row.label} label={row.label} value={row.value} />
      ))}
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-surface-soft px-3 py-2.5">
      <p className="text-xs font-bold uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-navy">{value}</p>
    </div>
  );
}
