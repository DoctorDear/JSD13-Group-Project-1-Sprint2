import { NavLink, Link } from "react-router-dom";
import {
  Box,
  FileText,
  Users,
  ClipboardList,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Home,
  Shirt,
} from "lucide-react";
import logo from "../assets/logo/Zeta_Default_Logo_Crop.png";

const navClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
    isActive
      ? "bg-primary/10 font-semibold text-primary"
      : "text-base-content/65 hover:bg-base-100 hover:text-primary"
  }`;

/**
 * Mobile top bar and collapsible left navigation sidebar for the Admin workspace.
 */
export default function AdminSidebar({
  menuOpen,
  onToggleMenu,
  onCloseMenu,
  onSignOut,
}) {
  return (
    <>
      <div className="flex h-16 items-center justify-between border-b border-base-300 bg-base-100 px-4 lg:hidden">
        <Link to="/admin">
          <img className="h-9 w-auto" src={logo} alt="Zeta" />
        </Link>
        <button
          className="btn btn-ghost btn-square"
          onClick={onToggleMenu}
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
          onClick={onCloseMenu}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-base-300 bg-base-200 px-5 py-6 lg:flex ${
          menuOpen ? "flex" : "hidden"
        }`}
      >
        <Link className="mb-8 px-2" to="/admin" onClick={onCloseMenu}>
          <img className="h-10 w-auto" src={logo} alt="Zeta Jersey" />
        </Link>
        <nav
          className="flex flex-1 flex-col gap-1"
          aria-label="Admin navigation"
          onClick={onCloseMenu}
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
          <NavLink className={navClass} to="/admin/personalization-templates">
            <Shirt size={18} />
            Personalization Templates
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
            onClick={onSignOut}
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
    </>
  );
}
