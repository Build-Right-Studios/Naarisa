import React, { useState, useEffect } from "react";

const sizesList = ["XS", "S", "M", "L", "XL", "XXL"];

const AddVariant = () => {
  const token = "YOUR_TOKEN_HERE";

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");

  const [sizes, setSizes] = useState(
    sizesList.map((size) => ({
      size,
      enabled: false,
      stock: "",
    }))
  );

  const [color, setColor] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");

  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/product/add-new-variant", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (data.success) {
          setProducts(data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchProducts();
  }, []);

  // HANDLE SIZE TOGGLE
  const toggleSize = (index) => {
    const updated = [...sizes];
    updated[index].enabled = !updated[index].enabled;
    setSizes(updated);
  };

  // HANDLE STOCK CHANGE
  const handleStockChange = (index, value) => {
    const updated = [...sizes];
    updated[index].stock = value;
    setSizes(updated);
  };

  // IMAGE UPLOAD
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages([...images, ...files]);
  };

  // SUBMIT
  const handleSubmit = async () => {
    const selectedSizes = sizes
      .filter((s) => s.enabled)
      .map((s) => ({
        size: s.size,
        stock: Number(s.stock || 0),
      }));

    const payload = {
      productId: selectedProduct,
      sizes: selectedSizes,
      color,
      discountPrice: Number(discountPrice || 0),
    };

    console.log(payload);

    // 👉 connect your API here
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-2">Add New Variant</h1>
      <p className="text-gray-500 mb-6">
        Define visual and stock parameters for product variations.
      </p>

      <div className="grid grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="space-y-6">

          {/* IMAGE UPLOAD */}
          <div className="bg-white p-6 rounded-2xl border">
            <h2 className="font-semibold mb-4">Variant Media</h2>

            <label className="border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center text-gray-400 cursor-pointer">
              <input
                type="file"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <p>Drop images here</p>
              <span className="text-xs">JPG, PNG (Max 5MB)</span>
              <button className="mt-3 px-4 py-1 bg-gray-200 rounded-lg text-sm">
                Browse Files
              </button>
            </label>

            {/* PREVIEW */}
            <div className="flex gap-3 mt-4">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={URL.createObjectURL(img)}
                  alt="preview"
                  className="w-14 h-14 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>

          {/* COLOR + PRICE */}
          <div className="bg-white p-6 rounded-2xl border space-y-4">
            <h2 className="font-semibold">Color Profile</h2>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="e.g. Midnight Purple"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 p-2 border rounded-lg"
              />
              <input
                type="color"
                className="w-12 h-10 border rounded-lg"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">
                Discount Price ($)
              </label>
              <input
                type="number"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                className="w-full mt-1 p-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-span-2 space-y-6">

          {/* PRODUCT SELECT */}
          <div className="bg-white p-6 rounded-2xl border">
            <h2 className="font-semibold mb-4">Product Association</h2>

            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* SIZE STOCK */}
          <div className="bg-white p-6 rounded-2xl border">
            <h2 className="font-semibold mb-4">
              Size & Stock Management
            </h2>

            <div className="grid grid-cols-3 gap-4">
              {sizes.map((item, index) => (
                <div
                  key={item.size}
                  className={`border rounded-xl p-4 ${
                    item.enabled ? "border-purple-500" : ""
                  }`}
                >
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">{item.size}</span>
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={() => toggleSize(index)}
                    />
                  </div>

                  <input
                    type="number"
                    placeholder="Stock Qty"
                    disabled={!item.enabled}
                    value={item.stock}
                    onChange={(e) =>
                      handleStockChange(index, e.target.value)
                    }
                    className="w-full p-2 border rounded-lg text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              All changes are saved as drafts until submission.
            </p>

            <div className="flex gap-3">
              <button className="px-4 py-2 border rounded-lg">
                Discard
              </button>

              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-purple-600 text-white rounded-xl shadow"
              >
                Submit Variant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVariant;
