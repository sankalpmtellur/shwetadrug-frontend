import { useEffect, useMemo, useState } from "react";
import { Boxes, PackagePlus, RefreshCcw } from "lucide-react";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Metric } from "../components/common/Metric";
import { Cell, Table } from "../components/common/Table";
import { getApiErrorMessage, inventoryService, type InventoryLot, type InventoryStatus } from "../services/inventoryService";

const emptyForm = {
  quantity: "",
  sellingPrice: "",
  expiryDate: "",
};

const statusLabels: Record<InventoryStatus, string> = {
  HEALTHY: "Healthy",
  LOW: "Low",
  REORDER: "Reorder",
  OUT_OF_STOCK: "Out of Stock",
  EXPIRED: "Expired",
};

const statusTones: Record<InventoryStatus, "green" | "orange" | "blue" | "red"> = {
  HEALTHY: "green",
  LOW: "orange",
  REORDER: "red",
  OUT_OF_STOCK: "red",
  EXPIRED: "red",
};

export default function Inventory() {
  const [items, setItems] = useState<InventoryLot[]>([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedItem = items.find((item) => item.id === selectedItemId) ?? null;

  const totals = useMemo(
    () => ({
      stock: items.reduce((sum, item) => sum + item.availableQuantity, 0),
      low: items.filter((item) => item.status !== "HEALTHY").length,
      batches: items.length,
    }),
    [items],
  );

  async function loadInventory() {
    setIsLoading(true);
    setError("");

    try {
      const data = await inventoryService.getInventory();
      setItems(data);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadInventory();
  }, []);

  function selectItem(item: InventoryLot) {
    setSelectedItemId(item.id);
    setForm({
      quantity: String(item.quantityOnHand),
      sellingPrice: String(item.medicine.sellingPrice),
      expiryDate: toDateInputValue(item.expiryDate),
    });
    setMessage(null);
  }

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedItem) {
      setMessage({ tone: "error", text: "Please select an existing inventory item to update." });
      return;
    }

    const quantity = Number(form.quantity);
    const sellingPrice = Number(form.sellingPrice);

    if (!form.quantity.trim() || Number.isNaN(quantity) || quantity < 0 || !Number.isInteger(quantity)) {
      setMessage({ tone: "error", text: "Please enter a valid non-negative whole number for quantity." });
      return;
    }

    if (!form.sellingPrice.trim() || Number.isNaN(sellingPrice) || sellingPrice <= 0) {
      setMessage({ tone: "error", text: "Please enter a valid selling price." });
      return;
    }

    if (!form.expiryDate.trim()) {
      setMessage({ tone: "error", text: "Please enter an expiry date." });
      return;
    }

    setIsSaving(true);

    try {
      await inventoryService.updateInventory(selectedItem.id, {
        quantity,
        sellingPrice,
        expiryDate: form.expiryDate,
      });
      setMessage({ tone: "success", text: `Inventory updated for batch ${selectedItem.batchNumber}.` });
      await loadInventory();
    } catch (saveError) {
      setMessage({ tone: "error", text: getApiErrorMessage(saveError) });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy md:text-3xl">Inventory Management</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">Update existing inventory lots after stock movement or pricing changes.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={<Boxes />} label="Available Units" value={totals.stock.toLocaleString("en-IN")} tone="text-primary" hint={`${totals.batches} tracked batches`} />
        <Metric icon={<PackagePlus />} label="Batch Records" value={String(totals.batches)} tone="text-success" hint="Backend inventory lots" />
        <Metric icon={<RefreshCcw />} label="Reorder Alerts" value={String(totals.low)} tone="text-warning" hint="Low or empty stock" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
        <Card>
          <h2 className="text-lg font-bold text-navy">Edit Existing Stock</h2>
          <p className="mt-1 text-sm text-muted">Select an inventory lot from the table, then update quantity, selling price, or expiry date.</p>
          <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
            <Input label="Medicine name" value={selectedItem?.medicine.name ?? ""} placeholder="Select from table" readOnly />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="SKU" value={selectedItem?.medicine.sku ?? ""} placeholder="Select from table" readOnly />
              <Input label="Batch number" value={selectedItem?.batchNumber ?? ""} placeholder="Select from table" readOnly />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Quantity on hand" type="number" value={form.quantity} onChange={(value) => updateField("quantity", value)} placeholder="500" />
              <Input label="Selling price" type="number" value={form.sellingPrice} onChange={(value) => updateField("sellingPrice", value)} placeholder="128" />
            </div>
            <Input label="Expiry date" type="date" value={form.expiryDate} onChange={(value) => updateField("expiryDate", value)} placeholder="2027-12-31" />
            {message ? (
              <div className={`rounded-lg px-3 py-2 text-sm font-semibold ${message.tone === "error" ? "bg-red-50 text-error" : "bg-emerald-50 text-success"}`}>
                {message.text}
              </div>
            ) : null}
            <Button type="submit" className="h-12 w-full" disabled={!selectedItem || isSaving}>
              {isSaving ? "Saving..." : "Save stock update"}
            </Button>
          </form>
        </Card>

        <Card>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-navy">Current Inventory</h2>
              <p className="text-sm text-muted">Batch-wise backend inventory for employee updates and reorder decisions.</p>
            </div>
            <Button className="gap-2" onClick={() => void loadInventory()} variant="secondary">
              <RefreshCcw className="h-4 w-4" />
              Retry
            </Button>
          </div>

          {isLoading ? <p className="py-8 text-center text-sm font-semibold text-muted">Loading inventory...</p> : null}

          {error ? (
            <div className="rounded-lg border border-border bg-red-50 p-4 text-sm font-semibold text-error">
              {error}
            </div>
          ) : null}

          {!isLoading && !error ? (
            <Table headers={["Medicine", "SKU", "Batch", "Qty", "Price", "Expiry", "Status", "Action"]}>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-border hover:bg-surface-soft/70">
                  <Cell strong>{item.medicine.name}</Cell>
                  <Cell>{item.medicine.sku}</Cell>
                  <Cell>{item.batchNumber}</Cell>
                  <Cell>{item.quantityOnHand}</Cell>
                  <Cell>{formatCurrency(item.medicine.sellingPrice)}</Cell>
                  <Cell>{formatDate(item.expiryDate)}</Cell>
                  <Cell>
                    <Badge tone={statusTones[item.status]}>{statusLabels[item.status]}</Badge>
                  </Cell>
                  <Cell>
                    <Button className="h-9 px-3" onClick={() => selectItem(item)} variant={selectedItemId === item.id ? "primary" : "secondary"}>
                      {selectedItemId === item.id ? "Selected" : "Edit"}
                    </Button>
                  </Cell>
                </tr>
              ))}
            </Table>
          ) : null}
          {!isLoading && !error && items.length === 0 ? <p className="py-8 text-center text-sm text-muted">No inventory lots found.</p> : null}
        </Card>
      </div>
    </section>
  );
}

function toDateInputValue(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder: string;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-navy">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className="h-11 w-full rounded-lg border border-border px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 read-only:bg-surface-soft"
      />
    </label>
  );
}
