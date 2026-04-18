import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";

import AdminLogin from "./Pages/Login";
import AdminSignup from "./Pages/Signup";
import ProductTable from "./Pages/Products";
import AddProduct from "./Pages/AddProduct";
import AddVariant from "./Pages/AddVariant";
import Sidebar from "./Pages/Sidebar";
import Orders from "./Pages/Orders";
import Coupons from "./Pages/Coupons";
import Banner from "./Pages/Banner";
import Dashboard from "./Pages/Dashboard";

function AdminLayout() {
  return (
    <div className="flex">
      <Sidebar />

      <div className="ml-64 w-full min-h-screen bg-gray-100 p-6">
        <Routes>
          <Route path="/products" element={<ProductTable />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/add-variant" element={<AddVariant />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/coupons" element={<Coupons />} />
          <Route path="/banner" element={<Banner />} />
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

      <Route path="/*" element={<AdminLayout />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
