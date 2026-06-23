import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { RotateCcw, Search, ShieldCheck } from "lucide-react";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Cell, Table } from "../components/common/Table";
import type { ListMeta } from "../lib/api";
import { auditService } from "../services/auditService";
import type { AuditLog, AuditLogFilters } from "../services/auditService";
import { formatCount, statusLabel } from "../utils/formatters";

const pageSize = 25;
const sensitiveKeys = new Set(["password", "token", "tokenHash", "refreshToken", "resetToken", "authorization", "passwordHash"]);

type FilterDraft = {
  action: string;
  entityType: string;
  actorUserId: string;
  targetUserId: string;
  dateFrom: string;
  dateTo: string;
};

const emptyFilters: FilterDraft = {
  action: "",
  entityType: "",
  actorUserId: "",
  targetUserId: "",
  dateFrom: "",
  dateTo: "",
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function shorten(value: string | null | undefined, length = 12) {
  if (!value) return "-";
  return value.length > length ? `${value.slice(0, length)}...` : value;
}

function sanitizeMetadata(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeMetadata(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => !sensitiveKeys.has(key))
        .map(([key, item]) => [key, sanitizeMetadata(item)]),
    );
  }

  return value;
}

function metadataSummary(metadata: unknown) {
  if (!metadata) return "-";

  const safeMetadata = sanitizeMetadata(metadata);
  if (!safeMetadata || (typeof safeMetadata === "object" && !Array.isArray(safeMetadata) && Object.keys(safeMetadata).length === 0)) {
    return "-";
  }

  const summary = JSON.stringify(safeMetadata);
  return summary.length > 140 ? `${summary.slice(0, 140)}...` : summary;
}

function filterPayload(filters: FilterDraft, page: number): AuditLogFilters {
  return {
    action: filters.action.trim(),
    entityType: filters.entityType.trim(),
    actorUserId: filters.actorUserId.trim(),
    targetUserId: filters.targetUserId.trim(),
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    page,
    limit: pageSize,
  };
}

function AuditRow({ item }: { item: AuditLog }) {
  return (
    <tr className="border-t border-border align-top hover:bg-surface-soft/70">
      <Cell strong>
        <span className="block min-w-36">{formatDateTime(item.createdAt)}</span>
      </Cell>
      <Cell>
        <span className="font-bold text-navy">{statusLabel(item.action)}</span>
      </Cell>
      <Cell>
        <span title={item.actorUserId ?? undefined}>{shorten(item.actorUserId)}</span>
      </Cell>
      <Cell>{item.actorRole ?? "-"}</Cell>
      <Cell>{item.entityType ?? "-"}</Cell>
      <Cell>
        <span title={item.entityId ?? undefined}>{shorten(item.entityId)}</span>
      </Cell>
      <Cell>
        <span title={item.targetUserId ?? undefined}>{shorten(item.targetUserId)}</span>
      </Cell>
      <Cell>{item.ipAddress ?? "-"}</Cell>
      <Cell>
        <span className="block max-w-52 break-words" title={item.userAgent ?? undefined}>
          {item.userAgent ?? "-"}
        </span>
      </Cell>
      <Cell>
        <span className="block max-w-80 break-words font-mono text-xs text-muted">{metadataSummary(item.metadata)}</span>
      </Cell>
    </tr>
  );
}

export default function AuditLogs() {
  const [items, setItems] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState<ListMeta>({});
  const [filters, setFilters] = useState<FilterDraft>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterDraft>(emptyFilters);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAuditLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await auditService.getAuditLogs(filterPayload(appliedFilters, page));
      setItems(result.items);
      setMeta(result.meta);
    } catch (auditError) {
      setError(auditError instanceof Error ? auditError.message : "Unable to load audit logs");
    } finally {
      setIsLoading(false);
    }
  }, [appliedFilters, page]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadAuditLogs();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadAuditLogs]);

  const totalPages = Math.max(meta.totalPages ?? 1, 1);
  const hasFilters = useMemo(() => Object.values(appliedFilters).some((value) => value.trim().length > 0), [appliedFilters]);

  function updateFilter(key: keyof FilterDraft, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setAppliedFilters(filters);
  }

  function resetFilters() {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(1);
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-muted">Audit Logs</p>
              <p className="text-2xl font-black text-navy">{formatCount(meta.total ?? items.length)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <p className="text-xs font-black uppercase tracking-widest text-muted">Page</p>
          <p className="mt-2 text-2xl font-black text-navy">
            {formatCount(meta.page ?? page)} / {formatCount(totalPages)}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-black uppercase tracking-widest text-muted">Mode</p>
          <p className="mt-2 text-2xl font-black text-navy">Read only</p>
        </Card>
      </div>

      <Card>
        <form className="grid gap-3 lg:grid-cols-6" onSubmit={applyFilters}>
          <label className="space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-muted">Action</span>
            <input
              className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-bold text-navy outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              value={filters.action}
              onChange={(event) => updateFilter("action", event.target.value)}
              placeholder="LOGIN_SUCCESS"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-muted">Entity</span>
            <input
              className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-bold text-navy outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              value={filters.entityType}
              onChange={(event) => updateFilter("entityType", event.target.value)}
              placeholder="User"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-muted">Actor ID</span>
            <input
              className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-bold text-navy outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              value={filters.actorUserId}
              onChange={(event) => updateFilter("actorUserId", event.target.value)}
              placeholder="UUID"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-muted">Target ID</span>
            <input
              className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-bold text-navy outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              value={filters.targetUserId}
              onChange={(event) => updateFilter("targetUserId", event.target.value)}
              placeholder="UUID"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-muted">From</span>
            <input
              className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-bold text-navy outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              type="date"
              value={filters.dateFrom}
              onChange={(event) => updateFilter("dateFrom", event.target.value)}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-muted">To</span>
            <input
              className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-bold text-navy outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              type="date"
              value={filters.dateTo}
              onChange={(event) => updateFilter("dateTo", event.target.value)}
            />
          </label>
          <div className="flex flex-wrap gap-2 lg:col-span-6">
            <Button type="submit" className="gap-2">
              <Search className="h-4 w-4" />
              Filter
            </Button>
            <Button type="button" variant="secondary" className="gap-2" onClick={resetFilters} disabled={!hasFilters && !Object.values(filters).some(Boolean)}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-navy">Audit Activity</h2>
            <p className="text-sm text-muted">Security and business events persisted by the backend audit service.</p>
          </div>
          {error ? (
            <Button type="button" onClick={() => void loadAuditLogs()}>
              Retry
            </Button>
          ) : null}
        </div>

        {isLoading ? <p className="text-sm font-bold text-muted">Loading audit logs...</p> : null}
        {error ? <p className="text-sm font-bold text-error">{error}</p> : null}
        {!isLoading && !error && items.length === 0 ? <p className="text-sm font-bold text-muted">No audit logs found.</p> : null}

        {!isLoading && !error && items.length > 0 ? (
          <>
            <Table headers={["Created", "Action", "Actor", "Role", "Entity", "Entity ID", "Target", "IP", "User Agent", "Metadata"]}>
              {items.map((item) => (
                <AuditRow key={item.id} item={item} />
              ))}
            </Table>

            <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-bold text-muted">
                Page {formatCount(meta.page ?? page)} of {formatCount(totalPages)} · {formatCount(meta.total ?? items.length)} records
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setPage((current) => Math.max(current - 1, 1))} disabled={page <= 1 || isLoading}>
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
                  disabled={page >= totalPages || isLoading}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </Card>
    </section>
  );
}
