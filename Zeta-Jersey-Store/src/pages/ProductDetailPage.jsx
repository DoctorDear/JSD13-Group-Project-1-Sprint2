import { useState, useEffect } from "react";
import ProductDetail from "../components/ProductDetail.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

const ProductDetailPage = () => {
  const [cartCount, setCartCount] = useState(0);

  // โหลดจำนวนสินค้าสะสมจาก localStorage มาแสดงที่ Navbar ตั้งแต่แรก
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cartItems")) || [];
    const total = savedCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    setCartCount(total);
  }, []);

  // ฟังก์ชันสำหรับเพิ่มสินค้าลงในตะกร้าและบันทึกลง localStorage (รับข้อมูลมาจาก ProductDetail)
  const handleAddToCart = (product, selectedSize = "Standard", quantity = 1) => {
    // 🔍 ปริ้นช์ค่าดูใน Console (กด F12 -> Console เพื่อดูว่าได้ค่าอะไร)
    console.log("Current Product Object:", product);
    console.log("Selected Size:", selectedSize);

    // ถ้า product เป็นค่าว่าง ให้ดึงข้อมูลสินค้าจาก state หลักของหน้าแทนโดยตรง (เผื่อปุ่มส่งค่ามาไม่ครบ)
    const activeProduct = product || window.currentProductState;

    if (!activeProduct) {
      alert("ไม่พบข้อมูลสินค้า กรุณาลองใหม่อีกครั้ง");
      return;
    }

    const currentProductId = activeProduct.id || activeProduct._id || activeProduct.name || "unknown-id";

    const rawCart = JSON.parse(localStorage.getItem("cartItems")) || [];
    const existingCart = Array.isArray(rawCart) ? rawCart.filter(item => item && typeof item === 'object') : [];

    const itemIndex = existingCart.findIndex(
      (item) => (item.id === currentProductId || item.name === activeProduct.name) && item.size === selectedSize
    );

    if (itemIndex > -1) {
      existingCart[itemIndex].quantity = (existingCart[itemIndex].quantity || 1) + quantity;
    } else {
      existingCart.push({
        id: currentProductId,
        name: activeProduct.name || "Argentina Anniversary Jersey",
        price: activeProduct.price || 2200,
        image: activeProduct.images?.[0] || activeProduct.image || "",
        size: selectedSize,
        quantity: quantity,
        edition: activeProduct.edition || "",
      });
    }

    localStorage.setItem("cartItems", JSON.stringify(existingCart));

    const newTotalCount = existingCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    setCartCount(newTotalCount);

    alert("Added to cart successfully!");
  };

  return (
    <div>
      {/* ส่งค่า cartCount ไปแสดงที่ Navbar */}
      <Navbar page="product-detail" cartCount={cartCount} />

      {/* ส่งฟังก์ชัน handleAddToCart ไปให้ปุ่มใน ProductDetail */}
      <ProductDetail onAddToCart={handleAddToCart} />

      <Footer />
    </div>
  );
};

export default ProductDetailPage;