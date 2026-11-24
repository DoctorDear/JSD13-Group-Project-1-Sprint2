import { Link } from "react-router-dom";
import {
  Search,
  MessageSquare,
  Bell,
  ChevronDown,
  Settings as SettingsIcon,
  Home,
  LogOut,
} from "lucide-react";

const MENU_PANEL =
  "absolute right-0 top-full z-50 mt-3 w-80 overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-xl";
const MENU_ITEM =
  "flex items-center gap-3 border-b border-base-200 px-4 py-3 text-left transition hover:bg-base-200/60";

function getInitials(user) {
  if (user?.firstName && user?.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  return (user?.firstName?.[0] || "A").toUpperCase();
}

function getDisplayName(user) {
  if (!user) return "Admin";
  return `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email;
}

/**
 * Sticky top header for the Admin workspace with search, order alerts, notifications, and account menu.
 */
export default function AdminHeader({
  user,
  pendingOrders,
  lowStock,
  openTasks,
  money,
  openTopMenu,
  onToggleTopMenu,
  onSignOut,
}) {
  const initials = getInitials(user);
  const displayName = getDisplayName(user);

  return (
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
            className={`btn btn-ghost btn-square relative ${
              openTopMenu === "messages" ? "bg-primary/10 text-primary" : ""
            }`}
            onClick={() => onToggleTopMenu("messages")}
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
            <div className={MENU_PANEL} role="menu">
              <div className="flex items-center justify-between border-b border-base-200 px-4 py-3">
                <strong>Order follow-ups</strong>
                <span className="text-xs text-base-content/55">
                  {pendingOrders.length} open
                </span>
              </div>
              {pendingOrders.length ? (
                pendingOrders.map((order) => (
                  <Link className={MENU_ITEM} to="/admin/orders" key={order.id}>
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
            className={`btn btn-ghost btn-square relative ${
              openTopMenu === "notifications" ? "bg-primary/10 text-primary" : ""
            }`}
            onClick={() => onToggleTopMenu("notifications")}
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
            <div className={MENU_PANEL} role="menu">
              <div className="flex items-center justify-between border-b border-base-200 px-4 py-3">
                <strong>Notifications</strong>
                <span className="text-xs text-base-content/55">
                  {lowStock.length + openTasks.length} active
                </span>
              </div>
              {lowStock.slice(0, 2).map((product) => (
                <Link
                  className={MENU_ITEM}
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
                  <em className="text-xs not-italic text-warning">Low stock</em>
                </Link>
              ))}
              {openTasks.slice(0, 2).map((task) => (
                <Link className={MENU_ITEM} to="/admin/tasks" key={task.id}>
                  <span className="size-2 rounded-full bg-info" />
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm">
                      {task.title}
                    </strong>
                    <small className="block text-xs text-base-content/55">
                      {task.due ? `Due ${task.due}` : "No due date"}
                    </small>
                  </span>
                  <em className="text-xs not-italic text-info">{task.status}</em>
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
            className={`flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-base-200 ${
              openTopMenu === "account" ? "bg-base-200" : ""
            }`}
            onClick={() => onToggleTopMenu("account")}
            aria-label="Open account menu"
            aria-expanded={openTopMenu === "account"}
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
              {initials}
            </span>
            <span className="hidden text-left sm:block">
              <strong className="block text-sm">{displayName}</strong>
              <small className="block text-xs text-base-content/55 capitalize">
                {user?.role || "Admin"}
              </small>
            </span>
            <ChevronDown size={16} />
          </button>
          {openTopMenu === "account" && (
            <div className={`${MENU_PANEL} w-64`} role="menu">
              <div className="flex items-center gap-3 border-b border-base-200 px-4 py-4">
                <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  {initials}
                </span>
                <span className="min-w-0 flex-1 truncate">
                  <strong className="block truncate text-sm">
                    {displayName}
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
                onClick={onSignOut}
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
  );
}
