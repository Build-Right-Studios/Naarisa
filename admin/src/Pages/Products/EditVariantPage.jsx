import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE, VARIANT } from '../../Constants/apiroutes.js';

const EditVariantPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saved, setSaved] = useState(false);

  const [newImages, setNewImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: 0,
    discountedPrice: '',
    images: [],
    sizes: [],
    colorName: '',
    colorHex: '#000000'
  });

  useEffect(() => {
    const fetchVariantData = async () => {
      try {
        setFetching(true);

        const token = localStorage.getItem("token");

        const response = await axios.get(
          `${BASE.ROUTE}${VARIANT.GET_BY_ID(id)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            withCredentials: true
          }
        );

        const data = response.data.data;

        const colorHexMap = {
          black: "#000000",
          white: "#ffffff",
          green: "#22c55e",
          red: "#ef4444",
          blue: "#3b82f6",
          yellow: "#eab308",
          purple: "#8b5cf6",
          pink: "#ec4899",
          orange: "#f97316",
          gray: "#6b7280"
        };

        setFormData({
          name: data.productId?.name || '',
          description: data.productId?.description || '',
          basePrice: data.productId?.basePrice || 0,
          discountedPrice: data.discountPrice || '',
          images: data.images || [],
          sizes: data.sizes || [],
          colorName: data.color?.name || '',
          colorHex:
            data.color?.hex ||
            colorHexMap[data.color?.name?.toLowerCase()] ||
            "#000000"
        });

      } catch (error) {
        console.error("Error extracting product data:", error);

        alert(
          error.response?.data?.message ||
          "Failed to load product details."
        );

      } finally {
        setFetching(false);
      }
    };

    if (id) fetchVariantData();

  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStockChange = (index, newQty) => {
    setFormData((prev) => {
      const updatedSizes = [...prev.sizes];

      updatedSizes[index] = {
        ...updatedSizes[index],
        quantity: Math.max(0, Number(newQty))
      };

      return {
        ...prev,
        sizes: updatedSizes
      };
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    const totalImages =
      formData.images.length +
      newImages.length +
      files.length;

    if (totalImages > 5) {
      alert("Maximum 5 images allowed");
      return;
    }

    setNewImages((prev) => [...prev, ...files]);
  };

  const handleRemoveExistingImage = (image) => {
    setRemovedImages((prev) => [
      ...prev,
      image.public_id
    ]);

    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter(
        (img) => img.public_id !== image.public_id
      )
    }));
  };

  const handleRemoveNewImage = (index) => {
    setNewImages((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const payload = new FormData();

      payload.append(
        "discountPrice",
        formData.discountedPrice
          ? Number(formData.discountedPrice)
          : ""
      );

      payload.append(
        "sizes",
        JSON.stringify(formData.sizes)
      );

      payload.append(
        "color",
        JSON.stringify({
          name: formData.colorName.trim().toLowerCase(),
          hex: formData.colorHex
        })
      );

      payload.append(
        "removedImages",
        JSON.stringify(removedImages)
      );

      newImages.forEach((file) => {
        payload.append("images", file);
      });

      const response = await axios.patch(
        `${BASE.ROUTE}${VARIANT.UPDATE(id)}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        setSaved(true);

        setTimeout(() => {
          setSaved(false);
          navigate(-1);
        }, 1200);
      }

    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
        "Update failed"
      );

    } finally {
      setLoading(false);
    }
  };

  const discount =
    formData.basePrice &&
    formData.discountedPrice
      ? Math.round(
          (
            (
              formData.basePrice -
              formData.discountedPrice
            ) /
            formData.basePrice
          ) * 100
        )
      : null;

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAFAFA]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[#18181B] animate-spin" />
        </div>

        <p className="mt-5 text-sm font-semibold text-gray-400 tracking-widest uppercase">
          Loading variant...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] font-[Poppins,sans-serif] text-[#18181B]">

      {/* Top Nav */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              ←
            </button>

            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Edit Variant · {id?.slice(-8)}
              </p>

              <h1 className="text-base font-bold leading-tight">
                {formData.name || "—"}
              </h1>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={loading || saved}
            className={`px-7 py-2.5 text-sm font-bold rounded-xl transition-all shadow-sm ${
              saved
                ? 'bg-emerald-500 text-white'
                : 'bg-[#18181B] text-white'
            }`}
          >
            {loading
              ? "Saving..."
              : saved
              ? "Saved!"
              : "Save Changes"}
          </button>

        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-8 py-8">

        <div className="grid grid-cols-3 gap-6">

          {/* LEFT */}
          <div className="col-span-2 space-y-6">

            {/* Images */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

              <div className="flex items-center justify-between mb-5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Product Images
                </p>

                <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                  {formData.images.length + newImages.length} / 5
                </span>
              </div>

              <div className="flex gap-3 flex-wrap">

                {/* Existing Images */}
                {formData.images.map((img, index) => (
                  <div
                    key={index}
                    className="relative w-28 h-36 rounded-xl overflow-hidden border-2 border-gray-100"
                  >
                    <img
                      src={img.url}
                      alt={`Product ${index}`}
                      className="w-full h-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(img)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-500 transition-all"
                    >
                      ✕
                    </button>

                    {index === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-[#18181B] text-white text-[9px] font-bold text-center py-1 tracking-widest uppercase">
                        Cover
                      </div>
                    )}
                  </div>
                ))}

                {/* New Images */}
                {newImages.map((file, index) => (
                  <div
                    key={`new-${index}`}
                    className="relative w-28 h-36 rounded-xl overflow-hidden border-2 border-emerald-200"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt="New Upload"
                      className="w-full h-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(index)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-500 transition-all"
                    >
                      ✕
                    </button>

                    <div className="absolute bottom-0 left-0 right-0 bg-emerald-500 text-white text-[9px] font-bold text-center py-1 tracking-widest uppercase">
                      New
                    </div>
                  </div>
                ))}

                {/* Upload */}
                {formData.images.length + newImages.length < 5 && (
                  <label className="w-28 h-36 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-all gap-2 cursor-pointer">

                    <span className="text-2xl">+</span>

                    <span className="text-[10px] font-bold uppercase tracking-wide">
                      Add
                    </span>

                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}

              </div>
            </div>

            {/* Sizes */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Sizes & Stock
                </p>
              </div>

              <div className="space-y-2">

                {formData.sizes.map((size, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
                  >
                    <span className="font-bold">
                      {size.size}
                    </span>

                    <input
                      type="number"
                      min={0}
                      value={size.quantity}
                      onChange={(e) =>
                        handleStockChange(
                          index,
                          e.target.value
                        )
                      }
                      className="w-20 text-center border border-gray-200 rounded-lg py-2"
                    />
                  </div>
                ))}

              </div>
            </div>

          </div>

          {/* RIGHT */}
          <div className="space-y-6">

            {/* Pricing */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">

              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Pricing
              </p>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">
                  Base Price
                </label>

                <input
                  value={formData.basePrice}
                  readOnly
                  disabled
                  className="w-full p-3.5 bg-gray-50 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">
                  Discount Price
                </label>

                <input
                  name="discountedPrice"
                  type="number"
                  value={formData.discountedPrice}
                  onChange={handleChange}
                  className="w-full p-3.5 bg-gray-50 rounded-xl"
                />
              </div>

              {discount !== null && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                  <span className="text-sm font-bold text-emerald-700">
                    {discount}% OFF
                  </span>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default EditVariantPage;