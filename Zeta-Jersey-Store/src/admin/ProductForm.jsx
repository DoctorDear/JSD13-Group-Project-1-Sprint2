import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Save } from "lucide-react";
import { PageHeading, Field } from "./AdminUI";
import { adminService } from "../services/adminService";
import {
  getProductPersonalizationFields,
  validateProductForm,
} from "../lib/forms/productForm.js";
import { ImageUrlUploadField, ProductImageGallery } from "./ImageUploadField.jsx";

export function ProductForm({ store }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const existing = store.products.find((p) => p.id === id);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState(() =>
    existing?.images?.length
      ? [...existing.images]
      : existing?.imageUrl
        ? [existing.imageUrl]
        : [],
  );
  const [backImageUrl, setBackImageUrl] = useState(existing?.backImageUrl || "");
  const [imageUploadCount, setImageUploadCount] = useState(0);
  const trackImageUpload = (active) =>
    setImageUploadCount((count) => Math.max(0, count + (active ? 1 : -1)));

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
    const validationErrors = validateProductForm(form, {
      templates: store.templates,
    });
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length) {
      setSubmitting(false);
      return;
    }

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
      date: form.date,
      tag: form.tag
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      brand: form.supplier || form.brand || "Adidas",
      images,
      backImageUrl,
      ...getProductPersonalizationFields(form),
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
        noValidate
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
          {fieldErrors.name && (
            <p role="alert" className="text-error">
              {fieldErrors.name}
            </p>
          )}
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
          <ProductImageGallery
            images={images}
            onChange={setImages}
            onUploadingChange={trackImageUpload}
            disabled={submitting}
          />
          <div className="md:col-span-2">
            <ImageUrlUploadField
              label="Back image for personalization preview (optional)"
              value={backImageUrl}
              onChange={setBackImageUrl}
              onUploadingChange={trackImageUpload}
              purpose="product-back"
              disabled={submitting}
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <span className="text-sm font-medium text-base-content/80">
              Product personalization
            </span>
            <label className="flex w-fit items-center gap-3 rounded-xl border border-base-300 px-3 py-2">
              <input
                className="checkbox checkbox-primary size-5 shrink-0"
                type="checkbox"
                name="personalizationEnabled"
                value="true"
                defaultChecked={existing?.personalizationEnabled === true}
              />
              <span>Allow personalization</span>
            </label>
          </div>
          {fieldErrors.personalizationGroupId && (
            <p role="alert" className="text-error md:col-span-2">
              {fieldErrors.personalizationGroupId}
            </p>
          )}
          <Field className="md:col-span-2" label="Personalization template group">
            <select
              className="select select-bordered w-full"
              name="personalizationGroupId"
              defaultValue={existing?.personalizationGroupId || ""}
            >
              <option value="">No template group</option>
              {store.templates.map((template) => (
                <option key={template.groupId} value={template.groupId}>
                  {template.groupId}
                  {template.active ? "" : " (inactive)"}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Description" className="md:col-span-2" required>
            <textarea
              required
              name="description"
              placeholder="Enter product description"
              defaultValue={existing?.description}
              rows={4}
            />
          </Field>
          {fieldErrors.description && (
            <p role="alert" className="text-error">
              {fieldErrors.description}
            </p>
          )}
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
          {fieldErrors.price && (
            <p role="alert" className="text-error">
              {fieldErrors.price}
            </p>
          )}
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
          {fieldErrors.stock && (
            <p role="alert" className="text-error">
              {fieldErrors.stock}
            </p>
          )}
          <Field
            label="Date"
            name="date"
            type="date"
            defaultValue={
              existing?.date?.slice(0, 10) ||
              new Date().toISOString().slice(0, 10)
            }
            required
          />
          {fieldErrors.date && (
            <p role="alert" className="text-error">
              {fieldErrors.date}
            </p>
          )}
          <Field
            label="Tags (comma separated)"
            name="tag"
            defaultValue={existing?.tag?.join(", ") || ""}
            required
          />
          {fieldErrors.tag && (
            <p role="alert" className="text-error">
              {fieldErrors.tag}
            </p>
          )}
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
            disabled={submitting || imageUploadCount > 0}
          >
            <Save size={17} />
            {imageUploadCount > 0
              ? "Finish image upload first"
              : submitting
                ? "Saving..."
                : "Save Product"}
          </button>
          <Link className="btn btn-ghost" to="/admin/inventory">
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
