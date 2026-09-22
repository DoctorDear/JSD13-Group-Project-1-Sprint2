# Frontend Implementation Guide

เอกสารนี้สรุปงานที่ทำในฝั่ง Frontend ของ Zeta Jersey Store และอธิบายเหตุผลของโค้ดแบบง่าย ๆ สำหรับสมาชิกทุกคนที่กำลังเรียนรู้ React ไปพร้อมกัน

## 1. ภาพรวมงานที่ทำ

| ส่วนงาน | สิ่งที่ทำ | สถานะ |
| --- | --- | --- |
| Product catalog | ดึงสินค้า, ค้นหา, filter, sort และแบ่งหน้า | ทำแล้ว |
| Product card | แสดงรูป ชื่อ แบรนด์ ลีก จำนวน ราคา และปุ่มเพิ่มลงตะกร้า | ทำแล้ว |
| Product detail | แกลเลอรีรูป, breadcrumb, แบรนด์, ราคา, รุ่น, ไซส์ และ responsive layout | ทำแล้ว |
| Size guide | Popup ตารางเทียบไซส์เมื่อกด `Size Guide` | ทำแล้ว |
| Product attributes | แสดง Fit, Kit Type และ Activity | ทำแล้ว |
| Reviews | แสดงสรุปคะแนน, rating filter, topic filter, sort และรายการรีวิว | ทำแล้ว |
| Cart / Checkout | แสดงแบรนด์ของสินค้าใน mock cart และ checkout | ทำแล้ว |

## 2. โครงสร้างไฟล์สำคัญ

```text
src/
├─ components/
│  ├─ ProductDetail.jsx          หน้ารายละเอียดสินค้า
│  ├─ ProductReviewSection.jsx   ส่วนรีวิวและตัวกรองรีวิว
│  ├─ SizeGuideModal.jsx         Popup ตารางเทียบไซส์
│  ├─ ProductCard.jsx             การ์ดสินค้า
│  ├─ CartItemCard.jsx            รายการสินค้าในตะกร้า
│  └─ CheckoutItemCard/           รายการสินค้าใน checkout
├─ hooks/
│  └─ useProductCatalog.js        จัดการการโหลด/filter/sort/pagination
├─ lib/
│  └─ productCatalog.js           ฟังก์ชันช่วยเกี่ยวกับ catalog
├─ pages/
│  ├─ AllProductsPage.jsx         หน้ารวมสินค้า
│  ├─ ProductDetailPage.jsx       wrapper ของ Product Detail
│  ├─ CartPage.jsx                หน้าตะกร้า
│  └─ CheckoutPage.jsx            หน้า checkout
└─ data/
   └─ products.json               ข้อมูลสำรองเมื่อเรียก API ไม่ได้
```

## 3. Product catalog ทำงานอย่างไร

หน้ารวมสินค้าใช้ `useProductCatalog` เป็นตัวจัดการข้อมูลทั้งหมดตามลำดับนี้:

```text
เรียก API /api/v1/products
        │
        ├─ สำเร็จ → ใช้สินค้าจาก Database
        └─ ล้มเหลว → ใช้ src/data/products.json เป็น fallback
        │
        ↓
filter → sort → แบ่งหน้า → ส่ง visibleProducts ให้ ProductCard
```

### Pagination

`PRODUCT_PAGE_SIZE` ตั้งไว้เป็น `8` เพราะหน้า desktop มี 4 columns ดังนั้น 8 ใบจะเต็ม 2 แถวพอดี และหน้า mobile ที่มี 1–2 columns ก็ยังไม่ตัดกลางแถวโดยไม่จำเป็น

ไฟล์ที่เกี่ยวข้อง:

- `src/lib/productCatalog.js`
- `src/hooks/useProductCatalog.js`
- `src/pages/AllProductsPage.jsx`

## 4. Product Detail

`ProductDetail.jsx` โหลดสินค้าจาก API ตาม `id` ที่อยู่ใน URL:

```text
/products/:id
```

ข้อมูลที่นำมาแสดง ได้แก่:

- รูปสินค้าและ thumbnail
- Breadcrumb: `Home / ชื่อสินค้า`
- League หรือ category
- Brand เช่น `Adidas`
- ชื่อสินค้า ราคา และราคาก่อนลด
- Edition เช่น Stadium Edition / Player Edition
- ไซส์ที่เลือกได้
- Fit, Kit Type, Activity
- รีวิวของสินค้านั้น

### Responsive layout

- Mobile: แสดงรูปก่อน แล้วจึงแสดงข้อมูลสินค้า
- Desktop: แบ่งเป็นสองคอลัมน์ รูปอยู่ซ้าย ข้อมูลอยู่ขวา
- Thumbnail จะเรียงแนวนอนบนมือถือ และเรียงแนวตั้งบน desktop
- ส่วนข้อมูลสินค้าจะ sticky บน desktop เพื่อให้เลือกไซส์ได้สะดวก

## 5. Size Guide popup

เมื่อกดปุ่ม `Size Guide` จะเปิด `SizeGuideModal.jsx` ซึ่งมี:

- พื้นหลัง overlay
- ปุ่มปิด
- กด `Escape` เพื่อปิด
- คลิกพื้นหลังด้านนอกเพื่อปิด
- ตารางไซส์ XS ถึง 3XL
- บนหน้าจอเล็กสามารถเลื่อนตารางในแนวนอนได้

