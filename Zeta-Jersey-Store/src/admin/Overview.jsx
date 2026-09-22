import { Link } from 'react-router-dom';
import { DollarSign, Users, ArrowUpRight, ShoppingBag, TrendingUp, TrendingDown } from 'lucide-react';
import { ProductMark } from './components';

function SalesHistory({ money }) {
  const samples = [320, 560, 430, 690, 420, 610, 500, 860, 730, 680, 490, 590, 540, 350];
  const labels = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  return <section className="ad-panel ad-sales-panel"><div className="ad-section-heading"><h2>Sales History</h2><select aria-label="Sales history period" defaultValue="2 weeks"><option>Last 2 weeks</option><option>Last 7 days</option></select></div><div className="ad-sales-chart" role="img" aria-label="Sales history for the last two weeks"><div className="ad-y-axis"><span>$900</span><span>$675</span><span>$450</span><span>$225</span><span>$0</span></div><div className="ad-bars">{samples.map((value, index) => <div className="ad-bar-column" key={`${labels[index]}-${index}`}><div className={`ad-bar ${index === 7 ? 'is-highlighted' : ''}`} style={{ height: `${value / 9}%` }} title={`${labels[index]}: ${money(value)}`}><span>{index === 7 ? money(value) : ''}</span></div><small>{labels[index]}</small></div>)}</div></div></section>;
}

function InventoryHealth({ products }) {
  const available = products.filter(product => product.stock > product.reorder).length;
  const low = products.filter(product => product.stock > 0 && product.stock <= product.reorder).length;
  const out = products.filter(product => product.stock === 0).length;
  const total = products.length || 1;
  const availableShare = Math.round(available / total * 100);
  const lowShare = Math.round(low / total * 100);
  const outShare = Math.max(0, 100 - availableShare - lowShare);
  return <section className="ad-panel ad-segmentation"><div className="ad-section-heading"><h2>Inventory health</h2><Link to="/admin/inventory">View inventory</Link></div><div className="ad-donut ad-inventory-donut" style={{ '--available': `${availableShare}%`, '--low': `${lowShare}%`, '--out': `${outShare}%` }} role="img" aria-label={`${available} products in stock, ${low} products low in stock, and ${out} products out of stock`}><strong>{availableShare}%</strong><span>Ready to sell</span></div><div className="ad-chart-legend"><div><i className="available" />In stock <b>{available}</b></div><div><i className="low" />Low stock <b>{low}</b></div><div><i className="out" />Out of stock <b>{out}</b></div></div></section>;
}

export default function Overview({ store, money }) {
  const totalRevenue = store.orders.filter(o => o.status === 'Paid').reduce((n, o) => n + o.total, 0);
  const paidOrders = store.orders.filter(o => o.status === 'Paid').length;
  const conversion = store.customers.length ? Math.round(paidOrders / store.customers.length * 100) : 0;
  const stats = [
    { label: 'Total sales', value: money(totalRevenue), Icon: DollarSign, tone: 'green', detail: '↑ 12.5% from last period', to: '/admin/orders' },
    { label: 'Total customers', value: store.customers.length.toLocaleString(), Icon: Users, tone: 'blue', detail: `${store.customers.filter(c => c.status === 'Active').length} active accounts`, to: '/admin/customers' },
    { label: 'Closed orders', value: paidOrders, Icon: ShoppingBag, tone: 'purple', detail: '↑ 5.6% from last period', to: '/admin/orders' },
    { label: 'Conversion rate', value: `${conversion}%`, Icon: TrendingUp, tone: 'green', detail: '↑ 3.0% from last period', to: '/admin/customers' },
  ];
  const products = [...store.products].sort((a, b) => b.stock - a.stock).slice(0, 5);
  return <><div className="ad-breadcrumb">Home <span>›</span> Dashboard</div><div className="ad-stats-grid">{stats.map(({ label, value, Icon, tone, detail, to }, index) => <Link className="ad-panel ad-stat" to={to} key={label}><span className={`ad-stat-icon ${tone}`}><Icon size={17} /></span><div><p>{label}</p><strong>{value}</strong><small className={index === 2 ? 'is-negative' : ''}>{index === 2 ? <TrendingDown size={11} /> : <ArrowUpRight size={11} />}{detail}</small></div></Link>)}</div><div className="ad-overview-grid"><SalesHistory money={money} /><InventoryHealth products={store.products} /></div><section className="ad-panel ad-product-summary"><div className="ad-section-heading"><h2>Top 5 Products</h2><Link to="/admin/inventory">View all products</Link></div><div className="ad-table-wrap"><table><thead><tr><th>Product</th><th>Collection</th><th>Unit price</th><th>Available</th><th>Stock value</th><th>Status</th></tr></thead><tbody>{products.map(product => <tr key={product.id}><td><Link className="ad-dashboard-product" to={`/admin/inventory/${product.id}/edit`}><ProductMark src={product.imageUrl} alt="" /><span><strong>{product.name}</strong><small>{product.brand || 'Zeta Jersey'}</small></span></Link></td><td><span className="ad-team-chip">{product.team || product.category}</span></td><td>{money(product.price)}</td><td>{product.stock} pcs</td><td>{money(product.price * product.stock)}</td><td><span className={`ad-table-status ${product.stock <= product.reorder ? 'low' : ''}`}>{product.stock <= product.reorder ? 'Low stock' : 'In stock'}</span></td></tr>)}</tbody></table></div></section></>;
}
