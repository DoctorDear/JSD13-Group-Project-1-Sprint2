# Sprint 2: E-Commerce Application Development (MERN Stack)

## 📌 Sprint Goal

พัฒนาระบบ E-Commerce ขั้นพื้นฐานให้สามารถทำงานแบบ Full-Stack ได้ โดยประกอบด้วยการสร้าง React Components สำหรับฝั่ง Frontend, การพัฒนา RESTful API ด้วย Node.js/Express และการจัดการฐานข้อมูลด้วย MongoDB ผ่าน Mongoose เพื่อให้ระบบครอบคลุมฟีเจอร์สำหรับผู้ใช้งานทั่วไปและแอดมิน

---

## 📋 Product Backlog & Sprint Tasks

### Epic 1: Database Integration & Setup (Mongoose)

**User Story:** ในฐานะนักพัฒนา ฉันต้องการเชื่อมต่อแอปพลิเคชันกับฐานข้อมูล MongoDB ด้วย Mongoose เพื่อให้สามารถจัดเก็บและเรียกใช้งานข้อมูล Product และ Cart ได้อย่างถูกต้อง

- [ ] **Task 1.1:** ติดตั้ง Mongoose เป็น Dependency ผ่าน NPM (`npm install mongoose`)
- [ ] **Task 1.2:** ตั้งค่าการเชื่อมต่อ Mongoose เข้ากับ MongoDB Database พร้อมทำ Error Handling ไม่ให้เกิดข้อผิดพลาดตอน Start Server
- [ ] **Task 1.3:** นำโครงสร้าง MongoDB Schema ที่ออกแบบไว้มาเขียนเป็น Mongoose Models

### Epic 2: Backend API Development (User & Admin Features)

**User Story 1 (Admin):** ในฐานะผู้ดูแลระบบ (Admin) ฉันต้องการจัดการข้อมูลสินค้าในคลัง (CRUD) เพื่อให้ลูกค้าเห็นข้อมูลสินค้าที่อัปเดตล่าสุด

- [ ] **Task 2.1 (Read):** สร้าง GET Method API (`/api/products`) เพื่อดึงข้อมูลสินค้าทั้งหมดออกมาแสดงผล
- [ ] **Task 2.2 (Create):** สร้าง POST Method API เพื่อเพิ่มสินค้าใหม่เข้าสู่ระบบ
- [ ] **Task 2.3 (Update):** สร้าง PUT Method API เพื่อแก้ไขข้อมูลสินค้าที่มีอยู่ในระบบ
- [ ] **Task 2.4 (Delete):** สร้าง DELETE Method API เพื่อลบข้อมูลสินค้าออกจากระบบ

**User Story 2 (Customer Cart):** ในฐานะลูกค้า ฉันต้องการจัดการตะกร้าสินค้าของตนเอง เพื่อเตรียมตัวเข้าสู่ขั้นตอนการชำระเงิน

- [ ] **Task 2.5 (Read):** สร้าง GET Method API (`/api/cart/<user_id>`) เพื่อดึงข้อมูลสินค้าที่อยู่ในตะกร้าของ User นั้นๆ
- [ ] **Task 2.6 (Create):** สร้าง POST Method API เพื่อบันทึกสินค้าที่ลูกค้าเลือกเพิ่มลงในตะกร้า
- [ ] **Task 2.7 (Update):** สร้าง PUT Method API เพื่ออัปเดตสถานะของสินค้าในตะกร้า (เช่น การเพิ่ม/ลดจำนวน Quantity)
- [ ] **Task 2.8 (Delete):** สร้าง DELETE Method API เพื่อลบสินค้าที่เลือกออกจากตะกร้า

### Epic 3: Frontend UI Components (React)

**User Story:** ในฐานะผู้ใช้งาน ฉันต้องการหน้าอินเทอร์เฟซที่ใช้งานง่ายสำหรับการดูสินค้า ตรวจสอบตะกร้า และจำลองการชำระเงิน

- [ ] **Task 3.1:** สร้าง React Component สำหรับแสดงผลรายการสินค้าทั้งหมด (Product List)
- [ ] **Task 3.2:** สร้าง React Component สำหรับแสดงรายละเอียดข้อมูลสินค้า (Product Information) ด้วย JSX
- [ ] **Task 3.3:** สร้าง React Component สำหรับระบบตะกร้าสินค้า (Cart)
- [ ] **Task 3.4:** สร้าง React Component สำหรับหน้าการสั่งซื้อ (Checkout)

### Epic 4: Form Validation & Error Handling

**User Story:** ในฐานะผู้ใช้งาน ฉันต้องการให้ระบบแจ้งเตือนข้อผิดพลาดที่ชัดเจนเวลาที่กรอกข้อมูลผิดพลาด เพื่อให้สามารถแก้ไขข้อมูลได้ถูกต้อง

- [ ] **Task 4.1:** เขียนฟังก์ชันตรวจสอบความถูกต้องของข้อมูล (Validation) ในทุก Form ก่อน Submit (ตรวจสอบฟิลด์: Name, Description, Price, Quantity, Date, Tag)
- [ ] **Task 4.2:** สร้างระบบแสดงข้อความแจ้งเตือน (Error Message) ที่สื่อความหมายชัดเจนบนหน้า UI เมื่อผู้ใช้งานกรอกข้อมูลไม่ถูกต้อง

---

## 🛠 Technical Requirements Checklist

- [ ] UI ทั้งหมดถูกพัฒนาด้วย React
- [ ] มีการใช้งาน JSX และ Library ต่างๆ อย่างถูกต้อง
- [ ] โค้ดที่เขียนสามารถอธิบายพฤติกรรมการทำงานได้ทั้งหมด (Code Fluency)
- [ ] ทุกฟังก์ชัน CRUD สามารถทำ Interaction กับฐานข้อมูล MongoDB ได้สมบูรณ์
