import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit2,
  Eye,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import { PRODUCT, VARIANT } from "../Constants/apiroutes.js";

const ProductTable = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState("");
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(PRODUCT.GET_PRODUCTS);

      if (response.data.success) {
        setProducts(response.data.data || []);
        setFilteredProducts(response.data.data || []);
      } else {
        setError("Unable to fetch products");
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load products";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter((item) =>
      item.name?.toLowerCase().includes(search.toLowerCase())
    );

    setFilteredProducts(filtered);
  }, [search, products]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to deactivate this product?"
    );

    if (!confirmDelete) return;

    try {
      setDeleteLoading(id);

      const response = await api.patch(VARIANT.DEACTIVATE(id));

      if (response.data.success) {
        setProducts((prev) => prev.filter((item) => item._id !== id));
      } else {
        alert("Failed to delete product");
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          error.message ||
          "Delete request failed"
      );
    } finally {
      setDeleteLoading("");
    }
  };

  const handleNewVariant = () => navigate("/add-variant");

  const handleNewProduct = () => navigate("/add-product");

  const handleView = (id) => navigate(`/product/${id}`);

  const handleEdit = (id) => navigate(`/update-varient/${id}`);

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500 text-lg">
        Loading Products...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>

        <div className="flex gap-3">
          <button
            onClick={handleNewVariant}
            className="flex items-center gap-2 border border-purple-500 text-purple-600 px-4 py-2 rounded-xl hover:bg-purple-50"
          >
            <Plus size={16} />
            Add New Variant
          </button>

          <button
            onClick={handleNewProduct}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700"
          >
            <Plus size={16} />
            New Product
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        <button className="flex items-center gap-2 text-gray-600">
          All Products <ChevronDown size={16} />
        </button>
      </div>

      {error && (
        <div className="mb-5 bg-red-100 border border-red-300 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-4">Products</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((item) => (
                <tr
                  key={item._id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                      {item.images?.[0] && (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold">{item.name}</h4>

                      <p className="text-xs text-gray-400">
                        {item.category || "No Category"} • SKU:
                        {item._id?.slice(0, 8)}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="bg-green-100 text-green-600 text-xs px-3 py-1 rounded-full">
                      ✓ Published
                    </span>
                  </td>

                  <td className="px-6 py-4 font-semibold">
                    ₹{item.basePrice || 0}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex gap-4 text-gray-600">
                      <Eye
                        size={18}
                        className="cursor-pointer hover:text-black"
                        onClick={() => handleView(item._id)}
                      />

                      <Edit2
                        size={18}
                        className="cursor-pointer hover:text-blue-600"
                        onClick={() => handleEdit(item._id)}
                      />

                      <Trash2
                        size={18}
                        className={`cursor-pointer hover:text-red-600 ${
                          deleteLoading === item._id
                            ? "opacity-50 pointer-events-none"
                            : ""
                        }`}
                        onClick={() => handleDelete(item._id)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-10 text-gray-400 text-lg"
                >
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
