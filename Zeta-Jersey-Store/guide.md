# คู่มือการพัฒนา Navbar แบบ 2 สไตล์ (Multi-variant Navbar)

เอกสารสรุปแนวทางและวิธีเขียน Component `Navbar` ในโปรเจกต์ **Zeta Jersey Store** ให้สามารถแสดงผลได้ 2 รูปแบบ โดยใช้ไฟล์ Component เดียวกันผ่านการส่ง **Props**

---

## 1. รูปแบบความแตกต่างของทั้ง 2 สไตล์

| สไตล์           | หน้าที่ใช้งาน                                     | ลักษณะดีไซน์ (Design Specs)                                                                                                                                                                                                    |
| :-------------- | :------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Home Style**  | หน้าแรก (`Home`)                                  | • ทรงแคปซูลมนลอย (`rounded-full`, `mx-4`, `top-4`)<br>• พื้นหลังสีเทาดำกึ่งโปร่งใส Glossy (`bg-[#2F2F2F]/75 backdrop-blur-lg`)<br>• เมนูตรงกลางและ Search โทนสีเขียวมะกอก (`bg-[#D3D648]/30`)<br>• ไอคอนสีขาว (`text-white`)   |
| **Inner Style** | หน้าอื่นๆ (`ProductDetail`, `Cart`, `League` ฯลฯ) | • แถบตรงเต็มความกว้างหน้าจอ (`w-full`, `top-0`)<br>• พื้นหลังสีน้ำเงินเข้ม Zeta (`bg-[#1E0E8A] shadow-md`)<br>• เมนูตรงกลางและ Search สีกึ่งโปร่งแสงบนพื้นน้ำเงิน (`bg-white/15`)<br>• ไอคอนสีเขียวตอง Zeta (`text-[#D3D648]`) |

---

## 2. โครงสร้างและโค้ดใน `src/components/Navbar.jsx`

เราจะให้ Component รับ Prop ชื่อว่า `variant` โดยกำหนดค่าเริ่มต้น (Default Value) ให้เป็น `"home"`

```jsx
// src/components/Navbar.jsx
import logo from "../assets/logo/Zeta_all_Green_Logo.png";
import { Heart, ShoppingCart, CircleUser } from "lucide-react";

const Navbar = ({ variant = "home" }) => {
  const isHome = variant === "home";

  return (
    <nav
      className={`sticky top-0 z-50 flex items-center justify-between px-6 md:px-8 h-15 transition-all duration-300 ${
        isHome
          ? "top-4 mt-4 mx-4 max-w-full bg-[#2F2F2F]/75 backdrop-blur-lg rounded-full" // สไตล์หน้า Home (แคปซูลลอย)
          : "w-full bg-[#1E0E8A] shadow-md" // สไตล์หน้าอื่นๆ (สีน้ำเงินเต็มจอ)
      }`}
    >
      {/* 1. Left: Logo */}
      <div className="flex items-center h-15">
        <a href="/" className="flex items-center">
          <img
            className="h-10 w-auto object-contain"
            src={logo}
            alt="Zeta Logo"
          />
        </a>
      </div>

      {/* 2. Center: Navigation Menu */}
      <div
        className={`flex items-center h-10 rounded-full text-sm font-medium transition-all ${
          isHome
            ? "bg-[#D3D648]/30 border border-white/10 text-white" // โทนเขียวหน้า Home
            : "bg-white/15 backdrop-blur-md text-white border border-white/10" // โทนโปร่งแสงบนพื้นน้ำเงิน
        }`}
      >
        <a
          href="#"
          className="px-4 py-2 rounded-full transition-all hover:text-[#1E0E8A] hover:bg-[#D3D648]/20 hover:shadow-[inset_-1px_-1px_1px_rgba(255,255,255,0.4),inset_1px_1px_1px_rgba(255,255,255,0.4)]"
        >
          New Arrivals
        </a>
        <a
          href="#"
          className="px-4 py-2 rounded-full transition-all hover:text-[#1E0E8A] hover:bg-[#D3D648]/20 hover:shadow-[inset_-1px_-1px_1px_rgba(255,255,255,0.4),inset_1px_1px_1px_rgba(255,255,255,0.4)]"
        >
          Best Seller
        </a>
        <a
          href="#"
          className="px-4 py-2 rounded-full transition-all hover:text-[#1E0E8A] hover:bg-[#D3D648]/20 hover:shadow-[inset_-1px_-1px_1px_rgba(255,255,255,0.4),inset_1px_1px_1px_rgba(255,255,255,0.4)]"
        >
          League
        </a>
        <a
          href="#"
          className="px-4 py-2 rounded-full transition-all hover:text-[#1E0E8A] hover:bg-[#D3D648]/20 hover:shadow-[inset_-1px_-1px_1px_rgba(255,255,255,0.4),inset_1px_1px_1px_rgba(255,255,255,0.4)]"
        >
          Collections
        </a>
        <a
          href="#"
          className="px-4 py-2 rounded-full transition-all hover:text-[#1E0E8A] hover:bg-[#D3D648]/20 hover:shadow-[inset_-1px_-1px_1px_rgba(255,255,255,0.4),inset_1px_1px_1px_rgba(255,255,255,0.4)]"
        >
          On Sale
        </a>
      </div>

      {/* 3. Right: Search & Action Icons */}
      <div className="flex items-center space-x-4 h-10">
        {/* Search Bar */}
        <label
          className={`input rounded-full h-9 w-40 text-white flex items-center px-3 focus-within:outline-none focus-within:ring-1 focus-within:ring-white/30 ${
            isHome
              ? "bg-[#D3D648]/30 border border-white/20"
              : "bg-white/20 border border-white/10"
          }`}
        >
          <svg
            className="h-[1.5em] text-white shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <g
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="2.0"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </g>
          </svg>
          <input
            type="text"
            required
            placeholder="Search"
            className="placeholder:text-white bg-transparent focus:outline-none grow text-sm"
          />
        </label>

        {/* Action Icons */}
        <div
          className={`flex items-center gap-1.5 ${
            isHome ? "text-white" : "text-[#D3D648]"
          }`}
        >
          <button
            type="button"
            aria-label="Wishlist"
            className="p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <Heart className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="Cart"
            className="p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="Profile"
            className="p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <CircleUser className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
```

