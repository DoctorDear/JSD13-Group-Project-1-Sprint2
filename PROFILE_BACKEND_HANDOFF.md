# Profile and reviews: handoff

## งานที่ทำใน branch นี้

- หน้า `/profile` ใช้ navbar ของร้านและโหลดข้อมูลผู้ใช้จาก `GET /api/v1/users/profile`; บันทึกด้วย `PATCH /api/v1/users/profile` พร้อมสถานะ loading/error
- หน้า My Orders ดึง `GET /api/v1/orders/my-orders` และลิงก์สินค้ากลับไปหน้า Product Detail
- หน้า My Reviews และ Product Detail แสดงรีวิวของผู้ใช้เองและเปิดหน้า `/products/:id/review` เพื่อเขียนหรือแก้รีวิวเดิม ผู้ซื้อที่เข้าเกณฑ์เท่านั้นจึงส่งรีวิวได้; backend มี endpoint ตรวจสิทธิ์ อ่านรีวิวตัวเอง และแก้รีวิว
- SHOP FAVORITES แสดงสินค้าจาก `GET /api/v1/products` ตาม Best Sellers หรือ New Arrivals แทนข้อมูลจำลอง
- Profile และ Checkout ใช้ `react-thaizip` สำหรับเลือกจังหวัด อำเภอ และตำบล/แขวง หรือค้นด้วยรหัสไปรษณีย์ จากนั้นเติมข้อมูลที่สัมพันธ์กัน; backend เก็บ `subdistrict` เพิ่ม
- แก้ CSS token `--border` ของฟอร์มที่อยู่ให้ไม่ชนกับ DaisyUI ซึ่งเคยทำให้ badge บน ProductCard มีพื้นหลังแคบกว่าข้อความ

## จุดสำคัญสำหรับทดสอบต่อ

1. เข้าสู่ระบบ แล้วเปิด `/profile`: ตรวจข้อมูลส่วนตัว การแก้ไข และประวัติคำสั่งซื้อ
2. เปิดสินค้าที่เคยซื้อ: ตรวจรีวิวของตัวเองอยู่ก่อนรีวิวอื่น เขียนหรือแก้รีวิวจาก Product Detail และ My Reviews
3. เปิด Profile edit และ Checkout: ลองเลือกจังหวัดก่อน แล้วเลือกอำเภอ/ตำบล; ลองค้นด้วย ZIP และเลือกรายการที่ตรงกัน
4. ตรวจ ProductCard badge `NEW` และ badge หมวดสินค้าในหน้า Landing/Products หลังแก้ CSS

คำสั่งตรวจ: ใน `Zeta-Jersey-Store` ใช้ `node --test src/lib/*.test.js` และ `npm run build`; ใน `server` ใช้ `node --test src/config/cors.test.js src/controllers/review.controller.test.js src/controllers/user.controller.test.js`.

## งานที่พักไว้

- Wishlist/Favorites: รอปุ่มและ database model แล้วค่อยกลับมาเชื่อมกับ Profile
- รูปโปรไฟล์/รูปรีวิว: ยังไม่มีการอัปโหลด Cloudflare R2; ต้องออกแบบ upload API และการจัดเก็บก่อน
- ที่อยู่เก่าที่ไม่มี `subdistrict` ยังอ่านได้ แต่ควรเติมตำบล/แขวงเมื่อแก้ที่อยู่ครั้งถัดไป

## ข้อควรระวัง

- ตัวเลือกที่อยู่จาก `react-thaizip` รองรับที่อยู่ในประเทศไทย จึงจำกัด Checkout country เป็น Thailand
- รีวิวต้องอ้างอิงบัญชีและประวัติการซื้อจริง; ควรทดสอบกับข้อมูลผู้ใช้/คำสั่งซื้อใน environment ที่เชื่อมฐานข้อมูลก่อน merge
