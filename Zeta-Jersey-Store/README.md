# Sprint 2: E-Commerce Application (MERN Stack)

> เอกสารอธิบายการ implement ฝั่ง Frontend อยู่ที่ [`doc/FRONTEND_IMPLEMENTATION.md`](doc/FRONTEND_IMPLEMENTATION.md)

## 🎯 Sprint Goal

พัฒนาระบบ E-Commerce ขั้นพื้นฐาน โดยใน Sprint นี้จะเน้นการพัฒนาฝั่ง Frontend ให้สมบูรณ์ก่อน (UI, React Components, และ Form Validation) เพื่อให้ผู้ใช้สามารถตอบโต้กับระบบผ่าน Mock Data ได้ จากนั้นจะดำเนินการเชื่อมต่อกับฝั่ง Backend (Node.js/Express) และฐานข้อมูล (MongoDB) ในระยะถัดไปเมื่อทีมพร้อม

---

## 📋 Product Backlog & Sprint Tasks

### 🔴 Phase 1: Frontend & UI Development (High Priority)

_การพัฒนาส่วนหน้าบ้านด้วย React โดยใช้ Mock Data ในการทดสอบการทำงานชั่วคราว_

**Epic 1: User Interface & React Components**

- [ ] **Task 1.1:** สร้าง React Component สำหรับแสดงหน้าหลักและรายการสินค้าทั้งหมดในระบบ (Product List)
- [ ] **Task 1.2:** สร้าง React Component สำหรับแสดงรายละเอียดของสินค้าแต่ละชิ้น (Product Information)
- [ ] **Task 1.3:** สร้าง React Component สำหรับหน้าตะกร้าสินค้า (Cart)
- [ ] **Task 1.4:** สร้าง React Component สำหรับหน้าการสั่งซื้อ (Checkout)
- [ ] **Task 1.5:** ตรวจสอบการเขียน UI structure ว่ามีการใช้ JSX และ Library ที่เกี่ยวข้องอย่างถูกต้อง

**Epic 2: Form Validation & Error Handling**

- [ ] **Task 2.1:** เขียนฟังก์ชันตรวจสอบความถูกต้องของข้อมูลในฟอร์มก่อน Submit (ตรวจสอบฟิลด์: Name, Description, Price, Quantity, Date, Tag)
- [ ] **Task 2.2:** สร้างระบบแสดงข้อความแจ้งเตือน (Meaningful Error Message) เมื่อผู้ใช้กรอกข้อมูลไม่ถูกต้องให้ชัดเจน

---

### 🔵 Phase 2: Backend & Database (To-Do)

_การพัฒนาระบบหลังบ้านและการจัดการฐานข้อมูล (รอเริ่มดำเนินการเมื่อทีมพร้อม)_

**Epic 3: Database Setup (MongoDB & Mongoose)**

- [ ] **Task 3.1:** ติดตั้ง Mongoose เป็น dependency ในโปรเจกต์ผ่าน NPM
- [ ] **Task 3.2:** ตั้งค่าการเชื่อมต่อฐานข้อมูล MongoDB ให้สมบูรณ์ (ต้องไม่มี Error เมื่อ Start Server)

**Epic 4: Admin Features (Product Management API)**

- [ ] **Task 4.1 (Fetch):** สร้าง GET Method API เพื่อดึงข้อมูลสินค้าทั้งหมดจากฐานข้อมูลมาแสดงผล
- [ ] **Task 4.2 (Create):** สร้าง POST Method API สำหรับเพิ่มสินค้าใหม่เข้าสู่ระบบร้านค้า
- [ ] **Task 4.3 (Update):** สร้าง PUT Method API สำหรับแก้ไข/อัปเดตข้อมูลสินค้าในระบบ
- [ ] **Task 4.4 (Delete):** สร้าง DELETE Method API สำหรับลบสินค้าออกจากระบบ

**Epic 5: User Features (Cart API)**

