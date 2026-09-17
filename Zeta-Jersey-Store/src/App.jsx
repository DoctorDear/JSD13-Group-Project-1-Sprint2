import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ProductDetailPage from "./pages/ProductDetailPage";
const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/home" element={<LandingPage />} />
        {/* หน้ารายละเอียดสินค้า: :id คือตัวแปร Dynamic */}
        <Route path="/products/:id" element={<ProductDetailPage />} />
      </Routes>
    </div>
  );
};

export default App;
