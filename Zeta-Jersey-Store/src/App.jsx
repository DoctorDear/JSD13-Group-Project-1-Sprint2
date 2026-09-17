import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PromoBar from "./components/PromoBar";

import ProductDetail from "./components/ProductDetail";
import Suggestion from "./components/Suggestion";

const App = () => {
  return (
    <div>
      <Navbar page="home" />
      <PromoBar />
      <ProductDetail />
      <Suggestion />
      {/* <LeagueCard />
      <Collections /> */}
      <Footer />
    </div>
  );
};

export default App;
