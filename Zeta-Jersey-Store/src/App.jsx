import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CheckoutPage from "./pages/CheckoutPage";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<LandingPage />} />
        {/* หน้ารายละเอียดสินค้า: :id คือตัวแปร Dynamic */}
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Routes>
    </div>
  );
};
// import CartPage from "./pages/CartPage";
// import OrderConfirmationPage from "./pages/OrderConfirmationPage";
// import ProfileBody from "./pages/ProfileBody";

// <Route path="/profile" element={<ProfileBody />} />
// <Route path="/cart" element={<CartPage />} />
// <Route path="/confirmation" element={<OrderConfirmationPage />} />
export default App;
