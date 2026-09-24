import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
} from "react";
import { Search, X, Package, Pencil, Trash2 } from "lucide-react";

export function PageHeading({ title, subtitle, children }) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-base-content">
          {title}
        </h1>
        <p className="mt-1 text-sm text-base-content/60">{subtitle}</p>
      </div>
      {children}
    </header>
  );
}
export function SearchBox({
  value,
  onChange,
  placeholder = "Search",
  children,
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <label className="input input-bordered flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl">
        <Search size={17} className="text-base-content/45" />
        <input
          className="grow bg-transparent outline-none"
          aria-label={placeholder}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button
            className="btn btn-ghost btn-xs btn-circle"
            type="button"
            aria-label="Clear search"
            onClick={() => onChange("")}
          >
            <X size={15} />
          </button>
        )}
      </label>
      {children}
    </div>
  );
}
export function Badge({ children }) {
  const tone = [
    "Active",
    "In Stock",
    "Stock In",
    "Paid",
    "Completed",
    "Done",
    "Low",
  ].includes(children)
    ? "green"
    : ["Low Stock", "Pending", "Adjustment", "Medium", "In progress"].includes(
          children,
        )
      ? "amber"
      : ["Out of Stock", "Stock Out", "High", "Cancelled"].includes(children)
        ? "red"
        : "gray";
  const toneClass =
    tone === "green"
      ? "badge-success"
      : tone === "amber"
        ? "badge-warning"
        : tone === "red"
          ? "badge-error"
          : "badge-ghost";
  return <span className={`badge badge-sm ${toneClass}`}>{children}</span>;
}
export function ProductMark({ src, alt = "" }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed)
    return (
      <img
        className="size-10 rounded-xl bg-primary/10 object-cover text-primary"
        src={src}
        alt={alt}
        onError={() => setFailed(true)}
      />
    );
  return (
    <span
      className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
      aria-hidden="true"
    >
      <Package size={16} />
    </span>
  );
}
export function Empty({ text = "No results found. Try another search." }) {
  return (
    <div className="flex flex-col items-center gap-3 p-12 text-center text-base-content/60">
      <Package size={30} />
      <p>{text}</p>
    </div>
  );
}
export function EditActions({ name, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-1">
      <button
        className="btn btn-ghost btn-sm btn-square text-primary"
        title={`Edit ${name}`}
        aria-label={`Edit ${name}`}
        onClick={onEdit}
      >
        <Pencil size={15} />
      </button>
      <button
        className="btn btn-ghost btn-sm btn-square text-error"
        title={`Delete ${name}`}
        aria-label={`Delete ${name}`}
        onClick={onDelete}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
export function Field({ label, children, className = "", ...props }) {
  const control =
    children && isValidElement(children) ? (
      cloneElement(children, {
        className:
          `${children.props.className || ""} ${children.type === "select" ? "select select-bordered" : children.type === "textarea" ? "textarea textarea-bordered" : "input input-bordered"} w-full`.trim(),
      })
    ) : (
      <input className="input input-bordered w-full" {...props} />
    );
  return (
    <label className={`form-control gap-2 ${className}`}>
      <span className="text-sm font-medium text-base-content/80">
        {label}
        {props.required && " *"}
      </span>
      {control}
    </label>
  );
}
export function Modal({ title, children, onClose, error }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="fixed inset-0 m-auto h-fit w-full max-w-md rounded-2xl border border-base-300 bg-base-100 p-6 text-base-content shadow-2xl backdrop:bg-black/40"
      aria-labelledby="admin-dialog-title"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <header className="mb-5 flex items-center justify-between gap-4">
        <h2 id="admin-dialog-title" className="text-xl font-semibold">
          {title}
        </h2>
        <button
          className="btn btn-ghost btn-sm btn-square"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </header>
      {error && (
        <p className="alert alert-error mb-4 py-2 text-sm" role="alert">
          {error}
        </p>
      )}
      {children}
    </dialog>
  );
}
export function ConfirmDelete({
  name,
  onClose,
  onConfirm,
  error,
  archive = false,
  loading = false,
}) {
  return (
    <Modal
      title={archive ? "Archive product?" : "Delete record?"}
      onClose={onClose}
      error={error}
    >
      <p className="text-sm leading-6 text-base-content/75">
        {archive ? "Archive" : "Delete"}{" "}
        <strong className="text-base-content">{name}</strong>?{" "}
        {archive
          ? "It will be hidden from the store. Order and movement history will be retained."
          : "This cannot be undone."}
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <button className="btn btn-ghost" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button
          className="btn btn-error flex items-center gap-2"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading && <span className="loading loading-spinner loading-xs"></span>}
          {loading ? "Deleting..." : archive ? "Archive" : "Delete"}
        </button>
      </div>
    </Modal>
  );
}
