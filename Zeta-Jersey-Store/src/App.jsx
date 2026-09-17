import { Routes, Route } from "react-router-dom";
import ProductDetailPage from "./pages/ProductDetailPage";

const App = () => {
  return (
    <div>
      <Routes>
        {/* หน้ารายละเอียดสินค้า: :id คือตัวแปร Dynamic */}
        <Route path="/products/:id" element={<ProductDetailPage />} />
      </Routes>
    </div>
  );
};

export default App;
