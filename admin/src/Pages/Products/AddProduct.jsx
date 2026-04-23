import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import { PRODUCT } from "../../Constants/apiroutes.js";

const AddProduct = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    stylingTips: "",
    fabricCare: "",
    category: "",
    basePrice: "",
    tags: "",
  });

  const handleChange = (e) => {
    setError("");

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      const payload = {
        ...formData,
        basePrice: Number(formData.basePrice),
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      const response = await api.post(PRODUCT.ADD_PRODUCT, payload);

      console.log("TOKEN:", localStorage.getItem("token"));


      if (response.data.success) {
        alert("Product Created Successfully ✅");
        navigate("/products");
      } else {
        setError(response.data.message || "Failed to create product");
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Server error while creating product";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Product</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <h2 className="font-semibold mb-4 text-lg">
              General Information
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Product Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
              />

              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg h-28 outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <h2 className="font-semibold mb-4 text-lg">
              Editorial Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <textarea
                name="stylingTips"
                placeholder="Styling Tips"
                value={formData.stylingTips}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg h-32 outline-none focus:ring-2 focus:ring-purple-500"
              />

              <textarea
                name="fabricCare"
                placeholder="Fabric Care"
                value={formData.fabricCare}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg h-32 outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <h2 className="font-semibold mb-4 text-lg">Specifications</h2>

            <div className="space-y-4">
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Category</option>
                <option value="Work">Work</option>
                <option value="College">College</option>
              </select>


              <input
                type="number"
                name="basePrice"
                placeholder="Base Price (₹)"
                value={formData.basePrice}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
              />

              <input
                type="text"
                name="tags"
                placeholder="Tags (comma separated)"
                value={formData.tags}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-600 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center mt-10">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-10 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl shadow-lg hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Publishing..." : "Publish Product →"}
        </button>
      </div>
    </div>
  );
};

export default AddProduct;
