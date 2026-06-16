import { useCallback, useEffect, useMemo, useState } from "react";
import { Boxes, PackageSearch, ShieldCheck } from "lucide-react";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Metric } from "../components/common/Metric";
import { Cell, Table } from "../components/common/Table";
import { operationsService } from "../services/operationsService";
import type { Medicine } from "../services/operationsService";
import type { ListMeta } from "../lib/api";
import { formatCount, formatCurrency, statusLabel, statusTone } from "../utils/formatters";

export default function Medicines() {
  const [items, setItems] = useState<Medicine[]>([]);
  const [meta, setMeta] = useState<ListMeta>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMedicines = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await operationsService.getMedicines();
      setItems(result.items);
      setMeta(result.meta);
    } catch (medicineError) {
      setError(medicineError instanceof Error ? medicineError.message : "Unable to load medicines");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMedicines();
  }, [loadMedicines]);

  const activeCount = useMemo(() => items.filter((item) => item.status === "ACTIVE").length, [items]);
  const lowStockCount = useMemo(() => items.filter((item) => item.availableStock <= item.reorderLevel).length, [items]);

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={<Boxes />} label="Medicines" value={formatCount(meta.total ?? items.length)} hint="Backend catalog records" tone="blue" />
        <Metric icon={<ShieldCheck />} label="Active" value={formatCount(activeCount)} hint="Loaded active medicines" tone="green" />
        <Metric icon={<PackageSearch />} label="Low Stock" value={formatCount(lowStockCount)} hint="At or below reorder level" tone="orange" />
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-navy">Medicine Catalog</h2>
            <p className="text-sm text-muted">Live medicine pricing, stock, and catalog status.</p>
          </div>
          {error ? <Button onClick={() => void loadMedicines()}>Retry</Button> : null}
        </div>

        {isLoading ? <p className="text-sm font-bold text-muted">Loading medicines...</p> : null}
        {error ? <p className="text-sm font-bold text-error">{error}</p> : null}
        {!isLoading && !error && items.length === 0 ? <p className="text-sm font-bold text-muted">No medicines found.</p> : null}

        {!isLoading && !error && items.length > 0 ? (
          <Table headers={["SKU", "Medicine", "Manufacturer", "Stock", "MRP", "Selling", "Status"]}>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-border hover:bg-surface-soft/70">
                <Cell strong>{item.sku}</Cell>
                <Cell>{item.name}</Cell>
                <Cell>{item.manufacturer?.name ?? "-"}</Cell>
                <Cell>{formatCount(item.availableStock)}</Cell>
                <Cell>{formatCurrency(item.mrp)}</Cell>
                <Cell>{formatCurrency(item.sellingPrice)}</Cell>
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
