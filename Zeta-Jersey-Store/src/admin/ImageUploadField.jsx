import { useState } from "react";
import { adminService } from "../services/adminService.js";

export function ImageUrlUploadField({ label, value, onChange, onUploadingChange, purpose, disabled = false }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(file) {
    if (!file) return;
    setUploading(true);
    onUploadingChange?.(true);
    setError("");
    try {
      const result = await adminService.uploadImage(file, purpose);
      onChange(result.url);
    } catch (uploadError) {
      setError(uploadError.message || "Image upload failed.");
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  }

  return (
    <label className="flex flex-col gap-1.5 text-sm w-full">
      <span className="font-medium text-base-content/85">{label}</span>
      <input
        className="input input-bordered w-full text-xs font-mono"
        value={value}
        disabled={disabled || uploading}
        onChange={(event) => onChange(event.target.value)}
        placeholder="https://... or /images/..."
      />
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={disabled || uploading}
        onChange={(event) => {
          upload(event.target.files?.[0]);
          event.target.value = "";
        }}
        aria-label={`Upload ${label.toLowerCase()}`}
        className="file-input file-input-bordered file-input-sm w-full"
      />
      {uploading && <span role="status" className="text-xs text-base-content/60">Uploading image…</span>}
      {error && <span role="alert" className="text-xs text-error">{error}</span>}
      {value && <img src={value} alt="Image preview" className="mt-1 max-h-36 w-fit rounded-lg border border-base-300 object-contain" />}
    </label>
  );
}

export function ProductImageGallery({ images, onChange, onUploadingChange, disabled = false }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const additionsBlocked = images.length >= 10;

  async function uploadFiles(files) {
    const selected = [...files];
    if (!selected.length) return;
    if (additionsBlocked || selected.length > 10 - images.length) {
      setUploadError(`The product gallery can contain up to 10 images.`);
      return;
    }
    setUploading(true);
    onUploadingChange?.(true);
    setUploadError("");
    const uploaded = [];
    for (const file of selected) {
      try {
        const result = await adminService.uploadImage(file, "product");
        uploaded.push(result.url);
        onChange([...images, ...uploaded]);
      } catch (error) {
        setUploadError(`${file.name}: ${error.message || "Upload failed."} Earlier successful uploads were kept.`);
        break;
      }
    }
    setUploading(false);
    onUploadingChange?.(false);
  }

  const updateAt = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <section className="md:col-span-2 space-y-3" aria-label="Product image gallery">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium text-sm">Product images ({images.length}/10)</span>
        <label className="btn btn-sm btn-outline">
          {uploading ? "Uploading…" : "Upload images"}
          <input type="file" className="sr-only" accept="image/jpeg,image/png,image/webp" multiple disabled={disabled || uploading || additionsBlocked} onChange={(event) => { uploadFiles(event.target.files || []); event.target.value = ""; }} />
        </label>
      </div>
      {images.length > 0 && <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((url, index) => <li key={`${url}-${index}`} className="rounded-xl border border-base-300 p-2 space-y-2">
          <img src={url} alt={`Product image ${index + 1}`} className="h-28 w-full rounded-lg object-contain bg-base-200" />
          <p className="truncate text-xs text-base-content/65" title={url}>{index === 0 ? "Cover · " : ""}{url}</p>
          <div className="flex justify-between gap-1">
            <button type="button" className="btn btn-xs" disabled={disabled || uploading || index === 0} onClick={() => updateAt(index, -1)} aria-label={`Move image ${index + 1} up`}>↑</button>
            <button type="button" className="btn btn-xs" disabled={disabled || uploading || index === images.length - 1} onClick={() => updateAt(index, 1)} aria-label={`Move image ${index + 1} down`}>↓</button>
            <button type="button" className="btn btn-xs btn-error btn-outline" disabled={disabled || uploading} onClick={() => onChange(images.filter((_, imageIndex) => imageIndex !== index))} aria-label={`Remove image ${index + 1}`}>Remove</button>
          </div>
        </li>)}
      </ol>}
      {images.length >= 10 && <p className="text-xs text-warning">Remove an image before adding more.</p>}
      <div className="flex gap-2">
        <input className="input input-bordered input-sm flex-1" aria-label="External image URL" placeholder="Add an external image URL" value={manualUrl} disabled={disabled || uploading || additionsBlocked} onChange={(event) => setManualUrl(event.target.value)} />
        <button type="button" className="btn btn-sm btn-outline" disabled={disabled || uploading || additionsBlocked || !manualUrl.trim()} onClick={() => { onChange([...images, manualUrl.trim()]); setManualUrl(""); }}>Add URL</button>
      </div>
      {uploadError && <p role="alert" className="text-sm text-error">{uploadError}</p>}
    </section>
  );
}
