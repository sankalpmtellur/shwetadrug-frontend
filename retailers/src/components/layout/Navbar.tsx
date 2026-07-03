import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ChevronDown,
  History,
  LogOut,
  MapPin,
  ShoppingCart,
  User,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "../common/Button";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { formatDefaultAddress, profileService } from "../../services/profileService";
import type { DefaultAddress } from "../../types";

export function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState<DefaultAddress | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const { count } = useCart();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const deliveryAddressText = formatDefaultAddress(defaultAddress);

  useEffect(() => {
    async function loadAddress() {
      try {
        const profile = await profileService.getProfile();
        setDefaultAddress(profile.retailer?.defaultAddress ?? null);
      } catch {
        setDefaultAddress(null);
      }
    }

    void loadAddress();
  }, []);

  async function handleLogout() {
    try {
      await logout();
    } catch {
      toast.error("Logged out locally. Server logout could not be confirmed.");
    } finally {
      setProfileOpen(false);
      navigate("/", { replace: true });
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-3 md:px-8">
          <Link
            to="/dashboard"
            className="min-w-0 flex-1 truncate text-base font-black text-primary sm:text-xl"
          >
            <span className="lg:hidden">Shweta Drug</span>
            <span className="hidden lg:inline">Shweta Drug Distributors</span>
          </Link>

          <button
            type="button"
            onClick={() => setLocationOpen(true)}
            className="hidden items-center gap-2 rounded-xl px-3 py-2 text-left transition hover:bg-surface-soft md:flex"
          >
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs font-semibold text-muted">Delivering to</p>
              <p className="max-w-[190px] truncate text-sm font-bold text-navy">
                Default Address
              </p>
            </div>
          </button>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Link to="/checkout">
              <Button
                variant="ghost"
                className="relative h-11 w-11 rounded-xl border border-border p-0"
                aria-label="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-xs font-black text-white">
                  {count}
                </span>
              </Button>
            </Link>

            <div ref={profileRef} className="relative">
              <Button
                variant="ghost"
                className="h-11 rounded-xl border border-border bg-surface-soft px-3"
                onClick={() => setProfileOpen((prev) => !prev)}
                aria-label="Profile menu"
              >
                <UserRound className="h-5 w-5 text-primary" />
                <span className="hidden text-sm font-bold text-navy sm:inline">
                  Account
                </span>
                <ChevronDown
                  className={`hidden h-4 w-4 text-muted transition-transform sm:block ${profileOpen ? "rotate-180" : ""
                    }`}
                />
              </Button>

              <div
                className={`absolute right-0 top-14 z-50 w-56 overflow-hidden rounded-xl border border-border bg-white shadow-soft transition-all duration-200 ease-out ${profileOpen
                    ? "visible translate-y-0 scale-100 opacity-100"
                    : "invisible -translate-y-2 scale-95 opacity-0"
                  }`}
              >
                <Link
                  to="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-navy transition hover:bg-surface-soft hover:text-primary"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>

                <Link
                  to="/orders"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-navy transition hover:bg-surface-soft hover:text-primary"
                >
                  <History className="h-4 w-4" />
                  Order History
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-error transition hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {locationOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy/40 px-4" onMouseDown={() => setLocationOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-soft" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-navy">Delivery Address</h2>
                <p className="mt-2 text-sm text-muted">
                  This is the address shown during checkout. Update it from your profile.
                </p>
              </div>

              <Button
                variant="ghost"
                className="h-9 w-9 shrink-0 p-0"
                onClick={() => setLocationOpen(false)}
                aria-label="Close location modal"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-6 rounded-xl border border-primary bg-surface-soft p-4">
              <p className="text-sm font-black text-navy">Default Address</p>
              <p className="mt-1 text-sm text-muted">{deliveryAddressText}</p>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Button
                className="w-full"
                onClick={() => {
                  setLocationOpen(false);
                  navigate("/profile");
                }}
              >
                Update in Profile
              </Button>

              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setLocationOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
