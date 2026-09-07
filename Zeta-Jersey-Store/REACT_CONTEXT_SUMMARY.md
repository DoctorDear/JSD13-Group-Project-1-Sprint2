# 📚 คู่มือสรุปความเข้าใจ React Context (useContext) vs Props
> **Project:** Zeta-Jersey-Store (Sprint-2: JSD13 Group Project)  
> **หัวข้อ:** การเปลี่ยนผ่านจากการส่งข้อมูลผ่าน Props สู่การใช้ Global State ด้วย `useContext`

---

## 1. 🎯 ภาพรวมแนวคิด (Mental Model)

- **Props (แบบเดิม):** เปรียบเหมือนการ **"ส่งพัสดุต่อกันเป็นทอด ๆ"** ถ้า Component หลานต้องการข้อมูล Component แม่ต้องยื่นให้ลูก แล้วลูกต้องยื่นให้หลาน แม้ว่าตัวลูกจะไม่ได้อยากใช้ข้อมูลนั้นเลยก็ตาม (เกิดปัญหาที่เรียกว่า **Prop Drilling**)
- **Context (แบบใหม่):** เปรียบเหมือน **"ตู้เซฟส่วนกลาง / สัญญาณ Wi-Fi"** ที่วางไว้กลางบ้าน ทุก Component ไม่ว่าจะอยู่ลึกแค่ไหน สามารถเปิดตู้เซฟหยิบข้อมูลไปใช้ได้โดยตรงทันที ไม่ต้องผ่านคนกลาง

```mermaid
graph LR
    subgraph แบบเดิม_Props["📦 แบบเดิม: Props (ส่งต่อทีละชั้น)"]
        A1["App.jsx<br>(ถือ State: products)"] -->|ส่ง prop products={products}| B1["Suggestion.jsx<br>(ต้องรับ ({ products }))"]
    end

    subgraph แบบใหม่_Context["⭐ แบบใหม่: Context (ดึงตรงจากส่วนกลาง)"]
        C2["CartContext.jsx<br>(ตู้กลางเก็บ products)"] -.->|หุ้มแอปไว้| M2["main.jsx"]
        C2 ==>|useCart() วาร์ปข้อมูลไปหา| B2["Suggestion.jsx<br>(หยิบ products มาใช้ได้เอง)"]
        A2["App.jsx<br>(ไม่ต้องถือหรือส่งอะไรเลย โค้ดสะอาดมาก)"]
    end
```

---

## 2. 🔍 เปรียบเทียบโค้ดแบบไฟล์ต่อไฟล์

### ① `src/App.jsx` (Component แม่)

| แบบเดิม (Props) | ⭐ แบบใหม่ (Context) |
| :--- | :--- |
| ```jsx<br>import { useState } from "react";<br>import productData from "./data/products.json";<br>import Suggestion from "./components/Suggestion";<br><br>const App = () => {<br>  // ❌ ต้องแบก state ไว้ที่นี่<br>  const [products, setProducts] = useState(productData);<br><br>  return (<br>    <div><br>      {/* ❌ ต้องคอยส่ง prop ให้ลูก */}<br>      <Suggestion products={products} /><br>    </div><br>  );<br>};<br>export default App;<br>``` | ```jsx<br>import Suggestion from "./components/Suggestion";<br><br>const App = () => {<br>  return (<br>    <div><br>      {/* ✅ เรียกใช้ได้เลย ไม่ต้องส่ง prop! */}<br>      <Suggestion /><br>    </div><br>  );<br>};<br>export default App;<br>``` |

> **ผลลัพธ์:** `App.jsx` ไม่ต้องมี `useState` สำหรับ `products` และไม่ต้องส่ง prop ให้ Component ลูกอีกต่อไป โค้ดสั้นและสะอาดขึ้นมาก

---

### ② `src/components/Suggestion.jsx` (Component ลูก)

| แบบเดิม (Props) | ⭐ แบบใหม่ (Context) |
| :--- | :--- |
| ```jsx<br>import ProductCard from "./ProductCard";<br><br>// ❌ ต้องรอรับ prop ({ products }) จากแม่<br>const Suggestion = ({ products = [] }) => {<br>  return (<br>    <div><br>      <h1>You May Also Like</h1><br>      <div><br>        {products.map((item) => (<br>          <ProductCard key={item.id} product={item} /><br>        ))}<br>      </div><br>    </div><br>  );<br>};<br>export default Suggestion;<br>``` | ```jsx<br>import ProductCard from "./ProductCard";<br>import { useCart } from "../context/CartContext";<br><br>// ✅ หัวฟังก์ชันว่าง ไม่ต้องพึ่งพา prop จากแม่<br>const Suggestion = () => {<br>  // ✅ ดึง products จาก Context โดยตรง<br>  const { products } = useCart();<br><br>  return (<br>    <div><br>      <h1>You May Also Like</h1><br>      <div><br>        {products.map((item) => (<br>          <ProductCard key={item.id} product={item} /><br>        ))}<br>      </div><br>    </div><br>  );<br>};<br>export default Suggestion;<br>``` |

