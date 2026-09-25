import { useState } from "react";
import {
  NavLink,
  Link,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Box,
  FileText,
  Users,
  ClipboardList,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  CheckCircle2,
  Search,
  MessageSquare,
  Bell,
  ChevronDown,
  Home,
} from "lucide-react";
import logo from "../assets/logo/Zeta_Default_Logo_Crop.png";
import { useAuth } from "../contexts/authContext.js";
import { useAdminStore } from "./useAdminStore";
import Overview from "./Overview";
import { Inventory, ProductForm } from "./Inventory";
import Customers from "./Customers";
import StockMovement from "./StockMovement";
import Settings from "./Settings";
import { Orders, Tasks } from "./Operations";

const navClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${isActive ? "bg-primary/10 font-semibold text-primary" : "text-base-content/65 hover:bg-base-100 hover:text-primary"}`;

export default function AdminApp() {
  const store = useAdminStore();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await logout();
    } finally {
      navigate("/auth/login", { replace: true });
    }
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const [topMenu, setTopMenu] = useState(null);
  const location = useLocation();
  const money = (value) =>
    new Intl.NumberFormat(
      store.settings?.currency === "THB" ? "th-TH" : "en-US",
      {
        style: "currency",
        currency: store.settings?.currency || "THB",
      },
    ).format(value);
  const pendingOrders = store.orders.filter((order) =>
    ["Pending", "Processing"].includes(order.status),
  );
  const lowStock = store.products.filter(
    (product) => product.stock <= product.reorder,
  );
  const openTasks = store.tasks.filter((task) => task.status !== "Done");
  const openTopMenu = topMenu?.path === location.pathname ? topMenu.name : null;
  const toggleTopMenu = (name) =>
    setTopMenu((current) =>
      current?.name === name && current.path === location.pathname
        ? null
        : { name, path: location.pathname },
    );
  const menuPanel =
    "absolute right-0 top-full z-50 mt-3 w-80 overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-xl";
  const menuItem =
    "flex items-center gap-3 border-b border-base-200 px-4 py-3 text-left transition hover:bg-base-200/60";

  return (
    <div className="min-h-screen bg-base-100 font-poppins text-base-content">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-content"
        href="#admin-main"
      >
        Skip to content
      </a>
      <div className="flex h-16 items-center justify-between border-b border-base-300 bg-base-100 px-4 lg:hidden">
        <Link to="/admin">
          <img className="h-9 w-auto" src={logo} alt="Zeta" />
        </Link>
        <button
          className="btn btn-ghost btn-square"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>
      {menuOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-base-300 bg-base-200 px-5 py-6 lg:flex ${menuOpen ? "flex" : "hidden"}`}
      >
        <Link
          className="mb-8 px-2"
          to="/admin"
          onClick={() => setMenuOpen(false)}
        >
          <img className="h-10 w-auto" src={logo} alt="Zeta Jersey" />
        </Link>
        <nav
          className="flex flex-1 flex-col gap-1"
          aria-label="Admin navigation"
          onClick={() => setMenuOpen(false)}
        >
          <NavLink className={navClass} to="/admin" end>
            <Home size={18} />
            Dashboard
          </NavLink>
          <NavLink className={navClass} to="/admin/inventory" end>
            <Box size={18} />
            Products
          </NavLink>
          <div className="mb-2 ml-9 flex flex-col gap-1 border-l border-base-300 pl-3 text-xs">
            <NavLink className={navClass} to="/admin/inventory" end>
              All Products
            </NavLink>
            <NavLink className={navClass} to="/admin/inventory/new">
              Add Product
            </NavLink>
            <NavLink className={navClass} to="/admin/stock-movement">
              Stock Movement
            </NavLink>
          </div>
          <NavLink className={navClass} to="/admin/orders">
            <FileText size={18} />
            Orders
          </NavLink>
          <NavLink className={navClass} to="/admin/customers">
            <Users size={18} />
            Customers
          </NavLink>
          <NavLink className={navClass} to="/admin/tasks">
            <ClipboardList size={18} />
            Task Manager
          </NavLink>
          <NavLink className={navClass} to="/admin/settings">
            <SettingsIcon size={18} />
            Settings
          </NavLink>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-base-content/65 transition-colors hover:bg-base-100 hover:text-primary cursor-pointer"
            title="Sign out of Admin"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </nav>
        <div className="mt-auto px-2 text-xs text-base-content/45">
          <span className="mr-2 inline-block size-2 rounded-full bg-success align-middle" />
          Zeta workspace
          <small className="mt-1 block pl-4">
            Changes saved on this device
          </small>
        </div>
      </aside>
      <div className="lg:ml-64">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between gap-4 border-b border-base-300 bg-base-100/95 px-5 backdrop-blur lg:px-8">
          <label className="input input-bordered hidden h-11 max-w-xl flex-1 items-center gap-2 rounded-xl md:flex">
            <Search size={16} className="text-base-content/45" />
            <input
              className="grow bg-transparent outline-none"
              placeholder="Search products, orders, customers..."
              aria-label="Search the Zeta admin workspace"
            />
          </label>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <button
                className={`btn btn-ghost btn-square relative ${openTopMenu === "messages" ? "bg-primary/10 text-primary" : ""}`}
                onClick={() => toggleTopMenu("messages")}
                aria-label="Open messages"
                aria-expanded={openTopMenu === "messages"}
              >
                <MessageSquare size={19} />
                {pendingOrders.length > 0 && (
                  <span className="badge badge-error badge-xs absolute right-1 top-1 text-[10px] text-white">
                    {pendingOrders.length}
                  </span>
                )}
              </button>
              {openTopMenu === "messages" && (
                <div className={menuPanel} role="menu">
                  <div className="flex items-center justify-between border-b border-base-200 px-4 py-3">
                    <strong>Order follow-ups</strong>
                    <span className="text-xs text-base-content/55">
                      {pendingOrders.length} open
                    </span>
                  </div>
                  {pendingOrders.length ? (
                    pendingOrders.map((order) => (
                      <Link
                        className={menuItem}
                        to="/admin/orders"
                        key={order.id}
                      >
                        <span className="size-2 rounded-full bg-info" />
                        <span className="min-w-0 flex-1">
                          <strong className="block truncate text-sm">
                            {order.id}
                          </strong>
                          <small className="block truncate text-xs text-base-content/55">
                            {order.customer} · {money(order.total)}
                          </small>
                        </span>
                        <em className="text-xs not-italic text-info">
                          {order.status}
                        </em>
                      </Link>
                    ))
                  ) : (
                    <p className="px-4 py-5 text-sm text-base-content/55">
                      No orders need attention.
                    </p>
                  )}
                  <Link
                    className="block px-4 py-3 text-sm font-medium text-primary hover:bg-base-200/60"
                    to="/admin/orders"
                  >
                    Open orders
                  </Link>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                className={`btn btn-ghost btn-square relative ${openTopMenu === "notifications" ? "bg-primary/10 text-primary" : ""}`}
                onClick={() => toggleTopMenu("notifications")}
                aria-label="Open notifications"
                aria-expanded={openTopMenu === "notifications"}
              >
                <Bell size={19} />
                {lowStock.length + openTasks.length > 0 && (
                  <span className="badge badge-warning badge-xs absolute right-1 top-1 text-[10px]">
                    {lowStock.length + openTasks.length}
                  </span>
                )}
              </button>
              {openTopMenu === "notifications" && (
                <div className={menuPanel} role="menu">
                  <div className="flex items-center justify-between border-b border-base-200 px-4 py-3">
                    <strong>Notifications</strong>
                    <span className="text-xs text-base-content/55">
                      {lowStock.length + openTasks.length} active
                    </span>
                  </div>
                  {lowStock.slice(0, 2).map((product) => (
                    <Link
                      className={menuItem}
                      to={`/admin/inventory/${product.id}/edit`}
                      key={product.id}
                    >
                      <span className="size-2 rounded-full bg-warning" />
                      <span className="min-w-0 flex-1">
                        <strong className="block truncate text-sm">
                          {product.name}
                        </strong>
                        <small className="block text-xs text-base-content/55">
                          {product.stock} left · reorder at {product.reorder}
                        </small>
                      </span>
                      <em className="text-xs not-italic text-warning">
                        Low stock
                      </em>
                    </Link>
                  ))}
                  {openTasks.slice(0, 2).map((task) => (
                    <Link className={menuItem} to="/admin/tasks" key={task.id}>
                      <span className="size-2 rounded-full bg-info" />
                      <span className="min-w-0 flex-1">
                        <strong className="block truncate text-sm">
                          {task.title}
                        </strong>
                        <small className="block text-xs text-base-content/55">
                          {task.due ? `Due ${task.due}` : "No due date"}
                        </small>
                      </span>
                      <em className="text-xs not-italic text-info">
                        {task.status}
                      </em>
                    </Link>
                  ))}
                  {!lowStock.length && !openTasks.length && (
                    <p className="px-4 py-5 text-sm text-base-content/55">
                      You are all caught up.
                    </p>
                  )}
                  <Link
                    className="block px-4 py-3 text-sm font-medium text-primary hover:bg-base-200/60"
                    to="/admin/tasks"
                  >
                    Open task manager
                  </Link>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                className={`flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-base-200 ${openTopMenu === "account" ? "bg-base-200" : ""}`}
                onClick={() => toggleTopMenu("account")}
                aria-label="Open account menu"
                aria-expanded={openTopMenu === "account"}
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                    : (user?.firstName?.[0] || "A").toUpperCase()}
                </span>
                <span className="hidden text-left sm:block">
                  <strong className="block text-sm">
                    {user
                      ? `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                        user.email
                      : "Admin"}
                  </strong>
                  <small className="block text-xs text-base-content/55 capitalize">
                    {user?.role || "Admin"}
                  </small>
                </span>
                <ChevronDown size={16} />
              </button>
              {openTopMenu === "account" && (
                <div className={`${menuPanel} w-64`} role="menu">
                  <div className="flex items-center gap-3 border-b border-base-200 px-4 py-4">
                    <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                      {user?.firstName && user?.lastName
                        ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                        : (user?.firstName?.[0] || "A").toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      <strong className="block truncate text-sm">
                        {user
                          ? `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                            user.email
                          : "Admin"}
                      </strong>
                      <small className="block truncate text-xs text-base-content/55">
                        {user?.email || "admin@zetastore.com"}
                      </small>
                    </span>
                  </div>
                  <Link
                    className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-base-200/60"
                    to="/admin/settings"
                  >
                    <SettingsIcon size={16} />
                    Settings
                  </Link>
                  <Link
                    className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-base-200/60"
                    to="/"
                  >
                    <Home size={16} />
                    View storefront
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-error hover:bg-error/10 cursor-pointer"
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main
          id="admin-main"
          className="mx-auto max-w-[1800px] p-5 lg:p-8"
          key={location.pathname}
        >
          <Routes>
            <Route index element={<Overview store={store} money={money} />} />
            <Route
              path="dashboard"
              element={<Navigate to="/admin" replace />}
            />
            <Route
              path="inventory"
              element={<Inventory store={store} money={money} />}
            />
            <Route
              path="inventory/new"
              element={<ProductForm store={store} />}
            />
            <Route
              path="inventory/:id/edit"
              element={<ProductForm store={store} />}
            />
            <Route
              path="stock-movement"
              element={<StockMovement store={store} />}
            />
            <Route
              path="customers"
              element={<Customers store={store} money={money} />}
            />
            <Route
              path="users"
              element={<Navigate to="/admin/customers" replace />}
            />
            <Route
              path="orders"
              element={<Orders store={store} money={money} />}
            />
            <Route path="tasks" element={<Tasks store={store} />} />
            <Route path="settings" element={<Settings store={store} />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
      {store.notice && (
        <div
          className="alert alert-success fixed bottom-6 right-6 z-50 w-auto max-w-sm shadow-lg"
          role="status"
        >
          <CheckCircle2 size={19} />
          <span>{store.notice}</span>
          <button
            className="btn btn-ghost btn-xs btn-square ml-auto"
            aria-label="Dismiss notification"
            onClick={() => store.setNotice("")}
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
