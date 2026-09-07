import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PromoBar from "./components/PromoBar";
import LeagueCard from "./components/LeagueCard";
import Collections from "./components/Collections";

const App = () => {
  return (
    <div>
      <Navbar page="home" />
      <Navbar page="other" />

      <div>
        <PromoBar />
      </div>

      <LeagueCard />
      <Collections />

      <div>
        <Footer />
import ProductDetail from "./components/ProductDetail";
import Suggestion from "./components/Suggestion";
const App = () => {
  return (
    <div>
      <div>
        <ProductDetail />
        <Suggestion />
      </div>
    </div>
  );
};

export default App;