- [ ] **Task 5.1 (Read):** สร้าง GET Method API (`/products/<user_id>`) เพื่อดึงข้อมูลสินค้าที่อยู่ในตะกร้าของ User
- [ ] **Task 5.2 (Select/Add):** สร้าง POST Method API เพื่อบันทึกสินค้าที่ลูกค้าเลือกเพิ่มลงในตะกร้า
- [ ] **Task 5.3 (Update):** สร้าง PUT Method API เพื่ออัปเดตสถานะ/จำนวน (Quantity) ของสินค้าในตะกร้า
- [ ] **Task 5.4 (Delete):** สร้าง DELETE Method API เพื่อลบไอเทมออกจากตะกร้า

---

## 🛠 Technical Checklist (For Submission)

- [ ] UI ถูกพัฒนาด้วย React ทั้งหมด
- [ ] CRUD Operations ทุกตัวสามารถทำงานร่วมกับ MongoDB ได้อย่างสมบูรณ์
- [ ] สมาชิกในทีมเข้าใจโครงสร้างของโค้ด สามารถอธิบายพฤติกรรมการทำงานได้ทั้งหมด (Coding Fluency)
- [ ] สามารถแปลงลอจิกและความคิดออกมาเป็นโค้ดได้โดยไม่มีอุปสรรคสำคัญ
# Premier League adidas demo catalog

The saved demo catalog includes men's 2026/27 home shirts for Arsenal, Aston Villa,
Fulham, Leeds United, Liverpool, Manchester United, Newcastle United, and Nottingham
Forest. Each record has a `sourceUrl`, and its two product photos are stored under
`public/images/adidas-pl-2627/`. Fulham and Nottingham Forest photos come from the
clubs' official shops; the other six come from adidas. The THB price (฿2,990), stock
quantity, and availability are fictional demo values, not live shop data.

Run `npm run import:adidas-pl-demo` in this directory to download the photos and add
any missing demo records. The importer preserves existing catalog entries and skips
demo IDs already present. To add the same records to a configured MongoDB catalog,
run `npm run seed:adidas-pl-demo` in `server/`; this only inserts missing SKUs and
does not change existing products. The storefront also displays the local demo
records when the API is unavailable or the database has not been seeded.

These third-party product photos are for this project demo. Review usage rights
before publishing or using them commercially.

# Nike five-league demo catalog

The catalog also includes 2026/27 Nike home-shirt demo entries for all 14 Nike
clubs in the Premier League (Chelsea, Tottenham, Brighton), La Liga (Barcelona,
Atlético Madrid, Elche, Deportivo), Serie A (Inter, Monza), Bundesliga
(Elversberg, Freiburg), and Ligue 1 (PSG, Angers, Toulouse). Images were fetched
from official Nike or club pages into `public/images/nike-top5-2627/`; each
record links to its source. Some clubs publish campaign photos rather than a
standalone product photo. The ฿2,990 prices and quantities are demo data.

Run `npm run import:nike-top5-demo` here to fetch images and add missing catalog
records. Run `npm run seed:nike-top5-demo` in `server/` to insert missing SKUs
into a configured MongoDB. Both commands preserve existing records.

# Puma five-league demo catalog

Eight men's 2026/27 Puma home fan jerseys are included: Manchester City,
Valencia CF, Girona FC, AC Milan, Borussia Dortmund, RB Leipzig, Olympique de
Marseille, and Stade Rennais. Each has three locally stored product photos
(model, shirt front, shirt back) from Puma's official product page under
`public/images/puma-top5-2627/`. Source pages are linked in the catalog records.
The THB price and stock are fictional demo values.

Run `npm run import:puma-top5-demo` here to download photos and append missing
records, or `npm run seed:puma-top5-demo` in `server/` to insert the records into
a configured MongoDB. Existing unrelated products are preserved.

# Thai League 1 demo catalog

Ten 2026/27 Thai League 1 home shirts are included in the local catalog.
PT Prachuap FC and Port FC use images and product references from their official
online stores. The remaining kit images and references are from the
[2026/27 Thai League 1 kit index](https://www.footballkitarchive.com/thai-league-1-kits-2026-27-l286/).
The images are stored under `public/images/thai-league-2627/` for this
educational demo. Except for the verified PT Prachuap FC and Port FC prices,
prices, stock, sizes, and edition labels are illustrative.

Run `npm run import:thai-league-demo` here to fetch missing images and refresh
the ten local catalog records. Run `npm run seed:thai-league-demo` in `server/`
only when you intend to insert them into a configured MongoDB.
