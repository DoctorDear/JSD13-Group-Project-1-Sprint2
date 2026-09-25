import { useEffect, useState, useCallback } from "react";
import { adminService } from "../services/adminService";
import { initialSettings, initialTasks } from "./data";

// ฟังก์ชันแปลง Product จาก MongoDB ให้เข้ากับ UI ของ Admin
function normalizeProduct(p) {
  return {
    id: p._id || p.id,
    sku: p.sku || "",
    name: p.name || "",
    category: p.category || "Jerseys",
    stock: Number(p.quantity ?? p.stock ?? 0),
    price: Number(p.price ?? 0),
    originalPrice: Number(p.originalPrice ?? 0),
    cost: Number(p.cost ?? 0),
    reorder: Number(p.reorder ?? 10),
    imageUrl: p.images?.[0] || p.imageUrl || "",
    description: p.description || "",
    date: p.date || "",
    tag: p.tag || [],
    brand: p.brand || "Adidas",
    raw: p, // เก็บข้อมูลดิบจาก backend ไว้เผื่อใช้
  };
}

// ฟังก์ชันแปลง Order จาก MongoDB ให้เข้ากับ UI ของ Admin
function normalizeOrder(o) {
  const customerName = o.userId
    ? `${o.userId.firstName || ""} ${o.userId.lastName || ""}`.trim() || o.userId.email
    : o.shippingAddress?.recipientName || "Guest Customer";

  return {
    id: o.orderNumber || o._id,
    mongoId: o._id,
    customer: customerName,
    email: o.userId?.email || "",
    phone: o.userId?.phone || o.shippingAddress?.phone || "-",
    date: new Date(o.createdAt).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    total: o.totalAmount || 0,
    status: o.orderStatus ? o.orderStatus.charAt(0).toUpperCase() + o.orderStatus.slice(1) : "Pending",
    rawStatus: o.orderStatus,
    items: o.items || [],
    raw: o,
  };
}

// ดึงลูกค้ารายบุคคลจริงจากข้อมูลคำสั่งซื้อใน MongoDB
function extractCustomers(orders) {
  const map = new Map();
  for (const o of orders) {
    const key = o.email || o.customer;
    if (!key) continue;
    if (!map.has(key)) {
      map.set(key, {
        id: `cust-${o.mongoId || o.id}`,
        name: o.customer,
        email: o.email || "-",
        phone: o.phone || "-",
        orders: 1,
        spent: o.total || 0,
        status: "Active",
      });
    } else {
      const existing = map.get(key);
      existing.orders += 1;
      existing.spent += o.total || 0;
    }
  }
  return Array.from(map.values());
}

// สร้างรายการประวัติสต็อกจากสินค้าจริงใน MongoDB
function generateMovementsFromProducts(products) {
  return products.map((p) => ({
    id: `mv-${p.id}`,
    productId: p.id,
    name: p.name,
    sku: p.sku,
    type: "Stock In",
    quantity: p.stock,
    source: "MongoDB Catalog",
    date: p.raw?.createdAt ? new Date(p.raw.createdAt).toISOString() : new Date().toISOString(),
  }));
}

const SETTINGS_KEY = "zeta_admin_settings";

function loadSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...initialSettings, ...parsed };
    }
  } catch {
    // fallback
  }
  return initialSettings;
}

export function useAdminStore() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [movements, setMovements] = useState([]);
  const [settings, setSettings] = useState(loadSettings);
  const [tasks, setTasks] = useState(initialTasks);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState("");

  // ฟังก์ชันดึงข้อมูลทั้งหมดจาก Backend MongoDB
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ดึงสินค้าและออเดอร์พร้อมกันแบบขนาน (Parallel) จาก Backend จริง
      const [productsRes, ordersRes] = await Promise.allSettled([
        adminService.getProducts(),
        adminService.getOrders(),
      ]);

      if (productsRes.status === "fulfilled") {
        const rawProducts = Array.isArray(productsRes.value)
          ? productsRes.value
          : productsRes.value.products || [];
        const normProducts = rawProducts.map(normalizeProduct);
        setProducts(normProducts);
        setMovements(generateMovementsFromProducts(normProducts));
      } else {
        console.error("Failed to load products from MongoDB:", productsRes.reason);
      }

      if (ordersRes.status === "fulfilled") {
        const rawOrders = ordersRes.value.orders || [];
        // กรองเฉพาะออเดอร์จริงของลูกค้า (ไม่รวมออเดอร์จำลอง DEMO-REVIEW ที่ถูก seed ไว้ใน MongoDB สำหรับระบบรีวิว)
        const realOrders = rawOrders.filter(
          (o) =>
            !o.orderNumber?.startsWith("DEMO-REVIEW") &&
            !o.userId?.email?.endsWith("@zeta.demo"),
        );
        const normOrders = realOrders.map(normalizeOrder);
        setOrders(normOrders);
        setCustomers(extractCustomers(normOrders));
      } else {
        console.error("Failed to load orders from MongoDB:", ordersRes.reason);
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

  // ฟังก์ชันรองรับการอัปเดตข้อมูล (เช่น สถานะคำสั่งซื้อ, งาน Tasks)
  const update = async (patch, message) => {
    if (patch.orders) {
      const changed = patch.orders.find((po) => {
        const curr = orders.find((o) => o.id === po.id);
        return curr && curr.status !== po.status;
      });
      if (changed && changed.mongoId) {
        try {
          await adminService.updateOrderStatus(
            changed.mongoId,
            changed.status.toLowerCase(),
          );
          await refresh(message || "Order status updated.");
          return true;
        } catch (err) {
          setError(err.message || "Failed to update order status");
          return false;
        }
      }
    }
    if (patch.tasks) setTasks(patch.tasks);
    if (patch.customers) setCustomers(patch.customers);
    if (patch.movements) setMovements(patch.movements);
    if (patch.settings) {
      setSettings(patch.settings);
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(patch.settings));
      } catch (err) {
        console.error("Failed to save settings to localStorage:", err);
      }
    }
    if (message) setNotice(message);
    return true;
  };

  return {
    products,
    orders,
    customers,
    movements,
    settings,
    tasks,
    loading,
    error,
    notice,
    setNotice,
    refresh,
    reload: fetchData,
    update,
  };
}
