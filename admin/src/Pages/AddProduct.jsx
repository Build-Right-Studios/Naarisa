import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
  const navigate = useNavigate();
  const token = "YOUR_TOKEN_HERE";

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    stylingTips: "",
    fabricCare: "",
    category: "",
    basePrice: "",
    tags: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/product/add-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          basePrice: Number(formData.basePrice),
          tags: formData.tags.split(",").map((tag) => tag.trim()),
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Product Created Successfully ✅");
        navigate("/");
      } else {
        alert("Something went wrong");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">

      <h1 className="text-3xl font-bold mb-6">Create New Product</h1>

      <div className="grid grid-cols-3 gap-6">

        <div className="col-span-2 space-y-6">

          <div className="bg-white p-6 rounded-2xl border">
            <h2 className="font-semibold mb-4">General Information</h2>

            <div className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Product Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              />

              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg h-20"
              />
            </div>
          </div>


        </div>

        <div className="space-y-6">

          <div className="bg-white p-6 rounded-2xl border">
            <h2 className="font-semibold mb-4">Specifications</h2>

            <div className="space-y-4">

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              >
                <option value="">Select Category</option>
                <option value="Work">Work</option>
                <option value="Casual">Casual</option>
                <option value="Party">Party</option>
              </select>

              <input
                type="number"
                name="basePrice"
                placeholder="Base Price (₹)"
                value={formData.basePrice}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              />

            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 my-4 rounded-2xl border">
        <h2 className="font-semibold mb-4">Editorial Details</h2>

        <div className="grid grid-cols-2 gap-4">
          <textarea
            name="stylingTips"
            placeholder="Styling Tips"
            value={formData.stylingTips}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg h-32"
          />

          <textarea
            name="fabricCare"
            placeholder="Fabric Care"
            value={formData.fabricCare}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg h-32"
          />
        </div>
      </div>

      <div className="flex justify-center mt-10">
        <button
          onClick={handleSubmit}
          className="px-10 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl shadow-lg hover:opacity-90"
        >
          Publish Product →
        </button>
      </div>
    </div>
  );
};

export default AddProduct;
