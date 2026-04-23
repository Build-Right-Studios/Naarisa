import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BASE, PRODUCT } from '../../Constants/apiroutes.js';

const ProductPage = () => {
  const { id } = useParams(); 
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        const url = `${BASE.ROUTE}${PRODUCT.GET_SINGLE_PRODUCT(id)}`;
        const response = await fetch(url);
        
        const result = await response.json();

        if (result.success) {
          setData(result); 
        } else {
          console.error("Backend error:", result.message);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!data || !data.product) return <div className="p-10 text-center">Product Not Found</div>;

  const { product, currentVariant } = data;

  return (
    <div className="max-w-6xl mx-auto p-6 flex flex-col md:flex-row gap-10">
      <div className="w-full md:w-1/2 bg-gray-100 rounded-xl aspect-square flex items-center justify-center">
        <p className="text-gray-400 font-medium">Product Image Placeholder</p>
      </div>

      <div className="w-full md:w-1/2 space-y-6">
        <div>
          <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">
            {product.category}
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mt-1">{product.name}</h1>
          <p className="text-2xl font-semibold text-gray-800 mt-2">
            ₹{product.basePrice}
          </p>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="font-semibold text-gray-900">Description</h3>
          <p className="text-gray-600 mt-2 leading-relaxed">{product.description}</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-blue-800 font-semibold">Styling Tips</h3>
          <p className="text-blue-900/70 text-sm mt-1">{product.stylingTips}</p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900">Fabric & Care</h3>
          <p className="text-gray-600 text-sm mt-1">{product.fabricCare}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {product.tags?.map((tag, i) => (
            <span key={i} className="bg-gray-200 px-3 py-1 rounded-full text-xs text-gray-700">
              #{tag}
            </span>
          ))}
        </div>

        <button className="w-full bg-black text-white py-4 rounded-xl font-bold hover:opacity-90 transition shadow-lg">
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductPage;