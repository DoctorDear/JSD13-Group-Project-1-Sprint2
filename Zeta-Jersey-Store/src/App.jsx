import { Routes, Route } from "react-router-dom";
import ProductDetail from "./components/ProductDetail";

const App = () => {
  return (
    <div>
      <Routes>
        {/* หน้ารายละเอียดสินค้า: :id คือตัวแปร Dynamic */}
        <Route path="/products/:id" element={<ProductDetail />} />
      </Routes>
    </div>
  );
};

export default App;
