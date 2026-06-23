import { api, apiResult, readListMeta } from "../lib/api";

export type AuditLog = {
  id: string;
  actorUserId: string | null;
  actorRole: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  targetUserId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: unknown;
  createdAt: string;
};

export type AuditLogFilters = {
  action?: string;
  entityType?: string;
  actorUserId?: string;
  targetUserId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
};

function compactParams(filters: AuditLogFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => {
      if (typeof value === "string") return value.trim().length > 0;
      return value !== undefined && value !== null;
    }),
  );
}

export const auditService = {
  async getAuditLogs(filters: AuditLogFilters) {
    const result = await apiResult<AuditLog[]>(api.get("/audit", { params: compactParams(filters) }));
    return {
      items: result.data,
      meta: readListMeta(result.meta),
    };
  },
};
