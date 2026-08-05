import { useEffect, useMemo, useState, type FormEvent } from "react";
import { PackagePlus, RefreshCcw, Search, X } from "lucide-react";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Cell, Table } from "../components/common/Table";
import { getApiErrorMessage, inventoryService, type InventoryLot } from "../services/inventoryService";

const emptyForm = {
  quantity: "",
  batchNumber: "",
  mrp: "",
  sellingPrice: "",
  gstPercent: "",
  costPrice: "",
  expiryDate: "",
  manufacturerName: "",
};

const emptyAddForm = {
  medicineName: "",
  manufacturerName: "",
  categoryName: "",
  packSize: "",
  hsnCode: "",
  batchNumber: "",
  expiryDate: "",
  quantity: "",
  mrp: "",
  sellingPrice: "",
  gstPercent: "12",
  costPrice: "",
};

const pageSize = 10;

export default function Inventory() {
  const [items, setItems] = useState<InventoryLot[]>([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [addForm, setAddForm] = useState(emptyAddForm);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [addMessage, setAddMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const selectedItem = items.find((item) => item.id === selectedItemId) ?? null;
  const visibleItems = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return items;

    return items.filter((item) =>
      [
        item.medicine.name,
        item.medicine.sku,
        item.batchNumber,
        item.status,
        item.medicine.manufacturer?.name ?? "",
      ].some((value) => value.toLowerCase().includes(search)),
    );
  }, [items, query]);
  const totalPages = Math.max(1, Math.ceil(visibleItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = visibleItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  async function loadInventory() {
    setIsLoading(true);
    setError("");

    try {
      const data = await inventoryService.getInventory();
      setItems(data);
      setPage(1);
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
      batchNumber: item.batchNumber,
      mrp: String(item.medicine.mrp),
      sellingPrice: String(item.medicine.sellingPrice),
      gstPercent: String(item.medicine.gstPercent),
      costPrice: item.costPrice === null ? "" : String(item.costPrice),
      expiryDate: toDateInputValue(item.expiryDate),
      manufacturerName: item.medicine.manufacturer?.name ?? "",
    });
    setMessage(null);
  }

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage(null);
  }

  function updateAddField(field: keyof typeof emptyAddForm, value: string) {
    setAddForm((current) => ({ ...current, [field]: value }));
    setAddMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedItem) {
      setMessage({ tone: "error", text: "Please select an existing inventory item to update." });
      return;
    }

    const quantity = Number(form.quantity);
    const mrp = Number(form.mrp);
    const sellingPrice = Number(form.sellingPrice);
    const gstPercent = Number(form.gstPercent);
    const costPrice = form.costPrice.trim() ? Number(form.costPrice) : null;

    if (!form.quantity.trim() || Number.isNaN(quantity) || quantity < 0 || !Number.isInteger(quantity)) {
      setMessage({ tone: "error", text: "Please enter a valid non-negative whole number for quantity." });
      return;
    }

    if (!form.sellingPrice.trim() || Number.isNaN(sellingPrice) || sellingPrice <= 0) {
      setMessage({ tone: "error", text: "Please enter a valid selling price." });
      return;
    }
    if (!form.mrp.trim() || Number.isNaN(mrp) || mrp <= 0) {
      setMessage({ tone: "error", text: "Please enter a valid MRP." });
      return;
    }
    if (!form.gstPercent.trim() || Number.isNaN(gstPercent) || gstPercent < 0 || gstPercent > 100) {
      setMessage({ tone: "error", text: "Please enter GST between 0 and 100." });
      return;
    }
    if (costPrice !== null && (Number.isNaN(costPrice) || costPrice <= 0)) {
      setMessage({ tone: "error", text: "Purchase price must be blank or a positive number." });
      return;
    }
    if (!form.batchNumber.trim()) {
      setMessage({ tone: "error", text: "Please enter a batch number." });
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
        batchNumber: form.batchNumber,
        mrp,
        sellingPrice,
        gstPercent,
        costPrice,
        expiryDate: form.expiryDate,
        manufacturerName: form.manufacturerName || undefined,
      });
      setMessage({ tone: "success", text: `Inventory updated for batch ${selectedItem.batchNumber}.` });
      await loadInventory();
    } catch (saveError) {
      setMessage({ tone: "error", text: getApiErrorMessage(saveError) });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const quantity = Number(addForm.quantity);
    const mrp = Number(addForm.mrp);
    const sellingPrice = Number(addForm.sellingPrice);
    const gstPercent = Number(addForm.gstPercent);
    const costPrice = addForm.costPrice.trim() ? Number(addForm.costPrice) : undefined;

    if (!addForm.medicineName.trim() || !addForm.manufacturerName.trim() || !addForm.categoryName.trim() || !addForm.packSize.trim()) {
      setAddMessage({ tone: "error", text: "Please enter medicine name, manufacturer, category, and pack size." });
      return;
    }

    if (!addForm.batchNumber.trim() || !addForm.expiryDate.trim()) {
      setAddMessage({ tone: "error", text: "Please enter batch number and expiry date." });
      return;
    }

    if (!addForm.quantity.trim() || Number.isNaN(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
      setAddMessage({ tone: "error", text: "Please enter a valid positive whole number for quantity." });
      return;
    }

    if (!addForm.mrp.trim() || Number.isNaN(mrp) || mrp <= 0) {
      setAddMessage({ tone: "error", text: "Please enter a valid MRP." });
      return;
    }

    if (!addForm.sellingPrice.trim() || Number.isNaN(sellingPrice) || sellingPrice <= 0) {
      setAddMessage({ tone: "error", text: "Please enter a valid selling/wholesale price." });
      return;
    }

    if (!addForm.gstPercent.trim() || Number.isNaN(gstPercent) || gstPercent < 0 || gstPercent > 100) {
      setAddMessage({ tone: "error", text: "Please enter GST between 0 and 100." });
      return;
    }
    if (costPrice !== undefined && (Number.isNaN(costPrice) || costPrice <= 0)) {
      setAddMessage({ tone: "error", text: "Purchase price must be blank or a positive number." });
      return;
    }

    setIsAdding(true);

    try {
      const createdItem = await inventoryService.createMedicineInventory({
        medicineName: addForm.medicineName,
        manufacturerName: addForm.manufacturerName,
        categoryName: addForm.categoryName,
        packSize: addForm.packSize,
        hsnCode: addForm.hsnCode || undefined,
        batchNumber: addForm.batchNumber,
        expiryDate: addForm.expiryDate,
        quantity,
        mrp,
        sellingPrice,
        gstPercent,
        costPrice,
      });
      setAddMessage({ tone: "success", text: `${createdItem.medicine.name} batch ${createdItem.batchNumber} added to inventory.` });
      setAddForm(emptyAddForm);
      setItems((current) => [createdItem, ...current.filter((item) => item.id !== createdItem.id)]);
      setQuery(createdItem.batchNumber);
      setPage(1);
      setSelectedItemId(createdItem.id);
      setForm({
        quantity: String(createdItem.quantityOnHand),
        batchNumber: createdItem.batchNumber,
        mrp: String(createdItem.medicine.mrp),
        sellingPrice: String(createdItem.medicine.sellingPrice),
        gstPercent: String(createdItem.medicine.gstPercent),
        costPrice: createdItem.costPrice === null ? "" : String(createdItem.costPrice),
        expiryDate: toDateInputValue(createdItem.expiryDate),
        manufacturerName: createdItem.medicine.manufacturer?.name ?? "",
      });
    } catch (addError) {
      setAddMessage({ tone: "error", text: getApiErrorMessage(addError) });
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy md:text-3xl">Inventory Management</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">Update existing lots and review current stock records in one clean workflow.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-surface-strong p-2 text-primary">
              <PackagePlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-navy">Add Inventory</h2>
              <p className="mt-1 text-sm text-muted">Add a medicine and its first batch in one step. Existing matching medicines are reused safely.</p>
            </div>
          </div>
          <form onSubmit={handleAddSubmit} className="mt-5 grid gap-4">
            <Input label="Medicine name" value={addForm.medicineName} onChange={(value) => updateAddField("medicineName", value)} placeholder="Paracetamol 650" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Manufacturer" value={addForm.manufacturerName} onChange={(value) => updateAddField("manufacturerName", value)} placeholder="Manufacturer name" />
              <Input label="Category" value={addForm.categoryName} onChange={(value) => updateAddField("categoryName", value)} placeholder="Tablet" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Pack size" value={addForm.packSize} onChange={(value) => updateAddField("packSize", value)} placeholder="10 tablets" />
              <Input label="HSN code" value={addForm.hsnCode} onChange={(value) => updateAddField("hsnCode", value)} placeholder="Optional" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Batch number" value={addForm.batchNumber} onChange={(value) => updateAddField("batchNumber", value)} placeholder="BATCH-001" />
              <Input label="Expiry date" type="date" value={addForm.expiryDate} onChange={(value) => updateAddField("expiryDate", value)} placeholder="2027-12-31" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Quantity" type="number" value={addForm.quantity} onChange={(value) => updateAddField("quantity", value)} placeholder="500" />
              <Input label="GST %" type="number" value={addForm.gstPercent} onChange={(value) => updateAddField("gstPercent", value)} placeholder="12" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="MRP" type="number" value={addForm.mrp} onChange={(value) => updateAddField("mrp", value)} placeholder="150" />
              <Input label="Selling/wholesale price" type="number" value={addForm.sellingPrice} onChange={(value) => updateAddField("sellingPrice", value)} placeholder="120" />
            </div>
            <Input label="Purchase price" type="number" value={addForm.costPrice} onChange={(value) => updateAddField("costPrice", value)} placeholder="Optional" />
            {addMessage ? (
              <div className={`rounded-lg px-3 py-2 text-sm font-semibold ${addMessage.tone === "error" ? "bg-red-50 text-error" : "bg-emerald-50 text-success"}`}>
                {addMessage.text}
              </div>
            ) : null}
            <Button type="submit" className="h-12 w-full" disabled={isAdding}>
              {isAdding ? "Adding..." : "Add medicine and inventory"}
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-navy">Edit Existing Inventory</h2>
          <p className="mt-1 text-sm text-muted">Select an inventory lot from the table, then update quantity, selling price, or expiry date.</p>
          <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
            <Input label="Medicine name" value={selectedItem?.medicine.name ?? ""} placeholder="Select from table" readOnly />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="SKU" value={selectedItem?.medicine.sku ?? ""} placeholder="Select from table" readOnly />
              <Input label="Batch number" value={form.batchNumber} onChange={(value) => updateField("batchNumber", value)} placeholder="Batch" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Quantity on hand" type="number" value={form.quantity} onChange={(value) => updateField("quantity", value)} placeholder="500" />
              <Input label="Selling price" type="number" value={form.sellingPrice} onChange={(value) => updateField("sellingPrice", value)} placeholder="128" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="MRP" type="number" value={form.mrp} onChange={(value) => updateField("mrp", value)} placeholder="150" />
              <Input label="Purchase price" type="number" value={form.costPrice} onChange={(value) => updateField("costPrice", value)} placeholder="Optional" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="GST %" type="number" value={form.gstPercent} onChange={(value) => updateField("gstPercent", value)} placeholder="12" />
              <Input label="Expiry date" type="date" value={form.expiryDate} onChange={(value) => updateField("expiryDate", value)} placeholder="2027-12-31" />
            </div>
            <Input label="Manufacturer" value={form.manufacturerName} onChange={(value) => updateField("manufacturerName", value)} placeholder="Manufacturer" />
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

        <Card className="xl:col-span-2">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-navy">Current Inventory</h2>
              <p className="text-sm text-muted">Batch-wise backend inventory for employee updates and reorder decisions.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  className="h-10 w-full rounded-lg border border-border pl-9 pr-10 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 sm:w-72"
                  placeholder="Search medicine, SKU, batch..."
                  aria-label="Search inventory"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setPage(1);
                    }}
                    className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted hover:bg-surface-soft hover:text-navy"
                    aria-label="Clear inventory search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </label>
              <Button className="gap-2" onClick={() => void loadInventory()} variant="secondary">
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          {isLoading ? <p className="py-8 text-center text-sm font-semibold text-muted">Loading inventory...</p> : null}

          {error ? (
            <div className="rounded-lg border border-border bg-red-50 p-4 text-sm font-semibold text-error">
              {error}
            </div>
          ) : null}

          {!isLoading && !error && visibleItems.length > 0 ? (
            <Table headers={["Medicine", "SKU", "Batch", "Qty", "MRP", "Price", "Expiry", "Action"]}>
              {pageItems.map((item) => (
                <tr key={item.id} className="border-t border-border hover:bg-surface-soft/70">
                  <Cell strong>{item.medicine.name}</Cell>
                  <Cell>{item.medicine.sku}</Cell>
                  <Cell>{item.batchNumber}</Cell>
                  <Cell>{item.quantityOnHand}</Cell>
                  <Cell>{formatCurrency(item.medicine.mrp)}</Cell>
                  <Cell>{formatCurrency(item.medicine.sellingPrice)}</Cell>
                  <Cell>{formatDate(item.expiryDate)}</Cell>
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
          {!isLoading && !error && items.length > 0 && visibleItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">No inventory lots match your search.</p>
          ) : null}
          {!isLoading && !error && visibleItems.length > 0 ? (
            <Pagination page={currentPage} totalPages={totalPages} totalItems={visibleItems.length} onPageChange={setPage} />
          ) : null}
        </Card>

      </div>
    </section>
  );
}

function Pagination({ page, totalPages, totalItems, onPageChange }: { page: number; totalPages: number; totalItems: number; onPageChange: (page: number) => void }) {
  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-semibold text-muted">
        {totalItems} inventory lots · Page {page} of {totalPages}
      </p>
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <Button type="button" className="w-full sm:w-auto" variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <Button type="button" className="w-full sm:w-auto" variant="secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
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
