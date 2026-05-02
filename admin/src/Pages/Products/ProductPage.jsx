import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BASE, VARIANT } from '../../Constants/apiroutes.js';

const ProductPage = () => {
  const { id } = useParams();
  const [variant, setVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchVariant = async () => {
      if (!id) return;
      try {
        const res = await fetch(`${BASE.ROUTE}${VARIANT.GET_BY_ID(id)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.success) {
          setVariant(result.data);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVariant();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!variant) return <div className="p-10 text-center">Variant Not Found</div>;

  const product = variant.productId;

  return (
    <div className="max-w-6xl mx-auto p-6 flex flex-col md:flex-row gap-10">

      {/* Image */}
      <div className="w-full md:w-1/2 bg-gray-100 rounded-xl aspect-square overflow-hidden">
        {variant.images?.[0] ? (
          <img src={variant.images[0]} alt={product?.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">No Image</p>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="w-full md:w-1/2 space-y-6">
        <div>
          <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">
            {product?.category}
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mt-1">{product?.name}</h1>
          <p className="text-sm text-gray-500 mt-1">Color: {variant.color?.name}</p>
          <p className="text-2xl font-semibold text-gray-800 mt-2">
            ₹{variant.discountPrice || product?.basePrice}
          </p>
        </div>

        {/* Sizes + Stock */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Sizes & Stock</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {variant.sizes?.map((s, i) => (
              <div key={i} style={{
                padding: "6px 14px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontSize: 13,
                background: s.quantity === 0 ? "#f9fafb" : "#fff",
                color: s.quantity === 0 ? "#aaa" : "#111"
              }}>
                {s.size}
                <span style={{ fontSize: 11, color: "#888", marginLeft: 6 }}>
                  ({s.quantity} left)
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="font-semibold text-gray-900">Description</h3>
          <p className="text-gray-600 mt-2 leading-relaxed">{product?.description}</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-blue-800 font-semibold">Styling Tips</h3>
          <p className="text-blue-900/70 text-sm mt-1">{product?.stylingTips}</p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900">Fabric & Care</h3>
          <p className="text-gray-600 text-sm mt-1">{product?.fabricCare}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {product?.tags?.map((tag, i) => (
            <span key={i} className="bg-gray-200 px-3 py-1 rounded-full text-xs text-gray-700">
              #{tag}
            </span>
          ))}
        </div>

        {/* Status */}
        <div style={{
          padding: "8px 16px",
          borderRadius: 8,
          display: "inline-block",
          background: variant.isActive ? "#dcfce7" : "#f3f4f6",
          color: variant.isActive ? "#16a34a" : "#888",
          fontSize: 13,
          fontWeight: 600
        }}>
          {variant.isActive ? "✓ Active" : "Inactive"}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;