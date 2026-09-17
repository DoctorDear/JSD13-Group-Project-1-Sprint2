import { Routes, Route } from "react-router-dom";
import CheckoutPage from "./pages/CheckoutPage";
import CartPage from "./pages/CartPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";

const App = () => {
  return (
    <div>
      <Routes>
        {/* 1. กำหนดให้หน้าแรกสุด (http://localhost:5173/) วิ่งไปที่หน้า Checkout หรือ Cart ของคุณ */}
        <Route path="/" element={<CheckoutPage />} />

        {/* 2. เส้นทางสำหรับหน้าอื่นๆ */}
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
      </Routes>
    </div>
  );
};

export default App;