import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, Save } from 'lucide-react';
import { PageHeading, SearchBox, Badge, ProductMark, EditActions, Empty, Field, ConfirmDelete } from './components';
import { matches, stockStatus } from './data';

export function Inventory({ store, money }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All statuses');
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();
  const products = store.products.filter(p => matches(query, p.name, p.sku, p.category) && (filter === 'All statuses' || stockStatus(p) === filter));
  return <><PageHeading title="Inventory Management" subtitle="Manage your products"><Link className="btn btn-primary" to="/admin/inventory/new"><Plus size={16} />Add Product</Link></PageHeading><SearchBox value={query} onChange={setQuery}><select className="select select-bordered h-11 rounded-xl" aria-label="Filter stock status" value={filter} onChange={e => setFilter(e.target.value)}>{['All statuses', 'In Stock', 'Low Stock', 'Out of Stock'].map(s => <option key={s}>{s}</option>)}</select></SearchBox><div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-sm"><table className="table"><thead><tr>{['Product', 'SKU', 'Category', 'Stock', 'Price', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{products.map(p => <tr key={p.id}><td><span className="flex min-w-60 items-center gap-3"><ProductMark src={p.imageUrl} alt={`${p.name} thumbnail`} /><span className="font-medium">{p.name}</span></span></td><td className="text-base-content/55">{p.sku}</td><td className="text-base-content/55">{p.category}</td><td>{p.stock}</td><td className="font-medium">{money(p.price)}</td><td><Badge>{stockStatus(p)}</Badge></td><td><EditActions name={p.name} onEdit={() => navigate(`/admin/inventory/${p.id}/edit`)} onDelete={() => setDeleting(p)} /></td></tr>)}</tbody></table>{!products.length && <Empty />}</div><p className="mt-3 text-sm text-base-content/55">{products.length} products</p>{deleting && <ConfirmDelete archive error={store.saveError} name={deleting.name} onClose={() => setDeleting(null)} onConfirm={async () => { if (!await store.update({ products: store.products.filter(p => p.id !== deleting.id) }, 'Product archived. Stock movement history retained.')) return; setDeleting(null); }} />}</>;
}

export function ProductForm({ store }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const existing = store.products.find(p => p.id === id);
  const [error, setError] = useState('');
  if (id && !existing) return <><PageHeading title="Product not found" subtitle="This product may have been deleted." /><Link className="btn btn-primary" to="/admin/inventory">Back to inventory</Link></>;
  async function save(e) {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.currentTarget));
    for (const key of Object.keys(form)) form[key] = form[key].trim();
    if (!form.name || !form.sku) return setError('Product name and SKU cannot be blank.');
    if (store.products.some(p => p.id !== id && p.sku.toLowerCase() === form.sku.toLowerCase())) return setError('This SKU already exists. Enter a unique SKU.');
    const product = { ...form, id: id || crypto.randomUUID(), stock: Number(form.stock), price: Number(form.price), cost: Number(form.cost), reorder: Number(form.reorder) };
    const delta = product.stock - (existing?.stock || 0);
    const movements = delta ? [{ id: crypto.randomUUID(), productId: product.id, name: product.name, sku: product.sku, type: existing ? 'Adjustment' : 'Stock In', quantity: delta, source: existing ? 'Product edit' : 'Initial stock', date: new Date().toISOString() }, ...store.movements] : store.movements;
    if (!await store.update({ products: existing ? store.products.map(p => p.id === id ? product : p) : [...store.products, product], movements }, existing ? 'Product updated.' : 'Product added.')) return;
    navigate('/admin/inventory');
  }
  return <><PageHeading title={existing ? 'Edit Product' : 'Add New Product'} subtitle="Manage your products" /><form className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-7" onSubmit={save} key={id || 'new'}><div className="grid grid-cols-1 gap-5 md:grid-cols-2"><Field className="md:col-span-2" label="Product Name" name="name" placeholder="Enter product name" defaultValue={existing?.name} required maxLength={120} /><Field label="SKU" name="sku" placeholder="e.g. LSP-001" defaultValue={existing?.sku} required maxLength={40} /><Field label="Category" required><select name="category" required defaultValue={existing?.category || ''}><option value="" disabled>Select category</option>{[...new Set([existing?.category, ...store.products.map(p => p.category), 'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'National Teams', 'Other'].filter(Boolean))].map(c => <option key={c}>{c}</option>)}</select></Field><Field label="Description" className="md:col-span-2" required><textarea required name="description" placeholder="Enter product description" defaultValue={existing?.description} rows={4} /></Field><Field label="Selling Price" name="price" type="number" min="0" step="0.01" placeholder="0.00" defaultValue={existing?.price} required /><Field label="Cost Price" name="cost" type="number" min="0" step="0.01" placeholder="0.00" defaultValue={existing?.cost} /><Field label={existing ? 'Stock' : 'Initial Stock'} name="stock" type="number" min="0" step="1" defaultValue={existing?.stock ?? 0} required /><Field label="Reorder Level" name="reorder" type="number" min="0" step="1" defaultValue={existing?.reorder ?? 0} /><Field label="Supplier" name="supplier" placeholder="Enter supplier name" defaultValue={existing?.supplier} /><Field label="Barcode" name="barcode" placeholder="Enter barcode" defaultValue={existing?.barcode} /></div>{error && <p role="alert" className="alert alert-error mt-5 py-3 text-sm">{error}</p>}<div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-base-300 pt-5"><button className="btn btn-primary" type="submit"><Save size={17} />Save Product</button><Link className="btn btn-ghost" to="/admin/inventory">Cancel</Link></div></form></>;
}
