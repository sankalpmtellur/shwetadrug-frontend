import { useCallback, useEffect, useMemo, useState } from "react";
import { IndianRupee, RotateCcw, ShieldAlert } from "lucide-react";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Metric } from "../components/common/Metric";
import { Cell, Table } from "../components/common/Table";
import { operationsService } from "../services/operationsService";
import type { Claim } from "../services/operationsService";
import type { ListMeta } from "../lib/api";
import { formatCount, formatCurrency, formatDate, statusLabel, statusTone } from "../utils/formatters";

export default function Claims() {
  const [items, setItems] = useState<Claim[]>([]);
  const [meta, setMeta] = useState<ListMeta>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClaims = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await operationsService.getClaims();
      setItems(result.items);
      setMeta(result.meta);
    } catch (claimError) {
      setError(claimError instanceof Error ? claimError.message : "Unable to load claims");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadClaims();
  }, [loadClaims]);

  const openCount = useMemo(() => items.filter((item) => item.status === "REQUESTED" || item.status === "INSPECT").length, [items]);
  const claimValue = useMemo(() => items.reduce((sum, item) => sum + item.totalAmount, 0), [items]);

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={<RotateCcw />} label="Claims" value={formatCount(meta.total ?? items.length)} hint="Backend return requests" tone="blue" />
        <Metric icon={<ShieldAlert />} label="Open" value={formatCount(openCount)} hint="Requested or in inspection" tone="orange" />
        <Metric icon={<IndianRupee />} label="Claim Value" value={formatCurrency(claimValue)} hint="Current view total" tone="green" />
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-navy">Claims</h2>
            <p className="text-sm text-muted">Live return claims and processing status.</p>
          </div>
          {error ? <Button onClick={() => void loadClaims()}>Retry</Button> : null}
        </div>

        {isLoading ? <p className="text-sm font-bold text-muted">Loading claims...</p> : null}
        {error ? <p className="text-sm font-bold text-error">{error}</p> : null}
        {!isLoading && !error && items.length === 0 ? <p className="text-sm font-bold text-muted">No claims found.</p> : null}

        {!isLoading && !error && items.length > 0 ? (
          <Table headers={["Claim", "Retailer", "Order", "Reason", "Created", "Amount", "Status"]}>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-border hover:bg-surface-soft/70">
                <Cell strong>{item.claimNo}</Cell>
                <Cell>{item.retailer.pharmacyName}</Cell>
                <Cell>{item.order?.orderNo ?? "-"}</Cell>
                <Cell>{item.reason}</Cell>
                <Cell>{formatDate(item.createdAt)}</Cell>
                <Cell>{formatCurrency(item.totalAmount)}</Cell>
                <Cell>
                  <Badge tone={statusTone(item.status)}>{statusLabel(item.status)}</Badge>
                </Cell>
              </tr>
            ))}
          </Table>
        ) : null}
      </Card>
    </section>
  );
}
