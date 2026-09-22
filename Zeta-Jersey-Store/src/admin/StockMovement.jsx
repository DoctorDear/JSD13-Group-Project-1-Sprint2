import { useState } from "react";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import {
  PageHeading,
  SearchBox,
  Badge,
  Empty,
  Modal,
  Field,
} from "./AdminUI";
import { matches } from "./data";

export default function StockMovement({ store }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const movements = store.movements.filter((m) =>
    matches(query, m.name, m.sku, m.type, m.source),
  );
  async function save(e) {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.currentTarget));
    const product = store.products.find((p) => p.id === form.product);
    const quantity =
      Number(form.quantity) * (form.type === "Stock Out" ? -1 : 1);
    if (!quantity || !Number.isInteger(quantity))
      return setError("Enter a nonzero whole number.");
    if (form.type === "Stock In" && quantity < 0)
      return setError("Stock in quantity must be positive.");
    if (form.type === "Stock Out" && quantity > 0)
      return setError("Enter a positive quantity to remove.");
    if (product.stock + quantity < 0)
      return setError(`Only ${product.stock} units are available.`);
    if (!form.source.trim()) return setError("Enter a source or destination.");
    const movement = {
      id: crypto.randomUUID(),
      productId: product.id,
      name: product.name,
      sku: product.sku,
      type: form.type,
      quantity,
      source: form.source.trim(),
      date: new Date().toISOString(),
    };
    if (
      !(await store.update(
        {
          movements: [movement, ...store.movements],
          products: store.products.map((p) =>
            p.id === product.id ? { ...p, stock: p.stock + quantity } : p,
          ),
        },
        "Stock movement recorded. Inventory updated.",
      ))
    )
      return;
    setOpen(false);
  }
  return (
    <>
      <PageHeading
        title="Stock Movement"
        subtitle="Track all inventory movement and adjustments"
      >
        <button
          className="btn btn-primary"
          disabled={!store.products.length}
          onClick={() => {
            setError("");
            setOpen(true);
          }}
        >
          <Plus size={16} />
          Record Movement
        </button>
      </PageHeading>
      <SearchBox value={query} onChange={setQuery} />
      <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-sm">
        <table className="table">
          <thead>
            <tr>
              {[
                "Product",
                "SKU",
                "Type",
                "Quantity",
                "Source/Destination",
                "Date & Time",
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {movements.map((m) => (
              <tr key={m.id}>
                <td className="font-medium">{m.name}</td>
                <td className="text-base-content/55">{m.sku}</td>
                <td>
                  <span className="flex items-center gap-2">
                    {m.quantity > 0 ? (
                      <TrendingUp size={14} className="text-success" />
                    ) : (
                      <TrendingDown size={14} className="text-error" />
                    )}
                    <Badge>{m.type}</Badge>
                  </span>
                </td>
                <td
                  className={
                    m.quantity > 0
                      ? "font-medium text-success"
                      : "font-medium text-error"
                  }
                >
                  {m.quantity > 0 ? "+" : ""}
                  {m.quantity}
                </td>
                <td className="text-base-content/55">{m.source}</td>
                <td className="text-base-content/55">
                  {new Date(m.date).toLocaleDateString("en-CA")}
                  <small className="ml-2 text-xs">
                    {new Date(m.date).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!movements.length && <Empty />}
      </div>
      {open && (
        <Modal
          error={store.saveError}
          title="Record Stock Movement"
          onClose={() => setOpen(false)}
        >
          <form onSubmit={save}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field className="sm:col-span-2" label="Product">
                <select name="product" required>
                  {store.products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.stock} available
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Type">
                <select name="type">
                  <option>Stock In</option>
                  <option>Stock Out</option>
                  <option>Adjustment</option>
                </select>
              </Field>
              <Field
                label="Quantity"
                type="number"
                name="quantity"
                step="1"
                required
              />
              <Field
                className="sm:col-span-2"
                label="Source / Destination"
                name="source"
                required
              />
            </div>
            <p className="mt-4 text-sm text-base-content/55">
              Use a positive quantity for stock in or out. Adjustments may be
              positive or negative.
            </p>
            {error && (
              <p className="alert alert-error mt-4 py-3 text-sm" role="alert">
                {error}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3 border-t border-base-300 pt-5">
              <button className="btn btn-primary">Record Movement</button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
