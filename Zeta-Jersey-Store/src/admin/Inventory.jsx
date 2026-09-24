import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Plus, Save } from "lucide-react";
import {
  PageHeading,
  SearchBox,
  Badge,
  ProductMark,
  EditActions,
  Empty,
  Field,
  ConfirmDelete,
} from "./AdminUI";
import { matches, stockStatus } from "./data";
import { adminService } from "../services/adminService";

export function Inventory({ store, money }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All statuses");
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  if (store.loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-sm text-base-content/60">
          Loading products from server...
        </p>
      </div>
    );
  }

  if (store.error) {
    return (
      <div className="alert alert-error rounded-2xl shadow-sm">
        <span>Error loading products: {store.error}</span>
        <button className="btn btn-sm btn-ghost ml-auto" onClick={store.reload}>
          Retry
        </button>
      </div>
    );
  }

  const products = store.products.filter(
    (p) =>
      matches(query, p.name, p.sku, p.category) &&
      (filter === "All statuses" || stockStatus(p) === filter),
  );

  return (
    <>
      <PageHeading title="Inventory Management" subtitle="Manage your products">
        <Link className="btn btn-primary" to="/admin/inventory/new">
          <Plus size={16} />
          Add Product
        </Link>
      </PageHeading>
      <SearchBox value={query} onChange={setQuery}>
        <select
          className="select select-bordered h-11 rounded-xl"
          aria-label="Filter stock status"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {["All statuses", "In Stock", "Low Stock", "Out of Stock"].map(
            (s) => (
              <option key={s}>{s}</option>
            ),
          )}
        </select>
      </SearchBox>
      <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-sm">
        <table className="table">
          <thead>
            <tr>
              {[
                "Product",
                "SKU",
                "Category",
                "Stock",
                "Price",
                "Status",
                "Actions",
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <span className="flex min-w-60 items-center gap-3">
                    <ProductMark src={p.imageUrl} alt={`${p.name} thumbnail`} />
                    <span className="font-medium">{p.name}</span>
                  </span>
                </td>
                <td className="text-base-content/55">{p.sku}</td>
                <td className="text-base-content/55">{p.category}</td>
                <td>{p.stock}</td>
                <td className="font-medium">{money(p.price)}</td>
                <td>
                  <Badge>{stockStatus(p)}</Badge>
                </td>
                <td>
                  <EditActions
                    name={p.name}
                    onEdit={() => navigate(`/admin/inventory/${p.id}/edit`)}
                    onDelete={() => {
                      setDeleteError("");
                      setDeleting(p);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!products.length && <Empty />}
      </div>
      <p className="mt-3 text-sm text-base-content/55">
        {products.length} products
      </p>
      {deleting && (
        <ConfirmDelete
          archive={false}
          error={deleteError}
          name={deleting.name}
          loading={isDeleting}
          onClose={() => {
            if (isDeleting) return;
            setDeleting(null);
            setDeleteError("");
          }}
          onConfirm={async () => {
            try {
              setIsDeleting(true);
              setDeleteError("");
              await adminService.deleteProduct(deleting.id);
              await store.refresh("Product deleted successfully.");
              setDeleting(null);
            } catch (err) {
              setDeleteError(err.message || "Failed to delete product.");
            } finally {
              setIsDeleting(false);
            }
          }}
        />
      )}
    </>
  );
}

export function ProductForm({ store }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const existing = store.products.find((p) => p.id === id);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (id && !existing && store.loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-sm text-base-content/60">Loading product...</p>
      </div>
    );
  }

  if (id && !existing && !store.loading)
    return (
      <>
        <PageHeading
          title="Product not found"
          subtitle="This product may have been deleted."
        />
        <Link className="btn btn-primary" to="/admin/inventory">
          Back to inventory
        </Link>
      </>
    );

  async function save(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const form = Object.fromEntries(new FormData(e.currentTarget));
    for (const key of Object.keys(form)) form[key] = form[key].trim();

    if (!form.name || !form.sku) {
      setSubmitting(false);
      return setError("Product name and SKU cannot be blank.");
    }

    if (
      store.products.some(
        (p) => p.id !== id && p.sku.toLowerCase() === form.sku.toLowerCase(),
      )
    ) {
      setSubmitting(false);
      return setError("This SKU already exists. Enter a unique SKU.");
    }

    const payload = {
      name: form.name,
      sku: form.sku.toUpperCase(),
      category: form.category || "Premier League",
      description: form.description || `${form.name} official jersey.`,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : 0,
      cost: form.cost ? Number(form.cost) : 0,
      quantity: Number(form.stock),
      brand: form.supplier || form.brand || "Adidas",
      images: form.imageUrl
        ? [form.imageUrl]
        : existing?.imageUrl
          ? [existing.imageUrl]
          : [],
    };

    try {
      if (existing) {
        await adminService.updateProduct(id, payload);
        await store.refresh("Product updated successfully.");
      } else {
        await adminService.createProduct(payload);
        await store.refresh("Product added successfully.");
      }
      navigate("/admin/inventory");
    } catch (err) {
      setError(
        err.message || "Failed to save product. Please check your inputs.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeading
        title={existing ? "Edit Product" : "Add New Product"}
        subtitle="Manage your products"
      />
      <form
        className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-7"
        onSubmit={save}
        key={id || "new"}
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field
            className="md:col-span-2"
            label="Product Name"
            name="name"
            placeholder="Enter product name"
            defaultValue={existing?.name}
            required
            maxLength={120}
          />
          <Field
            label="SKU"
            name="sku"
            placeholder="e.g. LSP-001"
            defaultValue={existing?.sku}
            required
            maxLength={40}
          />
          <Field label="Category" required>
            <select
              name="category"
              required
              defaultValue={existing?.category || ""}
            >
              <option value="" disabled>
                Select category
              </option>
              {[
                ...new Set(
                  [
                    existing?.category,
                    ...store.products.map((p) => p.category),
                    "Premier League",
                    "La Liga",
                    "Serie A",
                    "Bundesliga",
                    "Ligue 1",
                    "National Teams",
                    "Other",
                  ].filter(Boolean),
                ),
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field
            className="md:col-span-2"
            label="Image URL (optional)"
            name="imageUrl"
            placeholder="https://example.com/jersey.jpg"
            defaultValue={existing?.imageUrl}
          />
          <Field label="Description" className="md:col-span-2" required>
            <textarea
              required
              name="description"
              placeholder="Enter product description"
              defaultValue={existing?.description}
              rows={4}
            />
          </Field>
          <Field
            label="Selling Price (฿) *"
            name="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            defaultValue={existing?.price}
            required
          />
          <Field
            label="Original Price (฿) - ราคาตั้งต้นก่อนลด"
            name="originalPrice"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            defaultValue={existing?.originalPrice || ""}
          />
          <Field
            label="Cost Price (฿) - ราคาทุนหลังบ้าน"
            name="cost"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            defaultValue={existing?.cost || ""}
          />
          <Field
            label={existing ? "Stock" : "Initial Stock"}
            name="stock"
            type="number"
            min="0"
            step="1"
            defaultValue={existing?.stock ?? 0}
            required
          />
          <Field
            label="Reorder Level"
            name="reorder"
            type="number"
            min="0"
            step="1"
            defaultValue={existing?.reorder ?? 0}
          />
          <Field
            label="Supplier"
            name="supplier"
            placeholder="Enter supplier name"
            defaultValue={existing?.supplier}
          />
          <Field
            label="Barcode"
            name="barcode"
            placeholder="Enter barcode"
            defaultValue={existing?.barcode}
          />
        </div>
        {error && (
          <p role="alert" className="alert alert-error mt-5 py-3 text-sm">
            {error}
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-base-300 pt-5">
          <button
            className="btn btn-primary"
            type="submit"
            disabled={submitting}
          >
            <Save size={17} />
            {submitting ? "Saving..." : "Save Product"}
          </button>
          <Link className="btn btn-ghost" to="/admin/inventory">
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
