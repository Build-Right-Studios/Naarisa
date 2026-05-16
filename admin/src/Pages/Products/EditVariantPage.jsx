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
          { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
        );
        const data = response.data.data;

        const colorHexMap = {
          black: "#000000", white: "#ffffff", green: "#22c55e",
          red: "#ef4444", blue: "#3b82f6", yellow: "#eab308",
          purple: "#8b5cf6", pink: "#ec4899", orange: "#f97316", gray: "#6b7280"
        };

        setFormData({
          name: data.productId?.name || '',
          description: data.productId?.description || '',
          basePrice: data.productId?.basePrice || 0,
          discountedPrice: data.discountPrice || '',
          images: data.images || [],
          sizes: data.sizes || [],
          colorName: data.color?.name || '',
          colorHex: data.color?.hex || colorHexMap[data.color?.name?.toLowerCase()] || "#000000"
        });
      } catch (error) {
        console.error("Error extracting product data:", error);
        alert(error.response?.data?.message || "Failed to load product details.");
      } finally {
        setFetching(false);
      }
    };

    if (id) fetchVariantData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStockChange = (index, newQty) => {
    setFormData(prev => {
      const updatedSizes = [...prev.sizes];
      updatedSizes[index] = { ...updatedSizes[index], quantity: Math.max(0, Number(newQty)) };
      return { ...prev, sizes: updatedSizes };
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.basePrice),
        discountPrice: formData.discountedPrice ? Number(formData.discountedPrice) : null,
        sizes: formData.sizes,
        color: { name: formData.colorName.trim().toLowerCase(), hex: formData.colorHex }
      };

      const response = await axios.patch(
        `${BASE.ROUTE}${VARIANT.UPDATE(id)}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );

      if (response.data.success) {
        setSaved(true);
        setTimeout(() => { setSaved(false); navigate(-1); }, 1200);
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const discount = formData.basePrice && formData.discountedPrice
    ? Math.round(((formData.basePrice - formData.discountedPrice) / formData.basePrice) * 100)
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

      {/* Top Nav Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Edit Variant · {id?.slice(-8)}
              </p>
              <h1 className="text-base font-bold leading-tight">{formData.name || "—"}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-800 rounded-xl hover:bg-gray-100 transition-all"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={loading || saved}
              className={`px-7 py-2.5 text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 ${
                saved
                  ? 'bg-emerald-500 text-white scale-95'
                  : 'bg-[#18181B] text-white hover:bg-[#2d2d2d] active:scale-95'
              }`}
            >
              {saved ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Saved!
                </>
              ) : loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-3 gap-6">

          {/* LEFT — 2/3 width */}
          <div className="col-span-2 space-y-6">

            {/* Images */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Product Images
                </p>
                <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                  {formData.images.length} / 5
                </span>
              </div>

              <div className="flex gap-3 flex-wrap">
                {formData.images.map((img, index) => (
                  <div
                    key={index}
                    className={`relative w-28 h-36 rounded-xl overflow-hidden border-2 transition-all ${
                      index === 0 ? 'border-[#18181B]' : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <img src={img.url} alt={`Product ${index}`} className="w-full h-full object-cover" />
                    {index === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-[#18181B] text-white text-[9px] font-bold text-center py-1 tracking-widest uppercase">
                        Cover
                      </div>
                    )}
                  </div>
                ))}

                {formData.images.length < 5 && (
                  <button className="w-28 h-36 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-all gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span className="text-[10px] font-bold uppercase tracking-wide">Add</span>
                  </button>
                )}
              </div>
            </div>

            {/* General Information */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                General Information
              </p>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">
                  Product Name
                  <span className="ml-2 text-[10px] font-medium text-gray-300 normal-case">Read only</span>
                </label>
                <input
                  name="name"
                  value={formData.name}
                  readOnly
                  disabled
                  className="w-full p-3.5 bg-gray-50 rounded-xl text-sm font-medium text-gray-500 cursor-not-allowed border border-transparent"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">
                  Description
                  <span className="ml-2 text-[10px] font-medium text-gray-300 normal-case">Read only</span>
                </label>
                <textarea
                  name="description"
                  rows="5"
                  value={formData.description}
                  readOnly
                  disabled
                  className="w-full p-3.5 bg-gray-50 rounded-xl text-sm text-gray-500 cursor-not-allowed border border-transparent resize-none leading-relaxed"
                />
              </div>
            </div>

          </div>

          {/* RIGHT — 1/3 width */}
          <div className="space-y-6">

            {/* Pricing */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pricing</p>
                {discount !== null && (
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 rounded-full">
                    {discount}% OFF
                  </span>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Base Price (₹)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                  <input
                    name="basePrice"
                    type="number"
                    readOnly
                    disabled
                    value={formData.basePrice}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-3.5 bg-gray-50 rounded-xl cursor-not-allowed text-sm font-bold border border-transparent focus:border-gray-300 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Discounted Price (₹)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                  <input
                    name="discountedPrice"
                    type="number"
                    value={formData.discountedPrice}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-3.5 bg-gray-50 rounded-xl text-sm font-bold border border-transparent focus:border-gray-300 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              {formData.basePrice && formData.discountedPrice && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-xs font-semibold text-emerald-700">Customer saves</span>
                  <span className="text-sm font-bold text-emerald-700">
                    ₹{(formData.basePrice - formData.discountedPrice).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Color Profile — Read Only */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Color Profile</p>
                <span className="text-[10px] font-semibold text-gray-300 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full uppercase tracking-wide">
                  Read only
                </span>
              </div>

              {/* Color name + swatch in one row */}
              <div className="flex items-center gap-3">
                <input
                  value={formData.colorName}
                  readOnly
                  disabled
                  placeholder="e.g. Midnight Purple"
                  className="flex-1 p-3.5 bg-gray-50 rounded-xl text-sm font-medium text-gray-500 cursor-not-allowed border border-transparent"
                />
                {/* Colour swatch — visible only, no picker */}
                <div
                  className="w-11 h-11 rounded-[10px] border-2 border-gray-200 flex-shrink-0"
                  style={{ backgroundColor: formData.colorHex }}
                  title={formData.colorHex}
                />
              </div>

              {/* Hex value display */}
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                <div
                  className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: formData.colorHex }}
                />
                <span className="text-xs font-mono text-gray-500">{formData.colorHex}</span>
              </div>
            </div>

            {/* Sizes & Stock — Editable */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sizes & Stock</p>
                <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                  {formData.sizes.length} sizes
                </span>
              </div>

              <div className="space-y-2">
                {formData.sizes.map((size, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-transparent hover:border-gray-200 transition-all"
                  >
                    {/* Size label */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold w-4">{size.size}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        size.quantity === 0
                          ? 'bg-red-50 text-red-500 border border-red-100'
                          : size.quantity < 5
                          ? 'bg-amber-50 text-amber-600 border border-amber-100'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}>
                        {size.quantity === 0 ? 'Out of stock' : size.quantity < 5 ? 'Low stock' : 'In stock'}
                      </span>
                    </div>

                    {/* Quantity stepper */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStockChange(index, size.quantity - 1)}
                        disabled={size.quantity === 0}
                        className="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold text-base leading-none"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={0}
                        value={size.quantity}
                        onChange={(e) => handleStockChange(index, e.target.value)}
                        className="w-10 text-center text-sm font-bold bg-white border border-gray-200 rounded-lg py-1.5 outline-none focus:border-gray-400 transition-all"
                      />
                      <button
                        onClick={() => handleStockChange(index, size.quantity + 1)}
                        className="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all font-bold text-base leading-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}

                {formData.sizes.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No sizes added</p>
                )}
              </div>

              {/* Total stock summary */}
              {formData.sizes.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-400">Total stock</span>
                  <span className="text-sm font-bold">
                    {formData.sizes.reduce((sum, s) => sum + s.quantity, 0)} units
                  </span>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Status</p>
              <div className="flex items-center justify-between px-4 py-3.5 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-sm font-semibold text-emerald-700">Active on Storefront</span>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default EditVariantPage;