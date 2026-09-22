import { cloneElement, isValidElement, useEffect, useRef, useState } from 'react';
import { Search, X, Package, Pencil, Trash2 } from 'lucide-react';

export function PageHeading({ title, subtitle, children }) {
  return <header className="ad-heading"><div><h1>{title}</h1><p>{subtitle}</p></div>{children}</header>;
}
export function SearchBox({ value, onChange, placeholder = 'Search', children }) {
  return <div className="ad-search-row"><label className="ad-search input input-bordered"><Search size={17} /><input aria-label={placeholder} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />{value && <button type="button" aria-label="Clear search" onClick={() => onChange('')}><X size={15} /></button>}</label>{children}</div>;
}
export function Badge({ children }) {
  const tone = ['Active', 'In Stock', 'Stock In', 'Paid', 'Completed', 'Done', 'Low'].includes(children) ? 'green' : ['Low Stock', 'Pending', 'Adjustment', 'Medium', 'In progress'].includes(children) ? 'amber' : ['Out of Stock', 'Stock Out', 'High', 'Cancelled'].includes(children) ? 'red' : 'gray';
  return <span className={`ad-badge ${tone}`}>{children}</span>;
}
export function ProductMark({ src, alt = '' }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) return <img className="ad-product-mark ad-product-thumb" src={src} alt={alt} onError={() => setFailed(true)} />;
  return <span className="ad-product-mark" aria-hidden="true"><Package size={16} /></span>;
}
export function Empty({ text = 'No results found. Try another search.' }) { return <div className="ad-empty"><Package size={30} /><p>{text}</p></div>; }
export function EditActions({ name, onEdit, onDelete }) {
  return <div className="ad-actions"><button className="ad-icon-button" title={`Edit ${name}`} aria-label={`Edit ${name}`} onClick={onEdit}><Pencil size={15} /></button><button className="ad-icon-button danger" title={`Delete ${name}`} aria-label={`Delete ${name}`} onClick={onDelete}><Trash2 size={15} /></button></div>;
}
export function Field({ label, children, className = '', ...props }) {
  const control = children && isValidElement(children) ? cloneElement(children, { className: `${children.props.className || ''} ad-control ${children.type === 'select' ? 'select select-bordered' : children.type === 'textarea' ? 'textarea textarea-bordered' : 'input input-bordered'}`.trim() }) : <input className="ad-control input input-bordered" {...props} />;
  return <label className={`ad-field ${className}`}><span>{label}{props.required && ' *'}</span>{control}</label>;
}
export function Modal({ title, children, onClose, error }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return <dialog ref={ref} className="ad-modal" aria-labelledby="ad-dialog-title" onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}><header><h2 id="ad-dialog-title">{title}</h2><button className="ad-icon-button" aria-label="Close dialog" onClick={onClose}><X size={20} /></button></header>{error && <p className="ad-error" role="alert">{error}</p>}{children}</dialog>;
}
export function ConfirmDelete({ name, onClose, onConfirm, error, archive = false }) {
  return <Modal title={archive ? "Archive product?" : "Delete record?"} onClose={onClose} error={error}><p>{archive ? "Archive" : "Delete"} <strong>{name}</strong>? {archive ? "It will be hidden from the store. Order and movement history will be retained." : "This cannot be undone."}</p><div className="ad-form-actions"><button className="ad-button secondary" onClick={onClose}>Cancel</button><button className="ad-button destructive" onClick={onConfirm}>{archive ? "Archive" : "Delete"}</button></div></Modal>;
}
