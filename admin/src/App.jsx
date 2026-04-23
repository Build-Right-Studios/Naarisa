import "./App.css";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import AdminLogin from "./Pages/Auth/Login";
import AdminSignup from "./Pages/Auth/Signup";
import ProductTable from "./Pages/Products/Products";
import AddProduct from "./Pages/Products/AddProduct";
import AddVariant from "./Pages/Products/AddVariant";
import Sidebar from "./Pages/Components/Sidebar";
import Orders from "./Pages/Orders/Orders";
import Coupons from "./Pages/Coupons/Coupons";
import Banner from "./Pages/Banner/Banner"
import Dashboard from "./Pages/Dashboard/Dashboard";
import ProductPage from "./Pages/Products/ProductPage";
import Navbar from "./Pages/Components/Navbar";
import EditVariantPage from "./Pages/Products/EditVariantPage";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function AdminLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 w-full min-h-screen bg-gray-100">
        <Navbar />
        <Routes>
          <Route path="/products" element={<ProductTable />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/add-variant" element={<AddVariant />} />
          <Route path="/update-varient/:id" element={<EditVariantPage />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/coupons" element={<Coupons />} />
          <Route path="/banner" element={<Banner />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/signup" element={<AdminSignup />} />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;