import { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Cell, Table } from "../components/common/Table";
import { getApiErrorMessage, inventoryService, type InventoryLot } from "../services/inventoryService";

const expiryWindowDays = 60;

export default function Expiry() {
  const [alerts, setAlerts] = useState<InventoryLot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAlerts() {
    setIsLoading(true);
    setError("");

    try {
      const data = await inventoryService.getExpiringInventory(expiryWindowDays);
      setAlerts(data);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    inventoryService
      .getExpiringInventory(expiryWindowDays)
      .then((data) => {
        if (isMounted) setAlerts(data);
      })
      .catch((loadError) => {
        if (isMounted) setError(getApiErrorMessage(loadError));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy md:text-3xl">Expiry Management</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">Expiring in next 60 days. Review affected batches before they are sent to retailers.</p>
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-navy">Expiring in next 60 days</h2>
            <p className="text-sm text-muted">Batch-wise view of medicines that need expiry control before dispatch.</p>
          </div>
          <Button className="gap-2" onClick={() => void loadAlerts()} variant="secondary">
            <RefreshCcw className="h-4 w-4" />
            Retry
          </Button>
        </div>

        {isLoading ? <p className="py-8 text-center text-sm font-semibold text-muted">Loading expiry alerts...</p> : null}

        {error ? (
          <div className="rounded-lg border border-border bg-red-50 p-4 text-sm font-semibold text-error">
            {error}
          </div>
        ) : null}

        {!isLoading && !error ? (
          <Table headers={["Medicine", "SKU", "Batch", "Expiry", "Days Left", "Quantity"]}>
            {alerts.map((item) => {
              const daysRemaining = getDaysRemaining(item.expiryDate);

              return (
                <tr key={item.id} className="border-t border-border hover:bg-surface-soft/70">
                  <Cell strong>{item.medicine.name}</Cell>
                  <Cell>{item.medicine.sku}</Cell>
                  <Cell>{item.batchNumber}</Cell>
                  <Cell>{formatDate(item.expiryDate)}</Cell>
                  <Cell>{formatDaysRemaining(daysRemaining)}</Cell>
                  <Cell>{item.availableQuantity}</Cell>
                </tr>
              );
            })}
          </Table>
        ) : null}
        {!isLoading && !error && alerts.length === 0 ? <p className="py-8 text-center text-sm text-muted">No batches expiring in the next {expiryWindowDays} days.</p> : null}
      </Card>
    </section>
  );
}

function getDaysRemaining(value: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiryDate = new Date(value);
  expiryDate.setHours(0, 0, 0, 0);
  return Math.ceil((expiryDate.getTime() - today.getTime()) / 86_400_000);
}

function formatDaysRemaining(days: number) {
  if (days < 0) return "Expired";
  if (days === 0) return "Today";
  if (days === 1) return "1 day";
  return `${days} days`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));
}