ตอนนี้ข้อมูล Chest และ Length เป็นข้อมูลตัวอย่างที่อยู่ใน component โดยตรง เพราะ Product model ยังไม่ได้เก็บ measurement แยกตามไซส์ ถ้าจะทำให้เป็นข้อมูลจริง ควรเพิ่ม field เช่น:

```js
sizeGuide: {
  XS: { chest: 36, length: 28 },
  S: { chest: 39, length: 28.5 },
}
```

## 6. Brand และ Product attributes

ใน Product model เพิ่มข้อมูลดังนี้:

```text
brand     เช่น Adidas หรือ Nike
fit       slim, regular, relaxed, oversized
kitType   home, away, third, goalkeeper, training, lifestyle
activity  football, training, lifestyle
```

Brand แสดงเหนือชื่อสินค้าใน Product Detail และแสดงใน Product Card, Cart และ Checkout เพื่อให้ผู้ใช้รู้ว่าสินค้าเป็นของแบรนด์ใด ไม่ต้องเดาจากชื่อทีมอย่างเดียว

## 7. Reviews

`ProductReviewSection.jsx` เรียกข้อมูลจาก:

```text
GET /api/v1/products/:productId/reviews
```

ส่วนที่แสดงผล:

- จำนวนรีวิวและคะแนนเฉลี่ย
- เปอร์เซ็นต์ผู้แนะนำสินค้า
- คะแนนย่อย Comfort, Quality, Fit และ Length
- กรองตามจำนวนดาว
- กรองตาม topic เช่น Fit, Quality, Comfort
- เรียงตาม Newest, Highest rating, Lowest rating และ Most helpful
- รายละเอียดรีวิวและสถานะ Verified purchase

ตัว component แยกออกจาก Product Detail เพื่อให้หน้าหลักอ่านง่าย และสามารถนำไปใช้กับหน้าสินค้าอื่นได้

## 8. Cart และ Checkout ตอนนี้เป็นอย่างไร

หน้า Cart และ Checkout ใน branch นี้ยังใช้ mock data และ local state เป็นหลัก:

- เพิ่ม/ลดจำนวนสินค้าได้ในหน้าจอ
- ลบสินค้าออกจากรายการได้
- คำนวณ subtotal, discount, delivery fee และ total
- แสดง Brand เหนือชื่อสินค้า

ขั้นถัดไปคือเปลี่ยน mock data ให้มาจาก Cart API และใช้ `productId` เป็นตัวอ้างอิงสินค้าแทนการเขียนข้อมูลสินค้าไว้ใน component โดยตรง

## 9. คำสั่งที่ใช้บ่อย

เปิด Frontend:

```bash
cd Zeta-Jersey-Store
npm install
npm run dev
```

ตรวจ lint:

```bash
npm run lint
```

สร้าง production build:

```bash
npm run build
```

เปิด Backend พร้อมกันใน terminal อีกหน้าต่าง:

```bash
cd server
npm install
npm run dev
```

Frontend จะเรียก Backend ที่ `http://localhost:3001` เป็นค่าเริ่มต้น และสามารถเปลี่ยนได้ด้วย `VITE_API_URL`

## 10. Checklist ก่อนเปิด Pull Request

- เปิดหน้า `/products` และตรวจว่าการ์ดเต็ม grid ตามจำนวนที่ตั้งไว้
- กดเข้า Product Detail จากการ์ด
- ตรวจ breadcrumb และชื่อสินค้า
- กด `Size Guide` แล้วลองปิดด้วยปุ่ม, `Escape` และคลิกด้านนอก
- ตรวจว่า mobile ไม่ล้นจอ และตารางไซส์เลื่อนได้
- ตรวจว่ารีวิวโหลดและ filter ได้
- ตรวจ Cart และ Checkout ว่าแสดง Brand
- รัน `npm run lint` และ `git diff --check`
- เปิด PR จาก feature branch เข้า `Develop` ก่อน แล้วค่อยรวม `Develop` เข้า `main` หลัง integrate งานของทุกคนแล้ว

## 11. คำศัพท์พื้นฐานสำหรับมือใหม่

| คำศัพท์ | ความหมาย |
| --- | --- |
| Component | ชิ้นส่วน UI ที่นำกลับมาใช้ซ้ำได้ เช่น ProductCard |
| Props | ข้อมูลที่ component แม่ส่งให้ component ลูก |
| State | ข้อมูลภายใน component ที่เปลี่ยนแล้วทำให้หน้าจอ render ใหม่ |
| Hook | ฟังก์ชันพิเศษของ React เช่น `useState`, `useEffect` |
| API | ช่องทางที่ Frontend ใช้คุยกับ Backend |
| Fallback | ข้อมูลสำรองที่ใช้เมื่อแหล่งข้อมูลหลักใช้งานไม่ได้ |
| Responsive | UI ที่ปรับตามขนาดหน้าจอ |
| Pagination | การแบ่งรายการข้อมูลออกเป็นหลายหน้า |

หลักการสำคัญคือ เวลาเพิ่ม feature ใหม่ ให้แยกหน้าที่ของโค้ดให้ชัดเจน: Page จัด layout, Component แสดง UI, Hook จัดการ state/การโหลดข้อมูล และ lib เก็บฟังก์ชันที่ใช้ซ้ำได้
