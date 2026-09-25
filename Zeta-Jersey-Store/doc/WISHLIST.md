# Wishlist ในหน้าเว็บ

ผู้ใช้ที่เข้าสู่ระบบกดหัวใจบน Product Card หรือ Product Detail เพื่อบันทึกหรือลบสินค้าได้ รายการอยู่ใน Profile > Favorites ที่ `/profile?tab=favorites` และไอคอนหัวใจบน Navbar เปิดหน้านี้

## การทำงาน

1. `WishlistProvider` อยู่ใต้ `AuthProvider` และโหลดรายการของบัญชีปัจจุบันจาก `GET /api/v1/users/wishlist`
2. `WishlistButton` อ่านสถานะจาก context แล้วเรียก `POST` หรือ `DELETE` ผ่าน `src/services/wishlist.js`
3. เมื่อ API ตอบสำเร็จ context ใช้รายการล่าสุดจาก response เพื่อให้หัวใจทุกจุดตรงกัน
4. ระหว่างส่งคำขอ ระบบรับการเปลี่ยนรายการทีละครั้ง ปุ่มที่คลิกมีสถานะ busy; ปุ่มสินค้าอื่นไม่เปลี่ยนความทึบหรือเล่น animation ตาม
5. หัวใจที่กดใช้ Tailwind `group-active:scale-75` และ `transition-transform` โดยคำนึงถึง `prefers-reduced-motion`

ถ้ายังไม่เข้าสู่ระบบ การกดหัวใจจะพาไปหน้า Login แล้วกลับไป URL เดิมหลังเข้าสู่ระบบ รวม query string และ hash หากโหลดรายการล้มเหลวหน้า Favorites จะแสดง error และปุ่ม Retry; หากเพิ่มหรือลบล้มเหลวปุ่มจะแสดงข้อความแจ้งเตือน สินค้าที่ใช้ ID ซึ่งไม่ใช่ MongoDB ObjectId เช่น demo data จะกดหัวใจไม่ได้

## โค้ดที่เกี่ยวข้อง

| ไฟล์ | หน้าที่ |
| --- | --- |
| `src/services/wishlist.js` | เรียก Wishlist API ผ่าน `src/lib/api.js` ซึ่งส่ง cookie |
| `src/contexts/WishlistProvider.jsx` | โหลดรายการและแชร์สถานะเมื่อบัญชีเปลี่ยน |
| `src/lib/wishlistModel.js` | ตรวจ ID, กรองสินค้าที่ถูกลบ และเช็กสถานะหัวใจ |
| `src/components/WishlistButton.jsx` | ปุ่มหัวใจและสถานะกด |
| `src/components/ProfilePages/WishlistSection.jsx` | loading, error, empty และรายการสินค้า |
| `src/lib/loginReturnPath.js` | คืนเส้นทางเดิมหลัง Login |

## รันและตรวจสอบ

1. เปิด backend และฐานข้อมูลตาม `server/doc/WISHLIST.md`
2. ใน `Zeta-Jersey-Store` รัน `npm ci` แล้ว `npm run dev` Vite proxy ส่ง `/api` ไป `http://localhost:3001` ตามค่าเริ่มต้น หากตั้ง `VITE_API_BASE_URL` ให้ชี้ไป API ที่ถูกต้อง
3. ล็อกอินด้วยบัญชีทดสอบ กดหัวใจบน Product Detail แล้วเปิด Favorites จาก Navbar
4. ลบสินค้าใน Favorites และลองกดหัวใจบน Product Card โดยตรวจว่าไม่พาไป Product Detail และปุ่มสินค้าอื่นไม่กระพริบ
5. รัน `node --test src/lib/*.test.js src/contexts/*.test.js` และ `npm run build`

ไฟล์ `.env` ใช้เฉพาะเครื่องและถูก Git ignore ไม่ควรใส่ค่า secret ลงในเอกสารหรือ PR
