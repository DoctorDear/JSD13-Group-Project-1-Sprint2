# 📘 คู่มือการเชื่อมต่อ Frontend Admin Dashboard เข้ากับ Backend APIs (Step-by-Step Guide)

**Project:** Zeta (ζ) - Football Jersey E-Commerce Store  
**Scope:** Admin Dashboard Backend Integration  
**เป้าหมาย:** ถอดข้อมูล Mock ออก แล้วเชื่อมต่อหน้า Admin (Dashboard, Inventory CRUD, Orders) เข้ากับ Express/MongoDB Backend จริง พร้อมจัดการ Authentication, Loading, Error, และ Empty States อย่างสมบูรณ์แบบ

---

## 📌 สารบัญ (Table of Contents)
1. [ทำความเข้าใจสถาปัตยกรรมเดิม vs สถาปัตยกรรมใหม่](#1-ทำความเข้าใจสถาปัตยกรรมเดิม-vs-สถาปัตยกรรมใหม่)
2. [ตารางสรุป API Endpoints ที่ต้องใช้งาน](#2-ตารางสรุป-api-endpoints-ที่ต้องใช้งาน)
3. [ขั้นตอนที่ 1: สร้าง API Service สำหรับ Admin (`src/services/adminService.js`)](#ขั้นตอนที่-1-สร้าง-api-service-สำหรับ-admin-srcservicesadminservicejs)
4. [ขั้นตอนที่ 2: อัปเกรด `useAdminStore.js` ดึงข้อมูลจริงแทน LocalStorage](#ขั้นตอนที่-2-อัปเกรด-useadminstorejs-ดึงข้อมูลจริงแทน-localstorage)
5. [ขั้นตอนที่ 3: เชื่อมต่อระบบสินค้า (CRUD Products) ใน `Inventory.jsx`](#ขั้นตอนที่-3-เชื่อมต่อระบบสินค้า-crud-products-ใน-inventoryjsx)
   - [3.1 เพิ่มสินค้าใหม่ (Create)](#31-การเพิ่มสินค้าใหม่-post-apiv1products)
   - [3.2 แก้ไขสินค้าเดิม (Update)](#32-การแก้ไขสินค้าเดิม-patch-apiv1productsid)
   - [3.3 ลบสินค้าออกจากระบบ (Delete)](#33-การลบสินค้า-delete-apiv1productsid)
6. [ขั้นตอนที่ 4: การส่ง Bearer Token และตรวจสอบสิทธิ์ Admin](#ขั้นตอนที่-4-การส่ง-bearer-token-และตรวจสอบสิทธิ์-admin)
7. [ขั้นตอนที่ 5: จัดการ Loading, Empty, และ Error States ใน UI](#ขั้นตอนที่-5-จัดการ-loading-empty-และ-error-states-ใน-ui)
8. [คู่มือการทดสอบระบบ (Testing & Verification Checklist)](#8-คู่มือการทดสอบระบบ-testing--verification-checklist)

---

## 1. ทำความเข้าใจสถาปัตยกรรมเดิม vs สถาปัตยกรรมใหม่

### โครงสร้างเดิม (Mock State):
- ใน `Zeta-Jersey-Store/src/admin/`:
  - `useAdminStore.js` โหลดข้อมูลสินค้าและออเดอร์จาก `localStorage` และไฟล์ `data.js`
  - ข้อมูลสินค้าอยู่ในรูปแบบ `{ id, name, sku, stock, price, imageUrl, ... }`
  - ไม่มีการต่อ Network ไปหาเซิร์ฟเวอร์

### โครงสร้างใหม่ (API-Driven):
- ฝั่ง Backend รันอยู่ที่ `http://localhost:3001`
- ข้อมูลสินค้าใน MongoDB มีฟิลด์: `{ _id, sku, name, description, price, quantity, images, ... }`
- ข้อมูลออเดอร์ใน MongoDB มีฟิลด์: `{ _id, orderNumber, userId, items, totalAmount, orderStatus, ... }`
- **หัวใจสำคัญ:** เราจะทำการแปลงข้อมูล (Data Normalization) ใน Store เพื่อให้ UI เดิมของ Admin แทบไม่ต้องเขียนใหม่ทั้งหมด!

```
[ Frontend: Admin UI ] 
        ▲
        │ (id, stock, price, imageUrl)
[ useAdminStore.js ]  ◄── Data Normalization ──┐
        ▲                                      │
        │ (fetch / axios)                      │
[ adminService.js ]                            │
        ▲                                      │
        │ (Bearer Token / Cookie)              │
[ Backend: Express 3001 ]                      │
  - /api/v1/products  ─────────────────────────┤ (_id, quantity, images)
  - /api/v1/orders    ─────────────────────────┘ (_id, totalAmount, orderStatus)
```

---

## 2. ตารางสรุป API Endpoints ที่ต้องใช้งาน

| เมนูใน Admin | Method | Backend URL | สิทธิ์การเข้าถึง | หน้าที่ |
| :--- | :---: | :--- | :---: | :--- |
| **Inventory / Dashboard** | `GET` | `/api/v1/products` | Public | ดึงรายการสินค้าทั้งหมด |
| **Add Product** | `POST` | `/api/v1/products` | Admin Only | เพิ่มสินค้าใหม่ลงฐานข้อมูล |
| **Edit Product** | `PATCH` | `/api/v1/products/:id` | Admin Only | แก้ไขรายละเอียดและสต็อกสินค้า |
| **Delete Product** | `DELETE` | `/api/v1/products/:id` | Admin Only | ลบสินค้าออกจากฐานข้อมูล |
| **Overview / Orders** | `GET` | `/api/v1/orders` | Admin Only | ดึงออเดอร์ทั้งหมดเพื่อคำนวณยอดขาย & แสดงตาราง |
| **Update Order Status** | `PATCH` | `/api/v1/orders/:id/status` | Admin Only | เปลี่ยนสถานะออเดอร์ (shipped, completed ฯลฯ) |

---

## 3. ขั้นตอนที่ 1: สร้าง API Service สำหรับ Admin (`src/services/adminService.js`)

เพื่อไม่ให้โค้ดยิง API กระจัดกระจาย เราควรสร้างไฟล์ Service กลางขึ้นมาจัดการ Request ทั้งหมด

📁 **สร้างไฟล์ใหม่:** `Zeta-Jersey-Store/src/services/adminService.js`

```javascript
import { api } from "../lib/api";

export const adminService = {
  // === 1. Products APIs ===
  getProducts: (options) => api.get("/products", options),

  getProductById: (id, options) => api.get(`/products/${id}`, options),

  createProduct: (payload, options) =>
    api.post("/products", payload, options),

  updateProduct: (id, payload, options) =>
    api.patch(`/products/${id}`, payload, options),

  deleteProduct: (id, options) =>
    api.del(`/products/${id}`, options),

  // === 2. Orders APIs (จาก ZETA-106) ===
  getOrders: (options) => api.get("/orders", options),

  updateOrderStatus: (id, status, options) =>
    api.patch(`/orders/${id}/status`, { orderStatus: status }, options),
};
```

> 💡 **หมายเหตุสำคัญ (Cookie-Only Auth):**  
> เนื่องจากทีมปรับระบบเป็น **Cookie-Only Authentication** แล้ว ในฟังก์ชันของ `adminService` จึง**ไม่ต้องส่ง `{ auth: true }` อีกต่อไป** เพราะ `src/lib/api.js` มีการตั้งค่า `credentials: "include"` ไว้แล้ว Browser จะแนบ Cookie `accessToken` ไปให้ Backend โดยอัตโนมัติในทุกๆ Request!

---

## 4. ขั้นตอนที่ 2: อัปเกรด `useAdminStore.js` ดึงข้อมูลจริงแทน LocalStorage

ไฟล์นี้เป็นสมองหลักของหน้า Admin เราจะปรับให้มัน:
1. เรียก API ตอนเปิดหน้าเว็บ (`useEffect`)
2. แปลงฟิลด์จาก MongoDB (`_id` ➔ `id`, `quantity` ➔ `stock`)
3. มี State: `loading`, `error`, `saving`, `notice`

📁 **ไฟล์ที่ต้องแก้ไข:** `Zeta-Jersey-Store/src/admin/useAdminStore.js`

### แนวทางการเขียนโค้ด:

```javascript
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
```

---

## 5. ขั้นตอนที่ 3: เชื่อมต่อระบบสินค้า (CRUD Products) ใน `Inventory.jsx`

📁 **ไฟล์ที่ต้องแก้ไข:** `Zeta-Jersey-Store/src/admin/Inventory.jsx`

### 3.1 การเพิ่มสินค้าใหม่ (`POST /api/v1/products`) & แก้ไขสินค้าเดิม (`PATCH /api/v1/products/:id`)
ในฟังก์ชันคอมโพเนนต์ `ProductForm({ store })`:
เดิมทีโค้ดบันทึกลง `localStorage` ผ่าน `store.update()` เราจะเปลี่ยนเป็นเรียก `adminService` ดังนี้:

```javascript
// ในฟังก์ชัน save(e) ภายใน ProductForm:
async function save(e) {
  e.preventDefault();
  setError("");
  
  const form = Object.fromEntries(new FormData(e.currentTarget));
  for (const key of Object.keys(form)) form[key] = form[key].trim();

  // 1. Validation
  if (!form.name || !form.sku) {
    return setError("Product name and SKU cannot be blank.");
  }

  // 2. เตรียม Payload ให้ตรงกับ Mongoose Product Model
  const payload = {
    name: form.name,
    sku: form.sku.toUpperCase(),
    category: form.category || "Premier League",
    description: form.description || `${form.name} official jersey.`,
    price: Number(form.price),
    quantity: Number(form.stock), // backend ใช้ชื่อ quantity
    brand: form.supplier || form.brand || "Adidas",
    images: form.imageUrl ? [form.imageUrl] : [],
  };

  try {
    if (existing) {
      // 3.1 กรณีแก้ไข (Update) -> PATCH /api/v1/products/:id
      await adminService.updateProduct(id, payload);
      await store.refresh("Product updated successfully.");
    } else {
      // 3.2 กรณีเพิ่มใหม่ (Create) -> POST /api/v1/products
      await adminService.createProduct(payload);
      await store.refresh("Product created successfully.");
    }

    // 4. สำเร็จแล้วเด้งกลับไปหน้ารายการสินค้า
    navigate("/admin/inventory");
  } catch (err) {
    // 5. แสดง Error จาก Backend ให้ผู้ใช้เห็น
    setError(err.message || "Failed to save product. Please check your inputs.");
  }
}
```

---

### 3.2 การลบสินค้า (`DELETE /api/v1/products/:id`)
ในคอมโพเนนต์ `Inventory({ store, money })`:
ตรงส่วน Modal ยืนยันการลบ `ConfirmDelete` ให้เปลี่ยนจาก `filter` อาเรย์ใน memory มาเรียก API:

```javascript
// ในคอมโพเนนต์ Inventory:
{deleting && (
  <ConfirmDelete
    archive={false}
    error={deleteError}
    name={deleting.name}
    onClose={() => setDeleting(null)}
    onConfirm={async () => {
      try {
        // ยิงคำสั่ง DELETE ไปยัง Backend
        await adminService.deleteProduct(deleting.id);
        
        // Refresh ข้อมูลในหน้าจอใหม่
        await store.refresh("Product deleted successfully.");
        setDeleting(null);
      } catch (err) {
        setDeleteError(err.message || "Failed to delete product.");
      }
    }}
  />
)}
```

---

## 6. ขั้นตอนที่ 4: การทำงานของระบบ Cookie-Only Authentication และสิทธิ์ Admin

1. **การยืนยันตัวตนผ่าน Cookie ทำงานอย่างไร?**
   - ในการอัปเดตล่าสุด ทีมได้ปรับเป็น **Cookie-Only Authentication 100%**
   - เมื่อล็อกอินผ่าน `POST /auth/login` ตัว Backend จะส่ง Cookie `accessToken` (พร้อม flag `httpOnly: true`) ให้ Browser จัดเก็บเองโดยอัตโนมัติ
   - ไฟล์ `src/lib/api.js` ถูกกำหนดค่า `credentials: "include"` ไว้แล้ว ดังนั้นทุก Request ที่ยิงไปยัง Backend บราวเซอร์จะแนบ Cookie นี้ไปด้วยอัตโนมัติ **โดยที่เราไม่ต้องเขียนโค้ดเก็บ Token ใน `localStorage` หรือแนบ Header Bearer อีกต่อไป!**
2. **การตั้งค่า URL ปลายทาง (`.env` ของ Frontend):**
   - สร้างไฟล์ `.env` ที่โฟลเดอร์ `Zeta-Jersey-Store/` หากยังไม่มี:
     ```env
     VITE_API_BASE_URL=http://localhost:3001/api/v1
     ```
   - เพื่อให้ `src/lib/api.js` รู้ว่าต้องส่ง Request ไปที่ Express Server Port 3001
3. **การจัดการสิทธิ์และข้อผิดพลาด (401/403):**
   - หากยังไม่ได้ล็อกอิน ➔ Backend ตอบ `401 Unauthorized` ➔ `api.js` จะเรียก `emitUnauthorized()` ให้เด้งไปหน้า Login ทันที
   - หากล็อกอินด้วย User ทั่วไปแล้วพยายามเข้าหน้า Admin ➔ Backend ตอบ `403 Forbidden` ➔ ระบบจะแสดง Error แจ้งเตือนสิทธิ์ Admin
4. **เตรียมพร้อมบัญชี Admin:**
   - เปิดหน้า Login `/login` บนเว็บ แล้วล็อกอินด้วยบัญชี Admin ที่เรา Seed ไว้:
     - **Email:** `admin@zetastore.com`
     - **Password:** `Password123!`
   - จากนั้นเปิดไปที่ `/admin` เพื่อใช้งานระบบได้ทันที

---

## 7. ขั้นตอนที่ 5: จัดการ Loading, Empty, และ Error States ใน UI

เพื่อให้ตรงกับ Acceptance Criteria:
> *"แสดงสถานะ Loading, Empty และ Error รวมถึงผลสำเร็จของการทำรายการ"*

### 7.1 สถานะ Loading & Error ใน `Inventory.jsx`:
```jsx
// นำ store.loading และ store.error มาดักหน้า UI
if (store.loading) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3">
      <span className="loading loading-spinner loading-lg text-primary"></span>
      <p className="text-sm text-base-content/60">Loading products from server...</p>
    </div>
  );
}

if (store.error) {
  return (
    <div className="alert alert-error rounded-2xl">
      <span>⚠️ Error loading products: {store.error}</span>
      <button className="btn btn-sm btn-ghost" onClick={store.reload}>
        Retry
      </button>
    </div>
  );
}
```

### 7.2 สถานะ Empty State (เมื่อไม่มีสินค้า):
ในตาราง หาก `products.length === 0`:
```jsx
{!products.length && (
  <div className="p-8 text-center">
    <p className="text-base font-semibold">No products found</p>
    <p className="text-sm text-base-content/60">Try changing your search or add a new product.</p>
  </div>
)}
```

### 7.3 สถานะ Success Notification:
ใน `AdminApp.jsx` มีกล่อง Alert อยู่แล้ว:
```jsx
{store.notice && (
  <div className="alert alert-success fixed bottom-6 right-6 z-50">
    <span>{store.notice}</span>
  </div>
)}
```
เมื่อเราเรียก `store.setNotice("Product added successfully")` ข้อความสีเขียวจะเด้งขึ้นมามุมขวาล่างทันที

---

## 8. คู่มือการทดสอบระบบ (Testing & Verification Checklist)

เมื่อแก้ไขโค้ดครบแล้ว ให้ทดสอบตามขั้นตอนดังนี้เพื่อปิดงาน:

- [ ] **1. ทดสอบการดึงข้อมูล (Read):**
  - เปิดหน้า `http://localhost:5173/admin/inventory`
  - สินค้าต้องตรงกับใน MongoDB (มี SKU, ราคา, สต็อก)
  - หน้า `Overview` ยอดขาย (Total sales) และจำนวนออเดอร์ต้องคำนวณจากข้อมูลจริงใน Database
- [ ] **2. ทดสอบการเพิ่มสินค้า (Create):**
  - กดปุ่ม `Add Product` ➔ กรอกข้อมูล ➔ กด Save
  - ต้องเห็น Alert สีเขียว `Product created successfully.`
  - ตารางสินค้าต้องแสดงสินค้าตัวใหม่ทันทีโดยไม่ต้อง Refresh หน้าเว็บ
- [ ] **3. ทดสอบการแก้ไขสินค้า (Update):**
  - กด Edit สินค้าตัวเดิม ➔ เปลี่ยนราคา หรือจำนวนสต็อก ➔ กด Save
  - ค่าใหม่ต้องสะท้อนบนตารางทันที
- [ ] **4. ทดสอบการลบสินค้า (Delete):**
  - กดไอคอนถังขยะ ➔ ยืนยันการลบ
  - สินค้าต้องหายไปจากตารางทันที
- [ ] **5. ทดสอบ Error Handling:**
  - ลองหยุด Backend Server (Ctrl+C ใน terminal ของ server) แล้วกด Refresh หน้า Admin
  - หน้าเว็บต้องแสดงกล่องข้อความ Error สีแดงที่อ่านเข้าใจได้ ไม่ปล่อยให้หน้าเว็บจอขาว (White Screen)
