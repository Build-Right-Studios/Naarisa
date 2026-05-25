import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./Components/Common/Navbar";
import Home from "./Pages/Home";
import ProductPage from "./Pages/ProductPage";
// import Product from "./pages/Product";
// import Cart from "./pages/Cart";
// import Checkout from "./pages/Checkout";
// import About from "./pages/About";
import Footer from "./Components/Common/Footer";


function App() {
  return (
    <BrowserRouter>

      {/* Global Components */}
      <Navbar />

      {/* Routes */}
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        {/* <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/about" element={<About />} /> */}

      </Routes>
      <Footer />

    </BrowserRouter>
  );
}

export default App;