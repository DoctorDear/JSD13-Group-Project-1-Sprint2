import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Plus } from "lucide-react";
import {
  PageHeading,
  SearchBox,
  Badge,
  ProductMark,
  EditActions,
  Empty,
  ConfirmDelete,
} from "./AdminUI";
import { matches, stockStatus } from "./data";
import { adminService } from "../services/adminService";

export { ProductForm } from "./ProductForm.jsx";

export function Inventory({ store, money }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All statuses");
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingVisibility, setUpdatingVisibility] = useState(null);
  const [visibilityError, setVisibilityError] = useState("");
  const navigate = useNavigate();

  const toggleVisibility = async (product) => {
    setUpdatingVisibility(product.id);
    setVisibilityError("");
    try {
      await adminService.updateProduct(product.id, { isActive: !product.isActive });
      await store.refresh(
        product.isActive ? "Product hidden from store." : "Product visible in store.",
      );
    } catch (error) {
      setVisibilityError(error.message || "Could not update product visibility.");
    } finally {
      setUpdatingVisibility(null);
    }
  };

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
        <table className="table w-full min-w-[1120px]">
          <thead>
            <tr>
              {[
                "Product",
                "SKU",
                "Category",
                "Stock",
                "Price",
                "Status",
                "Store visibility",
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
                <td className="min-w-28 whitespace-nowrap">
                  <Badge>{stockStatus(p)}</Badge>
                </td>
                <td className="min-w-48">
                  <div className="flex w-max items-center gap-2 whitespace-nowrap">
                    <Badge>{p.isActive ? "Visible" : "Hidden"}</Badge>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm gap-1"
                      disabled={updatingVisibility === p.id}
                      onClick={() => toggleVisibility(p)}
                      aria-label={`${p.isActive ? "Hide" : "Show"} ${p.name} ${p.isActive ? "from" : "in"} storefront`}
                    >
                      {updatingVisibility === p.id ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : p.isActive ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                      {p.isActive ? "Hide" : "Show"}
                    </button>
                  </div>
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
        {visibilityError && (
          <p role="alert" className="p-4 text-sm text-error">
            {visibilityError}
          </p>
        )}
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
