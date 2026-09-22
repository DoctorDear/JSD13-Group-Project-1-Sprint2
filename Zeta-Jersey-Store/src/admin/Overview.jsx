import { Link } from "react-router-dom";
import {
  DollarSign,
  Users,
  ArrowUpRight,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { ProductMark } from "./AdminUI";

function SalesHistory({ money }) {
  const samples = [
    320, 560, 430, 690, 420, 610, 500, 860, 730, 680, 490, 590, 540, 350,
  ];
  const labels = [
    "Sat",
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
  ];
  return (
    <section className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Sales History</h2>
        <select
          className="select select-bordered select-sm"
          aria-label="Sales history period"
          defaultValue="2 weeks"
        >
          <option>Last 2 weeks</option>
          <option>Last 7 days</option>
        </select>
      </div>
      <div
        className="grid h-72 grid-cols-[2.5rem_minmax(0,1fr)] gap-3"
        role="img"
        aria-label="Sales history for the last two weeks"
      >
        <div className="flex flex-col justify-between pb-6 text-right text-xs text-base-content/50">
          <span>$900</span>
          <span>$675</span>
          <span>$450</span>
          <span>$225</span>
          <span>$0</span>
        </div>
        <div
          className="flex items-end gap-1.5 pb-6"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to top, transparent 0, transparent calc(25% - 1px), color-mix(in oklab, var(--color-base-content) 10%, transparent) calc(25% - 1px), color-mix(in oklab, var(--color-base-content) 10%, transparent) 25%)",
            backgroundSize: "100% calc(100% - 1.5rem)",
            backgroundRepeat: "no-repeat",
          }}
        >
          {samples.map((value, index) => (
            <div
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
              key={`${labels[index]}-${index}`}
            >
              <div
                className={`relative w-full rounded-t-lg ${index === 7 ? "bg-secondary" : "bg-base-300"}`}
                style={{ height: `${value / 9}%` }}
                title={`${labels[index]}: ${money(value)}`}
              >
                {index === 7 && (
                  <span className="absolute bottom-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded border border-base-300 bg-base-100 px-1.5 py-1 text-[10px] shadow-sm">
                    {money(value)}
                  </span>
                )}
              </div>
              <small className="mt-1.5 text-[10px] text-base-content/50">
                {labels[index]}
              </small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function InventoryHealth({ products }) {
  const available = products.filter(
    (product) => product.stock > product.reorder,
  ).length;
  const low = products.filter(
    (product) => product.stock > 0 && product.stock <= product.reorder,
  ).length;
  const out = products.filter((product) => product.stock === 0).length;
  const total = products.length || 1;
  const availableShare = Math.round((available / total) * 100);
  const lowShare = Math.round((low / total) * 100);
  const donutStyle = {
    background: `conic-gradient(var(--color-primary) 0 ${availableShare}%, var(--color-secondary) ${availableShare}% ${availableShare + lowShare}%, var(--color-error) ${availableShare + lowShare}% 100%)`,
  };
  return (
    <section className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Inventory health</h2>
        <Link className="link link-primary text-sm" to="/admin/inventory">
          View inventory
        </Link>
      </div>
      <div
        className="relative mx-auto flex size-48 items-center justify-center rounded-full"
        style={donutStyle}
        role="img"
        aria-label={`${available} products in stock, ${low} products low in stock, and ${out} products out of stock`}
      >
        <div className="flex size-28 flex-col items-center justify-center rounded-full bg-base-100">
          <strong className="text-xl font-semibold">{availableShare}%</strong>
          <span className="text-xs text-base-content/55">Ready to sell</span>
        </div>
      </div>
      <div className="mt-5 space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <i className="size-3 rounded-sm bg-primary" />
          In stock <b className="ml-auto">{available}</b>
        </div>
        <div className="flex items-center gap-2">
          <i className="size-3 rounded-sm bg-secondary" />
          Low stock <b className="ml-auto">{low}</b>
        </div>
        <div className="flex items-center gap-2">
          <i className="size-3 rounded-sm bg-error" />
          Out of stock <b className="ml-auto">{out}</b>
        </div>
      </div>
    </section>
  );
}

export default function Overview({ store, money }) {
  const totalRevenue = store.orders
    .filter((o) => o.status === "Paid")
    .reduce((n, o) => n + o.total, 0);
  const paidOrders = store.orders.filter((o) => o.status === "Paid").length;
  const conversion = store.customers.length
    ? Math.round((paidOrders / store.customers.length) * 100)
    : 0;
  const stats = [
    {
      label: "Total sales",
      value: money(totalRevenue),
      Icon: DollarSign,
      tone: "green",
      detail: "↑ 12.5% from last period",
      to: "/admin/orders",
    },
    {
      label: "Total customers",
      value: store.customers.length.toLocaleString(),
      Icon: Users,
      tone: "blue",
      detail: `${store.customers.filter((c) => c.status === "Active").length} active accounts`,
      to: "/admin/customers",
    },
    {
      label: "Closed orders",
      value: paidOrders,
      Icon: ShoppingBag,
      tone: "purple",
      detail: "↑ 5.6% from last period",
      to: "/admin/orders",
    },
    {
      label: "Conversion rate",
      value: `${conversion}%`,
      Icon: TrendingUp,
      tone: "green",
      detail: "↑ 3.0% from last period",
      to: "/admin/customers",
    },
  ];
  const products = [...store.products]
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5);
  return (
    <>
      <div className="mb-6 flex items-center gap-2 text-sm text-base-content/55">
        <span>Home</span>
        <span>›</span>
        <span className="text-base-content/80">Dashboard</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, Icon, tone, detail, to }, index) => (
          <Link
            className="group flex items-start gap-4 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            to={to}
            key={label}
          >
            <span
              className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${tone === "green" ? "bg-success/15 text-success" : tone === "blue" ? "bg-info/15 text-info" : "bg-primary/10 text-primary"}`}
            >
              <Icon size={19} />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-base-content/55">
                {label}
              </p>
              <strong className="mt-1 block text-2xl font-semibold tracking-tight text-base-content">
                {value}
              </strong>
              <small
                className={`mt-1 flex items-center gap-1 text-xs ${index === 2 ? "text-error" : "text-success"}`}
              >
                {index === 2 ? (
                  <TrendingDown size={11} />
                ) : (
                  <ArrowUpRight size={11} />
                )}
                {detail}
              </small>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,.95fr)]">
        <SalesHistory money={money} />
        <InventoryHealth products={store.products} />
      </div>
      <section className="mt-4 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Top 5 Products</h2>
          <Link className="link link-primary text-sm" to="/admin/inventory">
            View all products
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Collection</th>
                <th>Unit price</th>
                <th>Available</th>
                <th>Stock value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <Link
                      className="flex min-w-56 items-center gap-3"
                      to={`/admin/inventory/${product.id}/edit`}
                    >
                      <ProductMark src={product.imageUrl} alt="" />
                      <span>
                        <strong className="block font-medium">
                          {product.name}
                        </strong>
                        <small className="block text-xs text-base-content/50">
                          {product.brand || "Zeta Jersey"}
                        </small>
                      </span>
                    </Link>
                  </td>
                  <td>
                    <span className="badge badge-ghost badge-sm">
                      {product.team || product.category}
                    </span>
                  </td>
                  <td className="font-medium">{money(product.price)}</td>
                  <td>{product.stock} pcs</td>
                  <td>{money(product.price * product.stock)}</td>
                  <td>
                    <span
                      className={`badge badge-sm ${product.stock <= product.reorder ? "badge-warning" : "badge-success"}`}
                    >
                      {product.stock <= product.reorder
                        ? "Low stock"
                        : "In stock"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
