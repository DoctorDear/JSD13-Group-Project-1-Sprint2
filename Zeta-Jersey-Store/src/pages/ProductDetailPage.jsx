import ProductDetail from "../components/ProductDetail.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

const ProductDetailPage = () => {
  return (
    <div>
      {/* ส่งค่า cartCount ไปแสดงที่ Navbar */}
      <Navbar page="product-detail" />

      {/* ส่งฟังก์ชัน handleAddToCart ไปให้ปุ่มใน ProductDetail */}
      <ProductDetail />

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
