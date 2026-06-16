export function formatCount(value: number | null | undefined) {
  return typeof value === "number" ? new Intl.NumberFormat("en-IN").format(value) : "-";
}

export function formatCurrency(value: number | null | undefined) {
  return typeof value === "number"
    ? new Intl.NumberFormat("en-IN", {
        currency: "INR",
        maximumFractionDigits: 0,
        style: "currency",
      }).format(value)
    : "-";
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function statusLabel(value: string) {
  return value.replaceAll("_", " ");
}

export function statusTone(value: string): "green" | "orange" | "red" | "blue" {
  if (["ACTIVE", "PAID", "DELIVERED", "COMPLETED", "APPROVED"].includes(value)) return "green";
  if (["PENDING", "PACKED", "DISPATCHED", "REQUESTED", "INSPECT", "REVIEW", "PENDING_VERIFICATION", "LOW", "REORDER"].includes(value)) return "orange";
  if (["CANCELLED", "FAILED", "REJECTED", "SUSPENDED", "OUT_OF_STOCK"].includes(value)) return "red";
  return "blue";
}
