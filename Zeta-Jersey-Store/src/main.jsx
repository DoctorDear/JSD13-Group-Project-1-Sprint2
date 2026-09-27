import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { WishlistProvider } from "./contexts/WishlistProvider.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <WishlistProvider>
          <App />
      </WishlistProvider>
    </AuthProvider>
  </BrowserRouter>,
);
