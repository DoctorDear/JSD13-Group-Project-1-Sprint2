import { useState } from 'react';
import { Plus, Mail, Phone, Eye, Save } from 'lucide-react';
import { PageHeading, SearchBox, Badge, EditActions, Empty, Field, Modal, ConfirmDelete } from './components';
import { matches } from './data';

export default function Customers({ store, money }) {
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const customers = store.customers.filter(c => matches(query, c.name, c.email));
  async function save(e) {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.currentTarget));
    for (const key of Object.keys(form)) form[key] = form[key].trim();
    if (!form.name) return setError('Customer name cannot be blank.');
    if (store.customers.some(c => c.id !== editing.id && c.email.toLowerCase() === form.email.toLowerCase())) return setError('A customer with this email already exists.');
    const customer = { orders: 0, spent: 0, ...editing, ...form, id: editing.id || crypto.randomUUID() };
    if (!await store.update({ customers: editing.id ? store.customers.map(c => c.id === editing.id ? customer : c) : [...store.customers, customer] }, 'Customer saved.')) return;
    setEditing(null);
  }
  return <><PageHeading title="Customers" subtitle="Manage your customer database"><button className="ad-button accent" onClick={() => { setError(''); setEditing({}); }}><Plus size={16} />Add Customer</button></PageHeading><SearchBox value={query} onChange={setQuery} placeholder="Search customers by name or email..." /><div className="ad-customer-grid">{customers.map(c => <article className="ad-panel ad-customer" key={c.id}><div className="ad-card-top"><span className="ad-avatar">{c.name[0]}</span><Badge>{c.status}</Badge></div><h2>{c.name}</h2>{c.kind === 'user' && <small className="muted">Registered account · read only</small>}<p className="ad-contact"><Mail size={14} />{c.email}</p><p className="ad-contact"><Phone size={14} />{c.phone || 'No phone number'}</p><div className="ad-customer-stats"><div><span>Total Orders</span><strong>{c.orders}</strong></div><div><span>Total Spent</span><strong>{money(c.spent)}</strong></div></div><div className="ad-customer-actions"><button className="ad-button accent" onClick={() => setViewing(c)}><Eye size={14} />View Details</button>{c.kind !== 'user' && <EditActions name={c.name} onEdit={() => { setError(''); setEditing(c); }} onDelete={() => setDeleting(c)} />}</div></article>)}</div>{!customers.length && <Empty />}{editing && <Modal error={store.saveError} title={editing.id ? 'Edit Customer' : 'Add Customer'} onClose={() => setEditing(null)}><form onSubmit={save}><div className="ad-form-grid"><Field className="full" label="Company / Customer Name" name="name" required defaultValue={editing.name} maxLength={120} /><Field className="full" label="Email" name="email" type="email" required defaultValue={editing.email} /><Field label="Phone" name="phone" type="tel" defaultValue={editing.phone} /><Field label="Status"><select name="status" defaultValue={editing.status || 'Active'}><option>Active</option><option>Inactive</option></select></Field></div>{error && <p role="alert" className="ad-error">{error}</p>}<div className="ad-form-actions"><button className="ad-button accent"><Save size={16} />Save Customer</button><button type="button" className="ad-button secondary" onClick={() => setEditing(null)}>Cancel</button></div></form></Modal>}{viewing && <Modal error={store.saveError} title={viewing.name} onClose={() => setViewing(null)}><Badge>{viewing.status}</Badge><p className="ad-contact"><Mail size={16} />{viewing.email}</p><p className="ad-contact"><Phone size={16} />{viewing.phone || 'No phone number'}</p><div className="ad-customer-stats"><div><span>Total Orders</span><strong>{viewing.orders}</strong></div><div><span>Total Spent</span><strong>{money(viewing.spent)}</strong></div></div><h3>Recent orders</h3>{store.orders.filter(o => o.customer === viewing.name).map(o => <div className="ad-activity" key={o.id}><div>{o.id}<small>{o.date}</small></div><div>{money(o.total)}<small><Badge>{o.status}</Badge></small></div></div>)}{!store.orders.some(o => o.customer === viewing.name) && <p className="muted">No orders found for this customer.</p>}</Modal>}{deleting && <ConfirmDelete error={store.saveError} name={deleting.name} onClose={() => setDeleting(null)} onConfirm={async () => { if (!await store.update({ customers: store.customers.filter(c => c.id !== deleting.id) }, 'Customer deleted.')) return; setDeleting(null); }} />}</>;
}
