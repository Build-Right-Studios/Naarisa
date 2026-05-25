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

  // ─────────────────────────────────────────────
  // FETCH DATA
  // ─────────────────────────────────────────────

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

        setFormData({
          name: data.productId?.name || '',
          description: data.productId?.description || '',
          basePrice: data.productId?.basePrice || 0,
          discountedPrice: data.discountPrice || '',
          images: data.images || [],
          sizes: data.sizes || [],
          colorName: data.color?.name || '',
          colorHex: data.color?.hex || '#000000'
        });

      } catch (error) {

        console.error(error);

        alert(
          error.response?.data?.message ||
          "Failed to load variant"
        );

      } finally {

        setFetching(false);

      }
    };

    if (id) {
      fetchVariantData();
    }

  }, [id]);

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────

  const totalImages =
    formData.images.length +
    newImages.length;

  // ─────────────────────────────────────────────
  // INPUT CHANGE
  // ─────────────────────────────────────────────

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // ─────────────────────────────────────────────
  // STOCK CHANGE
  // ─────────────────────────────────────────────

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

  // ─────────────────────────────────────────────
  // IMAGE UPLOAD
  // ─────────────────────────────────────────────

  const handleImageUpload = (e) => {

    const files = Array.from(e.target.files);

    const currentCount =
      formData.images.length +
      newImages.length;

    const totalAfterUpload =
      currentCount + files.length;

    if (totalAfterUpload > 5) {

      alert("Maximum 5 images allowed");

      return;
    }

    setNewImages((prev) => [
      ...prev,
      ...files
    ]);
  };

  // ─────────────────────────────────────────────
  // REMOVE EXISTING IMAGE
  // ─────────────────────────────────────────────

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

  // ─────────────────────────────────────────────
  // REMOVE NEW IMAGE
  // ─────────────────────────────────────────────

  const handleRemoveNewImage = (index) => {

    setNewImages((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // ─────────────────────────────────────────────
  // SAVE
  // ─────────────────────────────────────────────

  const handleSave = async () => {

    try {

      setLoading(true);

      const token = localStorage.getItem("token");

      const payload = new FormData();

      // Discount Price
      payload.append(
        "discountPrice",
        formData.discountedPrice
          ? Number(formData.discountedPrice)
          : ""
      );

      // Sizes
      payload.append(
        "sizes",
        JSON.stringify(formData.sizes)
      );

      // Color
      payload.append(
        "color",
        JSON.stringify({
          name: formData.colorName
            .trim()
            .toLowerCase(),
          hex: formData.colorHex
        })
      );

      // Removed Images
      payload.append(
        "existingImages",
        JSON.stringify(formData.images)
      );

      // New Images
      newImages.forEach((file) => {
        payload.append("images", file);
      });

      const response = await axios.patch(
        `${BASE.ROUTE}${VARIANT.UPDATE(id)}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
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

  // ─────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────

  if (fetching) {

    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // DISCOUNT
  // ─────────────────────────────────────────────

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

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────

  return (

    <div className="min-h-screen bg-[#F8F8F8] p-8">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-8">

        <div>

          <p className="text-xs text-gray-400 uppercase tracking-widest">
            Edit Variant
          </p>

          <h1 className="text-2xl font-bold">
            {formData.name}
          </h1>

        </div>

        <button
          onClick={handleSave}
          disabled={loading || saved}
          className={`px-6 py-3 rounded-xl text-white font-semibold transition-all ${
            saved
              ? "bg-emerald-500"
              : "bg-black"
          }`}
        >
          {
            loading
              ? "Saving..."
              : saved
              ? "Saved!"
              : "Save Changes"
          }
        </button>

      </div>

      <div className="grid grid-cols-3 gap-6">

        {/* LEFT */}

        <div className="col-span-2 space-y-6">

          {/* IMAGES */}

          <div className="bg-white rounded-2xl p-6 border border-gray-100">

            <div className="flex items-center justify-between mb-5">

              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Product Images
              </p>

              <span className="text-xs font-semibold text-gray-500">
                {totalImages} / 5
              </span>

            </div>

            <div className="flex flex-wrap gap-4">

              {/* EXISTING IMAGES */}

              {formData.images.map((img, index) => (

                <div
                  key={index}
                  className="relative w-28 h-36 rounded-xl overflow-hidden border"
                >

                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveExistingImage(img)
                    }
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-500 transition-all"
                  >
                    ✕
                  </button>

                </div>
              ))}

              {/* NEW IMAGES */}

              {newImages.map((file, index) => (

                <div
                  key={index}
                  className="relative w-28 h-36 rounded-xl overflow-hidden border border-emerald-300"
                >

                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="w-full h-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveNewImage(index)
                    }
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-500 transition-all"
                  >
                    ✕
                  </button>

                </div>
              ))}

              {/* UPLOAD */}

              {totalImages < 5 && (

                <label className="w-28 h-36 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-black transition-all">

                  <span className="text-3xl">
                    +
                  </span>

                  <span className="text-xs font-bold uppercase">
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

          {/* SIZES */}

          <div className="bg-white rounded-2xl p-6 border border-gray-100">

            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
              Sizes & Stock
            </p>

            <div className="space-y-3">

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
                    className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-center"
                  />

                </div>
              ))}

            </div>

          </div>

        </div>

        {/* RIGHT */}

        <div className="space-y-6">

          {/* PRICING */}

          <div className="bg-white rounded-2xl p-6 border border-gray-100">

            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">
              Pricing
            </p>

            <div className="space-y-4">

              <div>

                <label className="text-sm font-medium text-gray-500 block mb-2">
                  Base Price
                </label>

                <input
                  value={formData.basePrice}
                  readOnly
                  disabled
                  className="w-full p-3 bg-gray-100 rounded-xl"
                />

              </div>

              <div>

                <label className="text-sm font-medium text-gray-500 block mb-2">
                  Discount Price
                </label>

                <input
                  name="discountedPrice"
                  type="number"
                  value={formData.discountedPrice}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
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