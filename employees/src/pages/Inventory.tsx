import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { PackagePlus, RefreshCcw } from "lucide-react";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
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
  const medicineOptions = useMemo(() => Array.from(new Map(items.map((item) => [item.medicine.id, item.medicine])).values()), [items]);

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
    let isMounted = true;

    inventoryService
      .getInventory()
      .then((data) => {
        if (isMounted) setItems(data);
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
        <p className="mt-2 max-w-2xl text-sm text-muted">Update existing lots and review current stock records in one clean workflow.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
        <Card>
          <h2 className="text-lg font-bold text-navy">Edit Existing Inventory</h2>
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

        <Card className="xl:row-span-2">
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

        <Card>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-surface-strong p-2 text-primary">
              <PackagePlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-navy">Add Inventory</h2>
              <p className="mt-1 text-sm text-muted">
                New inventory lots require a medicine, supplier, batch number, quantity, price, and expiry date. The current employee API does not expose a create-inventory endpoint, so new lots should be added through the admin/procurement flow.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-4">
            <Select label="Medicine" value="" disabled>
              <option value="">{medicineOptions.length ? "Select medicine in admin flow" : "No medicines loaded"}</option>
              {medicineOptions.map((medicine) => (
                <option key={medicine.id} value={medicine.id}>
                  {medicine.name} ({medicine.sku})
                </option>
              ))}
            </Select>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Batch number" value="" placeholder="Create endpoint not available" readOnly />
              <Input label="Quantity" value="" placeholder="Create endpoint not available" readOnly />
            </div>
            <Button type="button" className="h-12 w-full" disabled>
              Add inventory not available for employees
            </Button>
          </div>
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

function Select({ label, value, disabled, children }: { label: string; value: string; disabled?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-navy">{label}</span>
      <select
        value={value}
        disabled={disabled}
        className="h-11 w-full rounded-lg border border-border bg-surface-soft px-3 text-sm text-muted outline-none transition disabled:cursor-not-allowed disabled:opacity-80"
      >
        {children}
      </select>
    </label>
  );
}
