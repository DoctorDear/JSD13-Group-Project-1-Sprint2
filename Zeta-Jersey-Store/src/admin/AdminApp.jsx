import { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { CheckCircle2, X } from "lucide-react";
import { useAuth } from "../contexts/authContext.js";
import { useAdminStore } from "./useAdminStore";
import AdminSidebar from "./AdminSidebar.jsx";
import AdminHeader from "./AdminHeader.jsx";
import Overview from "./Overview";
import { Inventory } from "./Inventory";
import { ProductForm } from "./ProductForm.jsx";
import Customers from "./Customers";
import StockMovement from "./StockMovement";
import Settings from "./Settings";
import { Orders, Tasks } from "./Operations";
import PersonalizationTemplates from "./PersonalizationTemplates";

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

  return (
    <div className="min-h-screen bg-base-100 font-poppins text-base-content">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-content"
        href="#admin-main"
      >
        Skip to content
      </a>
      <AdminSidebar
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((open) => !open)}
        onCloseMenu={() => setMenuOpen(false)}
        onSignOut={handleSignOut}
      />
      <div className="lg:ml-64">
        <AdminHeader
          user={user}
          pendingOrders={pendingOrders}
          lowStock={lowStock}
          openTasks={openTasks}
          money={money}
          openTopMenu={openTopMenu}
          onToggleTopMenu={toggleTopMenu}
          onSignOut={handleSignOut}
        />
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
              path="personalization-templates"
              element={<PersonalizationTemplates store={store} />}
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