> **ผลลัพธ์:** `Suggestion.jsx` กลายเป็นอิสระ หากใครเอาคอมโพเนนต์นี้ไปแปะที่หน้าอื่น ก็ไม่ต้องคอยส่ง `products` ตามไปให้

---

### ③ `src/context/CartContext.jsx` (ไฟล์ใหม่: ศูนย์กลางข้อมูล)

ไฟล์นี้ทำหน้าที่เป็น **Single Source of Truth** รวบรวม 3 สิ่งสำคัญไว้ด้วยกัน:

```jsx
import { createContext, useContext, useState } from "react";
import productData from "../data/products.json";

// 1. สร้าง Context (ท่อส่งสัญญาณ)
const CartContext = createContext();

// 2. สร้าง Provider (ตัวปล่อยข้อมูลกลาง)
export const CartProvider = ({ children }) => {
  const [products, setProducts] = useState(productData);

  return (
    // ส่ง products ผ่าน prop ที่ชื่อว่า value
    <CartContext.Provider value={{ products }}>
      {children}
    </CartContext.Provider>
  );
};

// 3. สร้าง Custom Hook (กุญแจทางลัด ให้ไฟล์อื่นเรียกใช้าง่ายๆ)
export const useCart = () => useContext(CartContext);
```

---

### ④ `src/main.jsx` (การติดตั้ง Provider)

เพื่อให้ทุก Component ภายในแอปสามารถเข้าถึง Context ได้ เรานำ `CartProvider` มาครอบ `<App />` ไว้ที่ Root:

```jsx
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { CartProvider } from "./context/CartContext.jsx"; // 👈 1. Import เข้ามา

createRoot(document.getElementById("root")).render(
  // 👈 2. นำมาครอบ App ไว้
  <CartProvider>
    <App />
  </CartProvider>,
);
```

---

## 3. 💡 ไขข้อข้องใจสำคัญ (FAQ)

### Q: `{ children }` ใน `CartProvider` คืออะไร?
**A:** ใน React เมื่อเราเขียนคอมโพเนนต์ครอบตัวอื่น เช่น:
```jsx
<CartProvider>
  <App />  {/* <-- ตัวนี้แหละคือ children */}
</CartProvider>
```
`children` คือตัวแทนของทุก Component ที่อยู่ข้างใน เพื่อบอก React ว่า **"ให้แสดงผลสิ่งที่อยู่ข้างในฉัน และให้ลูก ๆ เหล่านั้นเข้าถึงข้อมูลใน value ได้ทั้งหมด"**

### Q: `useCart` มาจากไหน?
**A:** เราเป็นคนเขียนและตั้งชื่อขึ้นมาเอง (Custom Hook) โดยนำคำสั่ง `useContext(CartContext)` มาห่อไว้ เพื่อให้เวลาไฟล์อื่นจะใช้งาน ไม่ต้องเขียนคำว่า `useContext` ซ้ำ ๆ สามารถเรียก `useCart()` คำเดียวได้เลย

---

## 4. 🚀 สเต็ปต่อไปสำหรับ Sprint 2 (เมื่อพร้อมต่อยอด)

เมื่อต้องการเริ่มทำระบบ **ตะกร้าสินค้า (Cart)** จริง สามารถเพิ่ม State และฟังก์ชันลงใน `CartContext.jsx` ได้ง่าย ๆ ดังนี้:

```jsx
export const CartProvider = ({ children }) => {
  const [products, setProducts] = useState(productData);
  const [cart, setCart] = useState([]); // 👈 เพิ่ม state ตะกร้า

  // 👈 เพิ่มฟังก์ชันจัดการตะกร้า
  const addToCart = (product) => {
    setCart((prev) => [...prev, product]);
  };

  return (
    // 👈 ส่งออกไปพร้อมกันใน value
    <CartContext.Provider value={{ products, cart, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};
```
เมื่อเพิ่มแล้ว:
- [Navbar.jsx](file:///c:/Users/DoctorDear/Code/JSD13/Group-Project-1/Sprint-2/Zeta-Jersey-Store/src/components/Navbar.jsx) จะสามารถดึง `{ cart }` ไปแสดงจำนวนชิ้นบนไอคอน 🛒 ได้ทันที
- [ProductCard.jsx](file:///c:/Users/DoctorDear/Code/JSD13/Group-Project-1/Sprint-2/Zeta-Jersey-Store/src/components/ProductCard.jsx) จะสามารถดึง `{ addToCart }` ไปสั่งเพิ่มสินค้าได้ทันทีจากทุกที่ในแอป!
