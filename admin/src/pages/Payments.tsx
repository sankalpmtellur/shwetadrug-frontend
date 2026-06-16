import { useCallback, useEffect, useMemo, useState } from "react";
import { CreditCard, IndianRupee, Receipt } from "lucide-react";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Metric } from "../components/common/Metric";
import { Cell, Table } from "../components/common/Table";
import { operationsService } from "../services/operationsService";
import type { Payment } from "../services/operationsService";
import type { ListMeta } from "../lib/api";
import { formatCount, formatCurrency, formatDate, statusLabel, statusTone } from "../utils/formatters";

export default function Payments() {
  const [items, setItems] = useState<Payment[]>([]);
  const [meta, setMeta] = useState<ListMeta>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPayments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await operationsService.getPayments();
      setItems(result.items);
      setMeta(result.meta);
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "Unable to load payments");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  const paidTotal = useMemo(() => items.filter((item) => item.status === "PAID").reduce((sum, item) => sum + item.amount, 0), [items]);
  const pendingCount = useMemo(() => items.filter((item) => item.status === "PENDING").length, [items]);

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={<Receipt />} label="Payments" value={formatCount(meta.total ?? items.length)} hint="Backend payment records" tone="blue" />
        <Metric icon={<IndianRupee />} label="Paid Value" value={formatCurrency(paidTotal)} hint="Paid payments in current view" tone="green" />
        <Metric icon={<CreditCard />} label="Pending" value={formatCount(pendingCount)} hint="Awaiting payment" tone="orange" />
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-navy">Payments</h2>
            <p className="text-sm text-muted">Live payment status and linked order information.</p>
          </div>
          {error ? <Button onClick={() => void loadPayments()}>Retry</Button> : null}
        </div>

        {isLoading ? <p className="text-sm font-bold text-muted">Loading payments...</p> : null}
        {error ? <p className="text-sm font-bold text-error">{error}</p> : null}
        {!isLoading && !error && items.length === 0 ? <p className="text-sm font-bold text-muted">No payments found.</p> : null}

        {!isLoading && !error && items.length > 0 ? (
          <Table headers={["Order", "Retailer", "Method", "Amount", "Paid At", "Transaction", "Status"]}>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-border hover:bg-surface-soft/70">
                <Cell strong>{item.order.orderNo}</Cell>
                <Cell>{item.order.retailer.pharmacyName}</Cell>
                <Cell>{statusLabel(item.method)}</Cell>
                <Cell>{formatCurrency(item.amount)}</Cell>
                <Cell>{formatDate(item.paidAt)}</Cell>
                <Cell>{item.transactionId ?? "-"}</Cell>
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
