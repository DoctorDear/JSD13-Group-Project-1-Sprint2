# 📋 Backend Sprint 2: Jira Backlog & Git Branching Specification
**Project:** Zeta (ζ) - Football Jersey E-Commerce Store  
**Stack:** Node.js, Express 5, MongoDB, Mongoose ODM, JWT  
**Sprint:** Sprint 2 & Sprint 3  
**Base Branch:** `Develop`  

เอกสารนี้รวบรวมโครงสร้างการจัดการงานบน Jira (Parent Epic, Tasks, Acceptance Criteria) และแนวทางการตั้งชื่อ Git Branch สำหรับงานพัฒนาระบบ Backend ในส่วนของ User, Cart และ Order ทั้งหมด 12 Endpoints

---

## 📌 สารบัญ (Table of Contents)
1. [โครงสร้าง Jira Parent (Epic Hierarchy)](#1-โครงสร้าง-jira-parent-epic-hierarchy)
2. [ตารางสรุป Jira Tasks & Git Branches](#2-ตารางสรุป-jira-tasks--git-branches)
3. [รายละเอียด Jira Tasks & Acceptance Criteria (DoD)](#3-รายละเอียด-jira-tasks--acceptance-criteria-dod)
   - [ZETA-101: User Profile & Address APIs (K' Iy)](#zeta-101-backend-user-profile--address-apis)
   - [ZETA-102: Customer Order History API (K' Iy)](#zeta-102-backend-customer-order-history-api)
   - [ZETA-103: User Cart Management APIs (K' Nick)](#zeta-103-backend-user-cart-management-apis-crud)
   - [ZETA-104: Single Order Detail API (K' Nick)](#zeta-104-backend-single-order-detail-api)
   - [ZETA-105: Checkout Engine & Order Creation (K' Dear)](#zeta-105-backend-checkout-engine--order-creation-boss)
   - [ZETA-106: Admin Order Management APIs (K' Thiem)](#zeta-106-backend-admin-order-management-apis)
4. [Git Workflow & ข้อแนะนำการทำงานร่วมกัน](#4-git-workflow--ข้อแนะนำการทำงานร่วมกัน)

---

## 1. โครงสร้าง Jira Parent (Epic Hierarchy)

เพื่อความง่ายและเห็นภาพรวมความคืบหน้าของงาน Backend ทั้งหมดในที่เดียว ให้ผูกทุก Tasks เข้ากับ **Single Parent Epic** ดังนี้:

* **Issue Type:** `Epic`
* **Epic Name / Summary:** `[BE] Core Services: User, Cart & Order APIs`
* **Epic Description:**
  ```text
  Objective:
  พัฒนาและติดตั้ง RESTful APIs สำหรับฝั่งหลังบ้าน (Backend) เพื่อรองรับฟีเจอร์:
  1. ระบบโปรไฟล์และที่อยู่ผู้ใช้ (User Profile & Addresses)
  2. ระบบจัดการตะกร้าสินค้า (User Cart CRUD)
  3. ระบบคำสั่งซื้อ การเช็คเอาต์ และตัดสต็อกสินค้า (Checkout Engine & Order Processing)
  4. ระบบตรวจสอบและอัปเดตสถานะออเดอร์สำหรับแอดมิน (Admin Order Management)

  Tech Stack:
  - Node.js / Express 5 / MongoDB & Mongoose ODM
  - Authentication: JWT (Bearer Token)
  ```

---

## 2. ตารางสรุป Jira Tasks & Git Branches

| Issue Key | Type | Summary (ชื่องาน) | Assignee | Priority | Est. Points | Git Branch Name | Base Branch |
| :--- | :---: | :--- | :---: | :---: | :---: | :--- | :---: |
| **ZETA-101** | Task | [Backend] User Profile & Address APIs | **K’ Iy** | Medium | 3 | `feat-backend-user-profile` | `Develop` |
| **ZETA-102** | Task | [Backend] Customer Order History API | **K’ Iy** | Medium | 2 | `feat-backend-my-orders` | `Develop` |
| **ZETA-103** | Task | [Backend] User Cart Management APIs (CRUD) | **K’ Nick** | High | 5 | `feat-backend-cart` | `Develop` |
| **ZETA-104** | Task | [Backend] Single Order Detail API | **K’ Nick** | Medium | 2 | `feat-backend-order-detail` | `Develop` |
| **ZETA-105** | Task | [Backend] Checkout Engine & Order Creation | **K’ Dear** | Highest | 8 | `feat-backend-order-create` | `Develop` |
| **ZETA-106** | Task | [Backend] Admin Order Management APIs | **K’ Thiem** | Medium | 3 | `feat-backend-admin-orders` | `Develop` |

---

## 3. รายละเอียด Jira Tasks & Acceptance Criteria (DoD)

สามารถคัดลอกข้อความด้านล่างนี้ไปวางใน Description ของแต่ละการ์ดบน Jira ได้ทันที

---

### 👤 งานของ K' Iy

#### 🎫 ZETA-101: [Backend] User Profile & Address APIs
* **Assignee:** K’ Iy
* **Branch:** `feat-backend-user-profile`
* **Parent:** `[BE] Core Services: User, Cart & Order APIs`
* **Controller:** `user.controller.js`
* **Endpoints:**
  * `GET /api/v1/users/profile` (`userController.getProfile`)
  * `PATCH /api/v1/users/profile` (`userController.updateProfile`)
* **Acceptance Criteria (Definition of Done):**
  - [ ] คุ้มครองเส้นทางด้วย `verifyToken` middleware (ต้องการ Bearer Token)
  - [ ] `GET /profile`: ดึงข้อมูลโปรไฟล์ผู้ใช้สำเร็จโดยไม่ส่งรหัสผ่าน (`.select('-password')`)
  - [ ] `PATCH /profile`: อัปเดตข้อมูล `firstName`, `lastName`, `phone` ได้อย่างถูกต้อง
  - [ ] ส่ง Error Response 404 หากไม่พบผู้ใช้ในระบบ
  - [ ] ส่ง Error Response 401 เมื่อ Token ขาดหายหรือไม่ถูกต้อง

---

#### 🎫 ZETA-102: [Backend] Customer Order History API
* **Assignee:** K’ Iy
* **Branch:** `feat-backend-my-orders`
* **Parent:** `[BE] Core Services: User, Cart & Order APIs`
* **Controller:** `order.controller.js`
* **Endpoints:**
  * `GET /api/v1/orders/my-orders` (`orderController.getMyOrders`)
* **Acceptance Criteria (Definition of Done):**
  - [ ] คุ้มครองเส้นทางด้วย `verifyToken` middleware
  - [ ] ค้นหาเฉพาะออเดอร์ของผู้ใช้ที่ล็อกอินอยู่ (`userId: req.user.userId`)
  - [ ] จัดเรียงลำดับจากออเดอร์ล่าสุดไปเก่าสุด (`.sort({ createdAt: -1 })`)
  - [ ] ส่งคืน Array ของออเดอร์ พร้อม Status Code 200 OK

---

### 🛒 งานของ K' Nick

#### 🎫 ZETA-103: [Backend] User Cart Management APIs (CRUD)
* **Assignee:** K’ Nick
* **Branch:** `feat-backend-cart`
* **Parent:** `[BE] Core Services: User, Cart & Order APIs`
* **Controller:** `user.controller.js`
* **Endpoints:**
  * `GET /api/v1/users/cart` (`userController.getCart`)
  * `POST /api/v1/users/cart` (`userController.addToCart`)
  * `PATCH /api/v1/users/cart/:itemId` (`userController.updateCartItemQuantity`)
  * `DELETE /api/v1/users/cart/:itemId` (`userController.removeCartItem`)
  * `DELETE /api/v1/users/cart` (`userController.clearCart`)
* **Acceptance Criteria (Definition of Done):**
  - [ ] ทุก Endpoint ต้องผ่านการตรวจสอบสิทธิ์ด้วย `verifyToken`
  - [ ] `GET /cart`: ดึงข้อมูลตะกร้าสินค้าของผู้ใช้ พร้อมใช้ `.populate('cart.productId')` เพื่อดึงรายละเอียดสินค้า (ชื่อ, รูป, ราคา)
  - [ ] `POST /cart`: รับ payload `{ productId, size, customName, customNumber, quantity, price }` หากพบสินค้าและไซส์เดียวกัน ให้บวกทบจำนวน หากไม่ซ้ำให้ push เพิ่มใน array
  - [ ] `PATCH /cart/:itemId`: อัปเดตจำนวนสินค้าตาม subdocument ID โดยจำนวนต้องไม่ต่ำกว่า 1
  - [ ] `DELETE /cart/:itemId`: ลบเฉพาะสินค้าชิ้นนั้นออกจากตะกร้า
  - [ ] `DELETE /cart`: ล้างตะกร้าสินค้าทั้งหมดให้เป็น Array ว่าง (`cart: []`)

---

#### 🎫 ZETA-104: [Backend] Single Order Detail API
* **Assignee:** K’ Nick
* **Branch:** `feat-backend-order-detail`
* **Parent:** `[BE] Core Services: User, Cart & Order APIs`
* **Controller:** `order.controller.js`
* **Endpoints:**
  * `GET /api/v1/orders/:id` (`orderController.getOrderById`)
* **Acceptance Criteria (Definition of Done):**
  - [ ] คุ้มครองเส้นทางด้วย `verifyToken`
  - [ ] ค้นหาคำสั่งซื้อด้วย `Order.findById(req.params.id)`
  - [ ] **Authorization Check:** ผู้ที่มีสิทธิ์ดูต้องเป็น **เจ้าของออเดอร์ (`order.userId.toString() === req.user.userId`)** หรือมี Role เป็น **`admin`** หากไม่ใช่ให้ตอบกลับด้วย 403 Forbidden
  - [ ] ส่ง Error 404 เมื่อไม่พบคำสั่งซื้อตาม ID ที่ระบุ

---

### 👑 งานของ K' Dear

#### 🎫 ZETA-105: [Backend] Checkout Engine & Order Creation (Boss)
* **Assignee:** K’ Dear
* **Branch:** `feat-backend-order-create`
* **Parent:** `[BE] Core Services: User, Cart & Order APIs`
* **Controller:** `order.controller.js`
* **Endpoints:**
  * `POST /api/v1/orders` (`orderController.createOrder`)
* **Acceptance Criteria (Definition of Done):**
  - [ ] คุ้มครองเส้นทางด้วย `verifyToken`
  - [ ] สร้างรหัสคำสั่งซื้อที่ไม่ซ้ำกัน (`orderNumber` เช่น `ZT-${Date.now()}`)
  - [ ] **Stock Checking & Deduction:**
    - ตรวจสอบสต็อกใน `Product` model ว่าเพียงพอต่อทุกชิ้นที่สั่งซื้อหรือไม่
    - หากสต็อกไม่พอ ให้ยกเลิกการสั่งซื้อและแจ้ง Error 400
    - หากสต็อกพอ ให้ตัดยอดคงเหลือในคลัง (`$inc: { quantity: -item.quantity }`)
  - [ ] **Data Snapshot:** คัดลอกรายละเอียดสินค้า (`sku`, `name`, `price`, `size`) บันทึกลงใน `order.items` เก็บแยกขาดจาก Product Catalog
  - [ ] บันทึกข้อมูลที่อยู่จัดส่ง (`shippingAddress`), วิธีชำระเงิน, และคำนวณ `totalAmount`
  - [ ] **Cart Auto-Clear:** เคลียร์ตะกร้าสินค้าของผู้ใช้ (`user.cart = []`) ให้ว่างหลังสั่งซื้อสำเร็จ
  - [ ] ส่งคืน Status 201 Created พร้อมข้อมูลออเดอร์ที่สร้างเสร็จ

---

### 🛡️ งานของ K' Thiem

#### 🎫 ZETA-106: [Backend] Admin Order Management APIs
* **Assignee:** K’ Thiem
* **Branch:** `feat-backend-admin-orders`
* **Parent:** `[BE] Core Services: User, Cart & Order APIs`
* **Controller:** `order.controller.js`
* **Endpoints:**
  * `GET /api/v1/orders` (`orderController.getAllOrders`)
  * `PATCH /api/v1/orders/:id/status` (`orderController.updateOrderStatus`)
* **Acceptance Criteria (Definition of Done):**
  - [ ] คุ้มครองด้วยทั้ง `verifyToken` และ `requireAdmin` (ปฏิเสธหากไม่ใช่ Admin ด้วย 403 Forbidden)
  - [ ] `GET /orders`: ดึงคำสั่งซื้อทั้งหมดในระบบ พร้อม populate ข้อมูลผู้สั่งซื้อ และจัดเรียงจากล่าสุดไปเก่าสุด
  - [ ] `PATCH /orders/:id/status`: รับค่าสถานะใหม่ (`orderStatus`) และอัปเดตลงฐานข้อมูล
  - [ ] ตรวจสอบว่า Status ต้องอยู่ใน Enum: `pending`, `processing`, `shipped`, `completed`, `cancelled` หากไม่ใช่ให้ส่ง 400 Bad Request

---

## 4. Git Workflow & ข้อแนะนำการทำงานร่วมกัน

### 4.1 ลำดับคำสั่งในการแตก Branch
ทุกคนต้องดึงโค้ดล่าสุดจาก Branch `Develop` ก่อนแตก Branch เสมอ:

```bash
# 1. ย้ายมายัง Develop และ Pull ข้อมูลล่าสุด
git checkout Develop
git pull origin Develop

# 2. แตก Branch ตาม Task ที่ได้รับมอบหมาย
# K' Iy:
git checkout -b feat-backend-user-profile
git checkout -b feat-backend-my-orders

# K' Nick:
git checkout -b feat-backend-cart
git checkout -b feat-backend-order-detail

# K' Dear:
git checkout -b feat-backend-order-create

# K' Thiem:
git checkout -b feat-backend-admin-orders
```

### 4.2 วิธีป้องกัน Git Merge Conflict
1. **อย่าลบ Function ของเพื่อน:** ในไฟล์ `user.controller.js` และ `order.controller.js` ให้เขียนเฉพาะ Function ของตัวเอง และ `export` แยกตามชื่อ
2. **Pull Develop บ่อยๆ:** ก่อน push โค้ดขึ้น GitHub ให้ `git pull origin Develop` เข้ามา merge ใน branch ตัวเองเพื่อเคลียร์ข้อขัดแย้งก่อนเปิด Pull Request (PR)
3. **การทดสอบแบบเรียงลำดับ (Test Sequence):**
   ```
   [1. Auth/Login] ➔ [2. User Profile] ➔ [3. Cart CRUD] ➔ [4. Checkout/Create Order] ➔ [5. Admin Orders]
   ```