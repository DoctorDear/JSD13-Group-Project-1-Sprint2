# Wishlist API

Wishlist เก็บรหัสสินค้าไว้ใน `User.wishlist` ของผู้ใช้ที่เข้าสู่ระบบ แต่ละรายการอ้างถึง `Product` ใน MongoDB และ API ส่งรายละเอียดสินค้าที่ populate แล้วกลับมา

## Endpoints

ทุก endpoint อยู่ใต้ `/api/v1` และต้องมี cookie `accessToken` ที่ผ่าน `verifyToken` ไม่มี request body สำหรับการเพิ่มหรือลบสินค้า

| Method | Path | ผลลัพธ์ |
| --- | --- | --- |
| GET | `/users/wishlist` | รายการสินค้าของผู้ใช้ปัจจุบัน |
| POST | `/users/wishlist/:productId` | เพิ่มสินค้าและคืนรายการล่าสุด |
| DELETE | `/users/wishlist/:productId` | ลบสินค้าและคืนรายการล่าสุด |

ตัวอย่าง response สำเร็จ (HTTP 200):

```json
{
  "success": true,
  "wishlist": [
    { "_id": "64b000000000000000000001", "name": "Example Jersey" }
  ]
}
```

`POST` ใช้ `$addToSet` จึงไม่เพิ่มสินค้าซ้ำเมื่อเรียกซ้ำ ส่วน `DELETE` ใช้ `$pull`; การลบรหัสที่ไม่ได้อยู่ในรายการยังตอบ 200 พร้อมรายการปัจจุบัน

| กรณี | HTTP | ข้อความ |
| --- | --- | --- |
| ไม่มี cookie หรือ token ใช้ไม่ได้ | 401 | จาก `verifyToken` |
| `productId` ไม่ใช่ MongoDB ObjectId | 400 | `Invalid product ID` |
| เพิ่มสินค้าที่ไม่มีอยู่ | 404 | `Product not found` |
| ไม่พบผู้ใช้จาก token | 404 | `User not found` |

`GET` และผลลัพธ์หลังเพิ่มหรือลบใช้ `populate("wishlist")` จึงส่งข้อมูลสินค้าให้หน้าเว็บแสดงได้ทันที หากเอกสารสินค้าถูกลบในภายหลัง การ populate อาจให้ค่า `null`; frontend กรองค่าดังกล่าวก่อนแสดง

## โค้ดที่เกี่ยวข้อง

- `src/models/User.model.js`: ฟิลด์ `wishlist` เป็น array ของ Product ObjectId
- `src/routes/v1/user.routes.js`: route และ `verifyToken`
- `src/controllers/user.controller.js`: `getWishlist`, `addToWishlist`, `removeFromWishlist`
- `src/controllers/wishlist.controller.test.js` และ `src/routes/v1/wishlist.routes.test.js`: ทดสอบ controller และ auth ของ route

## รันและตรวจสอบ

1. ติดตั้ง dependencies ใน `server` ด้วย `npm ci`
2. เตรียม `server/.env` สำหรับฐานข้อมูลและ JWT ตามการตั้งค่าของโปรเจกต์ ไฟล์นี้ถูก Git ignore
3. รัน `npm run dev` เพื่อเปิด API ที่พอร์ต 3001 ตามค่าเริ่มต้น
4. ล็อกอินผ่านเว็บ แล้วเรียก endpoint โดยส่ง cookie `accessToken` ไปด้วย
5. รัน `npm test` สำหรับ automated tests

Automated tests ใช้ stub ของ Mongoose model และ HTTP route จึงไม่ยืนยันการทำงานกับ MongoDB จริง ควรลองเพิ่มและลบสินค้าจากหน้าเว็บที่ต่อกับฐานข้อมูลก่อน merge
