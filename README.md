# Sprint 2: E-Commerce Application (MERN Stack)

## 🎯 Sprint Goal
พัฒนาระบบ E-Commerce ขั้นพื้นฐาน โดยใน Sprint นี้จะเน้นการพัฒนาฝั่ง Frontend ให้สมบูรณ์ก่อน (UI, React Components, และ Form Validation) เพื่อให้ผู้ใช้สามารถตอบโต้กับระบบผ่าน Mock Data ได้ จากนั้นจะดำเนินการเชื่อมต่อกับฝั่ง Backend (Node.js/Express) และฐานข้อมูล (MongoDB) ในระยะถัดไปเมื่อทีมพร้อม

---

## 📋 Product Backlog & Sprint Tasks

### 🔴 Phase 1: Frontend & UI Development (High Priority)
*การพัฒนาส่วนหน้าบ้านด้วย React โดยใช้ Mock Data ในการทดสอบการทำงานชั่วคราว*

**Epic 1: User Interface & React Components**
*   [ ] **Task 1.1:** สร้าง React Component สำหรับแสดงหน้าหลักและรายการสินค้าทั้งหมดในระบบ (Product List)
*   [ ] **Task 1.2:** สร้าง React Component สำหรับแสดงรายละเอียดของสินค้าแต่ละชิ้น (Product Information)
*   [ ] **Task 1.3:** สร้าง React Component สำหรับหน้าตะกร้าสินค้า (Cart) 
*   [ ] **Task 1.4:** สร้าง React Component สำหรับหน้าการสั่งซื้อ (Checkout)
*   [ ] **Task 1.5:** ตรวจสอบการเขียน UI structure ว่ามีการใช้ JSX และ Library ที่เกี่ยวข้องอย่างถูกต้อง

**Epic 2: Form Validation & Error Handling**
*   [ ] **Task 2.1:** เขียนฟังก์ชันตรวจสอบความถูกต้องของข้อมูลในฟอร์มก่อน Submit (ตรวจสอบฟิลด์: Name, Description, Price, Quantity, Date, Tag)
*   [ ] **Task 2.2:** สร้างระบบแสดงข้อความแจ้งเตือน (Meaningful Error Message) เมื่อผู้ใช้กรอกข้อมูลไม่ถูกต้องให้ชัดเจน

---

### 🔵 Phase 2: Backend & Database (To-Do)
*การพัฒนาระบบหลังบ้านและการจัดการฐานข้อมูล (รอเริ่มดำเนินการเมื่อทีมพร้อม)*

**Epic 3: Database Setup (MongoDB & Mongoose)**
*   [ ] **Task 3.1:** ติดตั้ง Mongoose เป็น dependency ในโปรเจกต์ผ่าน NPM
*   [ ] **Task 3.2:** ตั้งค่าการเชื่อมต่อฐานข้อมูล MongoDB ให้สมบูรณ์ (ต้องไม่มี Error เมื่อ Start Server)

**Epic 4: Admin Features (Product Management API)**
*   [ ] **Task 4.1 (Fetch):** สร้าง GET Method API เพื่อดึงข้อมูลสินค้าทั้งหมดจากฐานข้อมูลมาแสดงผล
*   [ ] **Task 4.2 (Create):** สร้าง POST Method API สำหรับเพิ่มสินค้าใหม่เข้าสู่ระบบร้านค้า
*   [ ] **Task 4.3 (Update):** สร้าง PUT Method API สำหรับแก้ไข/อัปเดตข้อมูลสินค้าในระบบ
*   [ ] **Task 4.4 (Delete):** สร้าง DELETE Method API สำหรับลบสินค้าออกจากระบบ

**Epic 5: User Features (Cart API)**
*   [ ] **Task 5.1 (Read):** สร้าง GET Method API (`/products/<user_id>`) เพื่อดึงข้อมูลสินค้าที่อยู่ในตะกร้าของ User
*   [ ] **Task 5.2 (Select/Add):** สร้าง POST Method API เพื่อบันทึกสินค้าที่ลูกค้าเลือกเพิ่มลงในตะกร้า
*   [ ] **Task 5.3 (Update):** สร้าง PUT Method API เพื่ออัปเดตสถานะ/จำนวน (Quantity) ของสินค้าในตะกร้า
*   [ ] **Task 5.4 (Delete):** สร้าง DELETE Method API เพื่อลบไอเทมออกจากตะกร้า

---

## 🛠 Technical Checklist (For Submission)
- [ ] UI ถูกพัฒนาด้วย React ทั้งหมด
- [ ] CRUD Operations ทุกตัวสามารถทำงานร่วมกับ MongoDB ได้อย่างสมบูรณ์
- [ ] สมาชิกในทีมเข้าใจโครงสร้างของโค้ด สามารถอธิบายพฤติกรรมการทำงานได้ทั้งหมด (Coding Fluency)
- [ ] สามารถแปลงลอจิกและความคิดออกมาเป็นโค้ดได้โดยไม่มีอุปสรรคสำคัญ
