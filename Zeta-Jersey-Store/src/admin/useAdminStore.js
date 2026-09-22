import { useEffect, useState } from "react";
import {
  initialProducts,
  initialCustomers,
  initialMovements,
  initialOrders,
  initialSettings,
  initialTasks,
} from "./data";

const KEY = "zeta-admin-demo-v2";
const seed = {
  products: initialProducts,
  customers: initialCustomers,
  movements: initialMovements,
  orders: initialOrders,
  settings: initialSettings,
  tasks: initialTasks,
};
function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (
      saved &&
      ["products", "customers", "movements", "orders", "tasks"].every((key) =>
        Array.isArray(saved[key]),
      ) &&
      saved.settings &&
      ["USD", "THB", "EUR", "GBP"].includes(saved.settings.currency)
    )
      return saved;
  } catch {
    /* A blocked or invalid browser store falls back to demo data. */
  }
  return seed;
}
export function useAdminStore() {
  const [data, setData] = useState(load);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(timer);
  }, [notice]);
  function update(changes, message = "Changes saved.") {
    const next = { ...data, ...changes };
    setData(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      setNotice(message);
      return true;
    } catch {
      setNotice(
        "Changes are available for this session only. Browser storage is unavailable.",
      );
      return true;
    }
  }
  return {
    ...data,
    update,
    notice,
    setNotice,
    loading: false,
    loadError: "",
    saveError: "",
    saving: false,
    reload: () => setData(load()),
  };
}
