import ProductDetail from "../../components/catalog/ProductDetail.jsx";
import Navbar from "../../components/layout/Navbar.jsx";
import Footer from "../../components/layout/Footer.jsx";

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
