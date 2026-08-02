import "./App.css";
import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./Pages/Auth/Login";
import AdminSignup from "./Pages/Auth/Signup";
import ProductTable from "./Pages/Products/Products";
import AddProduct from "./Pages/Products/AddProduct";
import AddVariant from "./Pages/Products/AddVariant";
import Sidebar from "./Pages/Components/Sidebar";
import Orders from "./Pages/Orders/Orders";
import OrderDetail from "./Pages/Orders/OrderDetail";
import Coupons from "./Pages/Coupons/Coupons";
import Banner from "./Pages/Banner/Banner";
import Dashboard from "./Pages/Dashboard/Dashboard";
import ProductPage from "./Pages/Products/ProductPage";
import Navbar from "./Pages/Components/Navbar";
import EditVariantPage from "./Pages/Products/EditVariantPage";
import Customers from "./Pages/Customers/Customers";
import CustomerDetail from "./Pages/Customers/CustomerDetail";
import api from "./services/api";
import { AUTH } from "./Constants/apiroutes.js";

const ProtectedRoute = ({ children, authStatus }) => {
  if (authStatus === "checking") {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }
  if (authStatus === "invalid") {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function AdminLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="lg:ml-64 w-full min-h-screen bg-gray-100">
        <Navbar />
        <Routes>
          <Route path="/products" element={<ProductTable />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="/add-variant" element={<AddVariant />} />
          <Route path="/update-varient/:id" element={<EditVariantPage />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/coupons" element={<Coupons />} />
          <Route path="/banner" element={<Banner />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  const [authStatus, setAuthStatus] = useState("checking"); // checking | valid | invalid

  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setAuthStatus("invalid");
        return;
      }
      try {
        const res = await api.get(AUTH.VERIFY);
        setAuthStatus(res.data.success ? "valid" : "invalid");
      } catch {
        localStorage.removeItem("token");
        setAuthStatus("invalid");
      }
    };
    verify();
  }, []);

  return (
    <Routes>
      <Route
        path="/login"
        element={<AdminLogin onLoginSuccess={() => setAuthStatus("valid")} />}
      />

      <Route
        path="/*"
        element={
          <ProtectedRoute authStatus={authStatus}>
            <AdminLayout />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;