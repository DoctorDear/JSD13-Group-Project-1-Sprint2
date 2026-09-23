import { useEffect, useState, useCallback } from "react";
import { adminService } from "../services/adminService";
import {
  initialCustomers,
  initialMovements,
  initialSettings,
  initialTasks,
} from "./data";

// ฟังก์ชันแปลง Product จาก MongoDB ให้เข้ากับ UI ของ Admin
function normalizeProduct(p) {
  return {
    id: p._id || p.id,
    sku: p.sku || "",
    name: p.name || "",
    category: p.category || "Jerseys",
    stock: Number(p.quantity ?? p.stock ?? 0),
    price: Number(p.price ?? 0),
    cost: Number(p.cost ?? 0),
    reorder: Number(p.reorder ?? 10),
    imageUrl: p.images?.[0] || p.imageUrl || "",
    description: p.description || "",
    brand: p.brand || "Adidas",
    raw: p, // เก็บข้อมูลดิบจาก backend ไว้เผื่อใช้
  };
}

// ฟังก์ชันแปลง Order จาก MongoDB ให้เข้ากับ UI ของ Admin
function normalizeOrder(o) {
  const customerName = o.userId
    ? `${o.userId.firstName || ""} ${o.userId.lastName || ""}`.trim() || o.userId.email
    : "Guest Customer";

  return {
    id: o.orderNumber || o._id,
    mongoId: o._id,
    customer: customerName,
    email: o.userId?.email || "",
    date: new Date(o.createdAt).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    total: o.totalAmount || 0,
    status: o.orderStatus ? o.orderStatus.charAt(0).toUpperCase() + o.orderStatus.slice(1) : "Pending",
    rawStatus: o.orderStatus,
    items: o.items || [],
  };
}

export function useAdminStore() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState("");

  // ฟังก์ชันดึงข้อมูลทั้งหมดจาก Backend
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ดึงสินค้าและออเดอร์พร้อมกันแบบขนาน (Parallel)
      const [productsRes, ordersRes] = await Promise.allSettled([
        adminService.getProducts(),
        adminService.getOrders(),
      ]);

      if (productsRes.status === "fulfilled") {
        const rawProducts = Array.isArray(productsRes.value)
          ? productsRes.value
          : productsRes.value.products || [];
        setProducts(rawProducts.map(normalizeProduct));
      } else {
        console.error("Failed to load products:", productsRes.reason);
      }

      if (ordersRes.status === "fulfilled") {
        const rawOrders = ordersRes.value.orders || [];
        setOrders(rawOrders.map(normalizeOrder));
      } else {
        console.error("Failed to load orders:", ordersRes.reason);
      }
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ซ่อน Notice อัตโนมัติใน 4.5 วินาที
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(timer);
  }, [notice]);

  // ฟังก์ชันช่วยสำหรับการ Refresh ข้อมูลล่าสุด
  const refresh = async (message) => {
    await fetchData();
    if (message) setNotice(message);
  };

  return {
    products,
    orders,
    customers: initialCustomers,
    movements: initialMovements,
    settings: initialSettings,
    tasks: initialTasks,
    loading,
    error,
    notice,
    setNotice,
    refresh,
    reload: fetchData,
  };
}

// === code before edit ===
// const KEY = "zeta-admin-demo-v2";
// const seed = {
//   products: initialProducts,
//   customers: initialCustomers,
//   movements: initialMovements,
//   orders: initialOrders,
//   settings: initialSettings,
//   tasks: initialTasks,
// };

// function load() {
//   try {
//     const saved = JSON.parse(localStorage.getItem(KEY));
//     if (
//       saved &&
//       ["products", "customers", "movements", "orders", "tasks"].every((key) =>
//         Array.isArray(saved[key]),
//       ) &&
//       saved.settings &&
//       ["USD", "THB", "EUR", "GBP"].includes(saved.settings.currency)
//     )
//       return saved;
//   } catch {
//     /* A blocked or invalid browser store falls back to demo data. */
//   }
//   return seed;
// }

// export function useAdminStore() {
//   const [data, setData] = useState(load);
//   const [notice, setNotice] = useState("");
//   useEffect(() => {
//     if (!notice) return;
//     const timer = setTimeout(() => setNotice(""), 4500);
//     return () => clearTimeout(timer);
//   }, [notice]);
//   function update(changes, message = "Changes saved.") {
//     const next = { ...data, ...changes };
//     setData(next);
//     try {
//       localStorage.setItem(KEY, JSON.stringify(next));
//       setNotice(message);
//       return true;
//     } catch {
//       setNotice(
//         "Changes are available for this session only. Browser storage is unavailable.",
//       );
//       return true;
//     }
//   }
//   return {
//     ...data,
//     update,
//     notice,
//     setNotice,
//     loading: false,
//     loadError: "",
//     saveError: "",
//     saving: false,
//     reload: () => setData(load()),
//   };
// }
