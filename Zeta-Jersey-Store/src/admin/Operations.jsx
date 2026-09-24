import { useState } from "react";
import { Plus, Eye, Trash2 } from "lucide-react";
import {
  PageHeading,
  SearchBox,
  Badge,
  Empty,
  Modal,
  Field,
  ConfirmDelete,
} from "./AdminUI";
import { matches } from "./data";

export function Orders({ store, money }) {
  const [query, setQuery] = useState("");
  const [viewing, setViewing] = useState(null);

  if (store.loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-sm text-base-content/60">Loading orders from server...</p>
      </div>
    );
  }

  if (store.error) {
    return (
      <div className="alert alert-error rounded-2xl shadow-sm">
        <span>Error loading orders: {store.error}</span>
        <button className="btn btn-sm btn-ghost ml-auto" onClick={store.reload}>
          Retry
        </button>
      </div>
    );
  }

  const orders = store.orders.filter((o) =>
    matches(query, o.number || o.id, o.customer, o.status),
  );
  return (
    <>
      <PageHeading
        title="Orders"
        subtitle="Manage orders, invoices and quotations"
      />
      <SearchBox
        value={query}
        onChange={setQuery}
        placeholder="Search orders by number, customer or status..."
      />
      <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-sm">
        <table className="table">
          <thead>
            <tr>
              {["Order", "Customer", "Date", "Total", "Status", "Actions"].map(
                (h) => (
                  <th key={h}>{h}</th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="font-medium text-primary">{o.id}</td>
                <td>{o.customer}</td>
                <td className="text-base-content/55">{o.date}</td>
                <td className="font-medium">{money(o.total)}</td>
                <td>
                  <Badge>{o.status}</Badge>
                </td>
                <td>
                  <button
                    className="btn btn-ghost btn-sm btn-square text-primary"
                    aria-label={`View ${o.id}`}
                    onClick={() => setViewing(o)}
                  >
                    <Eye size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!orders.length && <Empty />}
      </div>
      {viewing && (
        <Modal
          error={store.saveError}
          title={`Order ${viewing.id}`}
          onClose={() => setViewing(null)}
        >
          <div className="space-y-1">
            <p className="font-semibold text-base-content">{viewing.customer}</p>
            {viewing.email && (
              <p className="text-xs text-base-content/60">Email: {viewing.email}</p>
            )}
            {viewing.phone && viewing.phone !== "-" && (
              <p className="text-xs text-base-content/60">Phone: {viewing.phone}</p>
            )}
            <p className="text-xs text-base-content/50">Date: {viewing.date}</p>
          </div>

          {viewing.items && viewing.items.length > 0 && (
            <div className="my-4 rounded-xl border border-base-200 bg-base-200/40 p-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-base-content/50">
                Order Items ({viewing.items.length})
              </span>
              <div className="mt-2 divide-y divide-base-200">
                {viewing.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium text-base-content">{item.name}</p>
                      <p className="text-xs text-base-content/50">
                        SKU: {item.sku} · Size: {item.size || "-"} · Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium text-base-content">
                      {money(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="my-4 flex items-center justify-between border-y border-base-300 py-3">
            <span className="text-sm font-medium text-base-content/70">Total Amount</span>
            <strong className="text-xl font-bold text-primary">{money(viewing.total)}</strong>
          </div>

          <form
            className="mt-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const status = new FormData(e.currentTarget).get("status");
              if (
                !(await store.update(
                  {
                    orders: store.orders.map((o) =>
                      o.id === viewing.id ? { ...o, status } : o,
                    ),
                  },
                  "Order status updated in database.",
                ))
              )
                return;
              setViewing(null);
            }}
          >
            <Field label="Order Status">
              <select name="status" defaultValue={viewing.status}>
                {[
                  "Pending",
                  "Processing",
                  "Shipped",
                  "Completed",
                  "Cancelled",
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setViewing(null)}
              >
                Close
              </button>
              <button type="submit" className="btn btn-primary">
                Update Status
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

export function Tasks({ store }) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [query, setQuery] = useState("");
  async function save(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    if (!data.title.trim()) {
      e.currentTarget.elements.title.setCustomValidity("Enter a task title.");
      e.currentTarget.reportValidity();
      return;
    }
    if (
      !(await store.update(
        {
          tasks: [
            ...store.tasks,
            {
              ...data,
              title: data.title.trim(),
              id: crypto.randomUUID(),
              status: "To do",
            },
          ],
        },
        "Task added.",
      ))
    )
      return;
    setOpen(false);
  }
  return (
    <>
      <PageHeading
        title="Task Manager"
        subtitle="Keep your team and daily operations on track"
      >
        <button className="btn btn-primary" onClick={() => setOpen(true)}>
          <Plus size={16} />
          Add Task
        </button>
      </PageHeading>
      <SearchBox
        value={query}
        onChange={setQuery}
        placeholder="Search tasks..."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {["To do", "In progress", "Done"].map((status) => {
          const tasks = store.tasks.filter(
            (t) =>
              t.status === status && matches(query, t.title, t.description),
          );
          return (
            <section className="rounded-2xl bg-base-200 p-4" key={status}>
              <h2 className="mb-4 flex items-center justify-between font-semibold">
                {status}
                <span className="badge badge-ghost">{tasks.length}</span>
              </h2>
              {tasks.map((t) => (
                <article
                  className="mb-3 rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm"
                  key={t.id}
                >
                  <div className="flex items-center justify-between gap-3">
                    <Badge>{t.priority}</Badge>
                    <button
                      className="btn btn-ghost btn-sm btn-square text-error"
                      aria-label={`Delete ${t.title}`}
                      onClick={() => setDeleting(t)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <h3 className="mt-4 font-semibold">{t.title}</h3>
                  <p className="mt-2 text-sm text-base-content/65">
                    {t.description}
                  </p>
                  {t.due && (
                    <small className="mt-3 block text-xs text-base-content/55">
                      Due {t.due}
                    </small>
                  )}
                  <select
                    className="select select-bordered select-sm mt-4 w-full"
                    aria-label={`Status of ${t.title}`}
                    value={t.status}
                    onChange={(e) =>
                      store.update(
                        {
                          tasks: store.tasks.map((item) =>
                            item.id === t.id
                              ? { ...item, status: e.target.value }
                              : item,
                          ),
                        },
                        "Task status updated.",
                      )
                    }
                  >
                    <option>To do</option>
                    <option>In progress</option>
                    <option>Done</option>
                  </select>
                </article>
              ))}
              {!tasks.length && <Empty text="No tasks here yet." />}
            </section>
          );
        })}
      </div>
      {open && (
        <Modal
          error={store.saveError}
          title="Add Task"
          onClose={() => setOpen(false)}
        >
          <form onSubmit={save}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                className="sm:col-span-2"
                label="Task Title"
                name="title"
                required
                maxLength={150}
                onInput={(e) => e.target.setCustomValidity("")}
              />
              <Field className="sm:col-span-2" label="Description">
                <textarea name="description" rows={3} />
              </Field>
              <Field label="Priority">
                <select name="priority">
                  <option>Medium</option>
                  <option>High</option>
                  <option>Low</option>
                </select>
              </Field>
              <Field label="Due Date" name="due" type="date" />
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t border-base-300 pt-5">
              <button className="btn btn-primary">Add Task</button>
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
      {deleting && (
        <ConfirmDelete
          error={store.saveError}
          name={deleting.title}
          onClose={() => setDeleting(null)}
          onConfirm={async () => {
            if (
              !(await store.update(
                { tasks: store.tasks.filter((t) => t.id !== deleting.id) },
                "Task deleted.",
              ))
            )
              return;
            setDeleting(null);
          }}
        />
      )}
    </>
  );
}