---

## 3. วิธีนำไปเรียกใช้งานในแต่ละหน้า (Page Integration)

### 3.1 การใช้งานที่หน้าแรก (`Home.jsx` หรือ `App.jsx`)

ไม่ต้องส่ง prop ใดๆ เข้าไป (จะใช้ค่าเริ่มต้น `"home"`) หรือระบุแบบเจาะจงก็ได้:

```jsx
import Navbar from "./components/Navbar";

function HomePage() {
  return (
    <div>
      {/* แสดงผลแบบแคปซูลลอย สีเทาดำ Glossy */}
      <Navbar />
      {/* หรือ <Navbar variant="home" /> */}

      <main>{/* เนื้อหาหน้าแรก */}</main>
    </div>
  );
}

export default HomePage;
```

---

### 3.2 การใช้งานที่หน้าอื่นๆ (`ProductDetail.jsx`, `Cart.jsx`, `League.jsx` ฯลฯ)

ส่ง prop `variant="blue"` (หรือระบุเป็นอะไรก็ได้ที่ไม่ใช่ `"home"`):

```jsx
import Navbar from "../components/Navbar";

function ProductDetailPage() {
  return (
    <div>
      {/* แสดงผลแบบแถบเต็มจอ สีน้ำเงินเข้ม Zeta */}
      <Navbar variant="blue" />

      <main>{/* เนื้อหาหน้ารายละเอียดสินค้า */}</main>
    </div>
  );
}

export default ProductDetailPage;
```

---

## 4. ข้อดีของการใช้ Prop แทนการแยก 2 ไฟล์

1. **Single Source of Truth:** เมื่อมีการเพิ่ม/ลดเมนู แก้ไขคำ หรือเปลี่ยนฟังก์ชันการค้นหา จะแก้ไขที่ไฟล์ `Navbar.jsx` เพียงไฟล์เดียว ทุกหน้าในเว็บไซต์จะอัปเดตพร้อมกันทันที
2. **ไม่เกิดโค้ดซ้ำซ้อน (DRY - Don't Repeat Yourself):** ลดภาระในการตามแก้บั๊กและการดูแลโค้ดในระยะยาว
3. **ขยายสไตล์เพิ่มได้ง่าย:** หากในอนาคตมีธีมหรือเทศกาลพิเศษ (เช่น `variant="white"` หรือ `variant="dark"`) ก็เพียงแค่เพิ่มเงื่อนไขในตัวแปร `variant` ได้ทันที
