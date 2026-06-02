import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./Components/Common/Navbar";
import Footer from "./Components/Common/Footer";
import ScrollToTop from "./ScrollToTop";

import Home from "./Pages/Home";
import ProductPage from "./Pages/ProductPage";
import CategoryPage from "./Pages/CategoryPage";
import CartPage from "./Pages/CartPage";
import CheckoutPage from "./Pages/CheckoutPage";
import AuthPage from "./Pages/Authpage";
import AboutPage from "./Pages/AboutPage";
import AccountPage from "./Pages/AccountPage";
import BestSellersPage from "./Pages/BestSellersPage";
import OrderSuccessPage from "./Pages/OrderSuccessPage";


function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      {/* Global Components */}
      <Navbar />

      {/* Routes */}
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/categories/:slug" element={<CategoryPage />} />
        <Route path="/best-sellers" element={<BestSellersPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
      </Routes>
      <Footer />

    </BrowserRouter>
  );
}

export default App;