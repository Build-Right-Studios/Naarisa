import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import { PRODUCT } from "../../Constants/apiroutes.js";

const sizesList = ["XS", "S", "M", "L", "XL", "XXL"];

const AddVariant = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedProduct, setSelectedProduct] = useState("");
  const [color, setColor] = useState("");
  const [colorCode, setColorCode] = useState("#7c3aed");
  const [discountPrice, setDiscountPrice] = useState("");
  const [images, setImages] = useState([]);

  const [sizes, setSizes] = useState(
    sizesList.map((size) => ({
      size,
      enabled: false,
      stock: "",
    }))
  );

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);

      const response = await api.get(PRODUCT.GET_PRODUCTS);

      if (response.data.success) {
        setProducts(response.data.data || []);
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load products"
      );
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleSize = (index) => {
    const updated = [...sizes];
    updated[index].enabled = !updated[index].enabled;
    setSizes(updated);
  };

  const handleStockChange = (index, value) => {
    const updated = [...sizes];
    updated[index].stock = value;
    setSizes(updated);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);
      setError("");

      const selectedSizes = sizes
        .filter((item) => item.enabled)
        .map((item) => ({
          size: item.size,
          stock: Number(item.stock || 0),
        }));

      const payload = {
        productId: selectedProduct,
        sizes: selectedSizes,
        color,
        colorCode,
        discountPrice: Number(discountPrice || 0),
      };

      const response = await api.post(
        PRODUCT.ADD_NEW_VARIANT,
        payload
      );

      if (response.data.success) {
        alert("Variant Added Successfully ✅");
        navigate("/products");
      } else {
        setError(response.data.message || "Failed to add variant");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-2">Add New Variant</h1>

      <p className="text-gray-500 mb-6">
        Define stock, size, price, and visual settings.
      </p>

      {error && (
        <div className="mb-5 bg-red-100 border border-red-300 text-red-600 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border">
            <h2 className="font-semibold mb-4">Variant Media</h2>

            <label className="border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-purple-400">
              <input
                type="file"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />

              <p>Drop images here</p>
              <span className="text-xs">JPG / PNG</span>

              <button
                type="button"
                className="mt-3 px-4 py-1 bg-gray-200 rounded-lg text-sm"
              >
                Browse Files
              </button>
            </label>

            <div className="flex gap-3 mt-4 flex-wrap">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={URL.createObjectURL(img)}
                  alt="preview"
                  className="w-14 h-14 rounded-lg object-cover"
                />
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border space-y-4">
            <h2 className="font-semibold">Color Profile</h2>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Midnight Purple"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 p-3 border rounded-lg"
              />

              <input
                type="color"
                value={colorCode}
                onChange={(e) => setColorCode(e.target.value)}
                className="w-14 h-12 border rounded-lg"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">
                Discount Price (₹)
              </label>

              <input
                type="number"
                value={discountPrice}
                onChange={(e) =>
                  setDiscountPrice(e.target.value)
                }
                className="w-full mt-2 p-3 border rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border">
            <h2 className="font-semibold mb-4">
              Product Association
            </h2>

            <select
              value={selectedProduct}
              onChange={(e) =>
                setSelectedProduct(e.target.value)
              }
              className="w-full p-3 border rounded-lg"
            >
              <option value="">
                {loadingProducts
                  ? "Loading Products..."
                  : "Select Product"}
              </option>

              {products.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white p-6 rounded-2xl border">
            <h2 className="font-semibold mb-4">
              Size & Stock Management
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {sizes.map((item, index) => (
                <div
                  key={item.size}
                  className={`border rounded-xl p-4 ${
                    item.enabled
                      ? "border-purple-500 bg-purple-50"
                      : ""
                  }`}
                >
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">
                      {item.size}
                    </span>

                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={() => toggleSize(index)}
                    />
                  </div>

                  <input
                    type="number"
                    disabled={!item.enabled}
                    placeholder="Stock Qty"
                    value={item.stock}
                    onChange={(e) =>
                      handleStockChange(
                        index,
                        e.target.value
                      )
                    }
                    className="w-full p-2 border rounded-lg text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Draft remains unsaved until submission.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/products")}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={submitLoading}
                className="px-6 py-2 bg-purple-600 text-white rounded-xl shadow disabled:opacity-50"
              >
                {submitLoading
                  ? "Submitting..."
                  : "Submit Variant"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVariant;
