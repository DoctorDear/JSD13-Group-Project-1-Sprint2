import ProductDetail from "../components/ProductDetail.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

const ProductDetailPage = () => {
  return (
    <div>
      <Navbar page="product-detail" />
      <ProductDetail />
      <Footer />
    </div>
  );
};
export default ProductDetailPage;
