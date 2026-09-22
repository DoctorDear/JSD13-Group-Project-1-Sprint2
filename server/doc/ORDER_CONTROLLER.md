# 📦 Order Management Documentation (ZETA-106)
**Feature:** [Backend] Admin Order Management APIs  
**Assignee:** K’ Thiem  
**Branch:** `feat-backend-admin-orders`  
**Base:** `Develop`  

---

## 📌 สารบัญ (Table of Contents)
1. [ภาพรวมของระบบ (Overview)](#1-ภาพรวมของระบบ-overview)
2. [เจาะลึกการทำงานของโค้ด (Code Explanation)](#2-เจาะลึกการทำงานของโค้ด-code-explanation)
   - [2.1 Controller: `order.controller.js`](#21-controller-ordercontrollerjs)
   - [2.2 Middleware: `auth.middleware.js`](#22-middleware-authmiddlewarejs)
   - [2.3 Routes: `order.routes.js`](#23-routes-orderroutesjs)
3. [ตาราง API Endpoints](#3-ตาราง-api-endpoints)
4. [ตัวอย่างการทดสอบ API ด้วย Bruno (Bruno Testing Guide)](#4-ตัวอย่างการทดสอบ-api-ด้วย-bruno-bruno-testing-guide)
   - [ขั้นตอนเตรียมความพร้อม (Step 0: Login ใน Bruno รับ Admin Token)](#ขั้นตอนที่-0-ล็อกอินบัญชี-admin-ใน-bruno-เพื่อรับ-token)
   - [ทดสอบ Endpoint 1: ดึงรายการคำสั่งซื้อทั้งหมด (GET /api/v1/orders)](#case-1-ดึงรายการคำสั่งซื้อทั้งหมด-get-apiv1orders)
   - [ทดสอบ Endpoint 1 (Filter): กรองสถานะคำสั่งซื้อ](#case-2-กรองเฉพาะสถานะคำสั่งซื้อ-get-apiv1ordersstatus)
   - [ทดสอบ Endpoint 2: อัปเดตสถานะคำสั่งซื้อ (PATCH /api/v1/orders/:id/status)](#case-3-อัปเดตสถานะคำสั่งซื้อสำเร็จ-patch-apiv1ordersidstatus)
   - [ทดสอบ Error Cases ใน Bruno (400, 401, 403, 404)](#case-4-การทดสอบ-error-cases-ใน-bruno-ตรวจสอบการดักจับข้อผิดพลาด)

---

## 1. ภาพรวมของระบบ (Overview)

ระบบ Order Management ในส่วนของ Admin มีหน้าที่หลัก 2 อย่าง:
1. **ดูรายการคำสั่งซื้อทั้งหมดในระบบ (`getAllOrders`)**: แสดงรายละเอียดครบถ้วน รวมถึงข้อมูลของผู้สั่งซื้อ (`User`) และข้อมูลสินค้า (`Product`) โดยเรียงลำดับจากออเดอร์ล่าสุดไปเก่าสุด
2. **ปรับปรุงสถานะคำสั่งซื้อ (`updateOrderStatus`)**: สำหรับ Admin ที่ต้องการเปลี่ยนสถานะ เช่น จาก `pending` ➔ `processing` ➔ `shipped` ➔ `completed` หรือ `cancelled`

ความปลอดภัย: ทั้ง 2 Endpoint ถูกป้องกัน 2 ชั้นด้วย Middleware:
- `verifyToken`: ตรวจสอบความถูกต้องและวันหมดอายุของ JWT
- `requireAdmin`: ตรวจสอบสิทธิ์ว่าผู้ใช้งานมีบทบาทเป็น `admin` หรือไม่ หากไม่ใช่จะตอบกลับด้วย `403 Forbidden`

---

## 2. เจาะลึกการทำงานของโค้ด (Code Explanation)

### 2.1 Controller: `order.controller.js`

#### ค่าคงที่ `ALLOWED_ORDER_STATUSES`
```javascript
const ALLOWED_ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "completed",
  "cancelled",
];
```
- กำหนด Enum รายชื่อสถานะที่ระบบรองรับ ตรงตาม Schema ใน `Order.model.js`
- นำมาใช้ตรวจสอบความถูกต้อง (Validation) ทั้งตอนกรองใน `GET` และตอนอัปเดตใน `PATCH`

---

#### ฟังก์ชัน `getAllOrders`
```javascript
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, sort = "newest" } = req.query;

    const filter = {};
    if (status) {
      if (!ALLOWED_ORDER_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status filter. Allowed values: ${ALLOWED_ORDER_STATUSES.join(", ")}`,
        });
      }
      filter.orderStatus = status;
    }

    const sortOption = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    const orders = await Order.find(filter)
      .populate("userId", "firstName lastName email phone")
      .populate("items.productId", "name images price")
      .sort(sortOption);

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err) {
    next(err);
  }
};
```
**จุดสำคัญในการทำงาน:**
1. **Query Parameters:**
   - `status`: กรองตามสถานะออเดอร์ เช่น `?status=pending` (มี validation เช็คค่า enum)
   - `sort`: เลือกเรียงลำดับ เช่น `?sort=oldest` หรือค่าเริ่มต้น `newest`
2. **`.populate("userId", ...)`**:
   - ดึงข้อมูลลูกค้าเจ้าของออเดอร์มาแสดงเฉพาะฟิลด์ที่ปลอดภัย (`firstName`, `lastName`, `email`, `phone`) โดยไม่ดึง `password` ออกมา
3. **`.populate("items.productId", ...)`**:
   - ดึงข้อมูลรูปภาพและชื่อสินค้าตัวจริงปัจจุบันมาประกอบร่วมกับ snapshot
4. **`.sort(sortOption)`**:
   - เรียงจากออเดอร์ใหม่สุดไปเก่าสุดเป็นค่าเริ่มต้น (`createdAt: -1`)

---

#### ฟังก์ชัน `updateOrderStatus`
```javascript
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderStatus, status } = req.body;
    const targetStatus = orderStatus || status;

    // 1. ตรวจสอบความถูกต้องของ MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
    }

    // 2. ตรวจสอบว่าส่งค่าสถานะมาหรือไม่
    if (!targetStatus) {
      return res.status(400).json({
        success: false,
        message: "Please provide orderStatus",
      });
    }

    // 3. ตรวจสอบ Enum
    if (!ALLOWED_ORDER_STATUSES.includes(targetStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Status must be one of: ${ALLOWED_ORDER_STATUSES.join(", ")}`,
      });
    }

    // 4. อัปเดตในฐานข้อมูล
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { orderStatus: targetStatus },
      { new: true, runValidators: true }
    )
      .populate("userId", "firstName lastName email phone")
      .populate("items.productId", "name images price");

    // 5. หากไม่พบออเดอร์
    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (err) {
    next(err);
  }
};
```
**จุดสำคัญในการทำงาน:**
1. **รองรับทั้ง `orderStatus` และ `status`:** เพิ่มความยืดหยุ่นให้ Frontend ไม่ว่าจะส่ง key ไหนมา
2. **Object ID Validation:** ดักจับทันทีหาก Client ส่ง ID ที่ไม่ใช่ MongoDB ObjectId 24 หลัก ป้องกัน Mongoose CastError
3. **Enum Validation:** ป้องกันการใส่สถานะมั่ว เช่น "done", "waiting"
4. **`{ new: true, runValidators: true }`:** คืนค่าเอกสารหลังอัปเดต และรัน schema validation
5. **404 Not Found:** จัดการกรณี ID ถูกรูปแบบแต่ไม่มีเอกสารในระบบ

---

### 2.2 Middleware: `auth.middleware.js`

```javascript
// ตรวจสอบสิทธิ์เฉพาะ Admin เท่านั้น
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Admin access required",
    });
  }
  next();
};
```
- ทำงานต่อจาก `verifyToken` ซึ่งได้ถอดรหัส Token และใส่ข้อมูลลงใน `req.user`
- เช็คว่า `req.user.role === "admin"` หรือไม่
- หากเป็น User ธรรมดา จะถูกบล็อกด้วย **Status 403 Forbidden** ทันที

---

### 2.3 Routes: `order.routes.js`

```javascript
import { Router } from "express";
import {
  getAllOrders,
  updateOrderStatus,
} from "../../controllers/order.controller.js";
import { verifyToken, requireAdmin } from "../../middlewares/auth.middleware.js";

export const router = Router();

// Admin Order Management Routes
router.get("/", verifyToken, requireAdmin, getAllOrders);
router.patch("/:id/status", verifyToken, requireAdmin, updateOrderStatus);
```
- เรียงลำดับ Middleware แบบ Chain:
  `Client ➔ verifyToken (401 ถ้าไม่มี token/หมดอายุ) ➔ requireAdmin (403 ถ้าไม่ใช่ admin) ➔ Controller`

---

## 3. ตาราง API Endpoints

| HTTP Method | Endpoint URL | Auth Middleware | Body Payload | รายละเอียด |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/orders` | `verifyToken`, `requireAdmin` | _None_ | ดึงรายการคำสั่งซื้อทั้งหมด (รองรับ Query: `?status=...&sort=...`) |
| **PATCH** | `/api/v1/orders/:id/status` | `verifyToken`, `requireAdmin` | `{ "orderStatus": "shipped" }` | อัปเดตสถานะคำสั่งซื้อตาม ID |

---

## 4. ตัวอย่างการทดสอบ API ด้วย Bruno (Bruno Testing Guide)

### ขั้นตอนที่ 0: ล็อกอินบัญชี Admin ใน Bruno เพื่อรับ Token

1. เปิดแอป **Bruno** แล้วกดสร้าง Request ใหม่ (`+ Add request` หรือกดแท็บ `+`)
2. กำหนดค่า Request ดังนี้:
   - **Method:** `POST`
   - **URL:** `http://localhost:3001/api/v1/auth/login`
3. ไปที่แท็บ **`Body`** ➔ เลือกชนิดเป็น **`JSON`**
4. ใส่ JSON Body:
   ```json
   {
     "email": "admin@zetastore.com",
     "password": "Password123!"
   }
   ```
5. กดปุ่ม **`Send`** สีส้มขวาบน
6. **ผลลัพธ์ที่ได้ (Status 200 OK):**
   ```json
   {
     "success": true,
     "message": "Login successful!",
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "_id": "6ab206ee89b5a4530bdc6ece",
       "firstName": "Admin",
       "lastName": "Zeta",
       "email": "admin@zetastore.com",
       "role": "admin"
     }
   }
   ```
> 💡 **สำคัญมาก:** Copy ข้อความในช่อง `"token": "..."` เก็บไว้ เพื่อนำไปใช้เป็น Bearer Token ในทุก Request ด้านล่าง

---

### Case 1: ดึงรายการคำสั่งซื้อทั้งหมด (GET /api/v1/orders)

1. สร้าง Request ใหม่ใน Bruno:
   - **Method:** `GET`
   - **URL:** `http://localhost:3001/api/v1/orders`
2. ไปที่แท็บ **`Auth`**:
   - เลือกประเภทเป็น **`Bearer Token`**
   - นำ `token` ที่ Copy มาจากขั้นตอนที่ 0 ไปวางลงในช่อง **Token**
3. กดปุ่ม **`Send`**
4. **ผลลัพธ์ที่ได้ (Status 200 OK):**
   ```json
   {
     "success": true,
     "count": 7,
     "orders": [
       {
         "_id": "6ab0194f54e4a87e0bd2bced",
         "orderNumber": "DEMO-REVIEW-beb122-2",
         "userId": {
           "_id": "6ab0194e54e4a87e0bd2bce0",
           "firstName": "Tee",
           "lastName": "K.",
           "email": "reviewer.tee@zeta.demo",
           "phone": ""
         },
         "items": [
           {
             "sku": "LFC-2627-H-PLAY",
             "name": "Liverpool FC 2026/27 Home Jersey (Authentic)",
             "size": "S",
             "price": 4200,
             "quantity": 1
           }
         ],
         "totalAmount": 4200,
         "orderStatus": "completed",
         "createdAt": "2026-09-20T17:35:12.437Z"
       }
     ]
   }
   ```
> 📌 **Tip:** ให้สังเกตค่า `_id` ของออเดอร์ในรายการผลลัพธ์นี้ (เช่น `6ab0194f54e4a87e0bd2bced`) เพื่อนำไปใช้ทดสอบใน Case 3

---

### Case 2: กรองเฉพาะสถานะคำสั่งซื้อ (GET /api/v1/orders?status=...)

1. ใน Request `GET /api/v1/orders` ตัวเดิม (หรือสร้างใหม่)
2. ตรวจสอบว่าในแท็บ **`Auth`** มี Bearer Token เรียบร้อย
3. ไปที่แท็บ **`Params`**:
   - ช่อง **Name:** ใส่ `status`
   - ช่อง **Value:** ใส่สถานะที่ต้องการ เช่น `pending`, `processing`, หรือ `completed`
4. กดปุ่ม **`Send`**
5. **ผลลัพธ์:** ระบบจะแสดงเฉพาะคำสั่งซื้อที่มีสถานะตรงตามที่ระบุใน Query Parameter

---

### Case 3: อัปเดตสถานะคำสั่งซื้อสำเร็จ (PATCH /api/v1/orders/:id/status)

1. สร้าง Request ใหม่ใน Bruno:
   - **Method:** `PATCH`
   - **URL:** `http://localhost:3001/api/v1/orders/<ใส่_ID_ออเดอร์จริง>/status`  
     *(ตัวอย่าง: `http://localhost:3001/api/v1/orders/6ab0194f54e4a87e0bd2bced/status`)*
2. ไปที่แท็บ **`Auth`**:
   - เลือก **`Bearer Token`** แล้ววาง Admin Token
3. ไปที่แท็บ **`Body`**:
   - เลือกชนิดเป็น **`JSON`**
   - ใส่ข้อมูลสถานะใหม่ที่ต้องการเปลี่ยน:
     ```json
     {
       "orderStatus": "shipped"
     }
     ```
4. กดปุ่ม **`Send`**
5. **ผลลัพธ์ที่ได้ (Status 200 OK):**
   ```json
   {
     "success": true,
     "message": "Order status updated successfully",
     "order": {
       "_id": "6ab0194f54e4a87e0bd2bced",
       "orderNumber": "DEMO-REVIEW-beb122-2",
       "orderStatus": "shipped",
       "totalAmount": 4200,
       "updatedAt": "2026-09-22T04:45:00.000Z"
     }
   }
   ```

---

### Case 4: การทดสอบ Error Cases ใน Bruno (ตรวจสอบการดักจับข้อผิดพลาด)

#### 4.1 ไม่ได้แนบ Token (401 Unauthorized)
- ในแท็บ **`Auth`** ของ Bruno เลือกเป็น **`No Auth`** แล้วกด Send
- **Response ที่ได้ (Status 401 Unauthorized):**
  ```json
  {
    "success": false,
    "message": "Access denied, No token provided"
  }
  ```

#### 4.2 ผู้ใช้ทั่วไปล็อกอินแล้วพยายามเข้าหน้า Admin (403 Forbidden)
- ล็อกอินด้วย User ทั่วไป (เช่น `dear.zeta@example.com` หรือบัญชี role `user`)
- นำ Token ของ User นั้นมาใส่ในแท็บ **`Auth`** แล้วยิง `GET /api/v1/orders`
- **Response ที่ได้ (Status 403 Forbidden):**
  ```json
  {
    "success": false,
    "message": "Forbidden: Admin access required"
  }
  ```

#### 4.3 ส่งสถานะที่ไม่ถูกต้อง / ไม่อยู่ใน Enum (400 Bad Request)
- ใน Request `PATCH` ไปที่แท็บ **`Body`** ➔ **`JSON`** แล้วใส่สถานะมั่วๆ:
  ```json
  {
    "orderStatus": "invalid_status"
  }
  ```
- **Response ที่ได้ (Status 400 Bad Request):**
  ```json
  {
    "success": false,
    "message": "Invalid status. Status must be one of: pending, processing, shipped, completed, cancelled"
  }
  ```

#### 4.4 ไม่พบเลขออเดอร์ในฐานข้อมูล (404 Not Found)
- ใน Request `PATCH` ใส่ ID ที่ถูกฟอร์แมตแต่ไม่มีจริงใน DB เช่น:  
  `http://localhost:3001/api/v1/orders/660c1234567890abcdef9999/status`
- **Response ที่ได้ (Status 404 Not Found):**
  ```json
  {
    "success": false,
    "message": "Order not found"
  }
  ```

