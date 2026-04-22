import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE } from '../Constants/apiroutes.js';

const EditVariantPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true); 

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: 0,
    discountedPrice: '',
    images: [],
    sizes: [],
    colorName: ''
  });

  useEffect(() => {
    const fetchVariantData = async () => {
      try {
        setFetching(true);
        const response = await axios.get(`${BASE.ROUTE}/api/variant/${id}`);
        
        const data = response.data;
        setFormData({
          name: data.name || '',
          description: data.description || '',
          basePrice: data.price || 0,
          discountedPrice: data.discountPrice || '',
          images: data.images || [],
          sizes: data.sizes || [],
          colorName: data.color?.name || ''
        });
      } catch (error) {
        console.error("Error extracting product data:", error);
        alert("Failed to load product details.");
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

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.basePrice),
        discountPrice: formData.discountedPrice ? Number(formData.discountedPrice) : null,
        images: formData.images,
        sizes: formData.sizes,
        color: {
          name: formData.colorName.trim().toLowerCase() 
        }
      };

      const response = await axios.patch(`${BASE.ROUTE}/api/variant/${id}`, payload);

      if (response.status === 200) {
        alert("Product Updated Successfully!");
        navigate(-1); 
      }
    } catch (error) {
      alert(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        <p className="ml-4 font-bold text-gray-500">Extracting Product Data...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F3F4F6] font-sans text-[#1F2937]">
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Variant ID: {id}</p>
            <h2 className="text-3xl font-extrabold">{formData.name || "Loading..."}</h2>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate(-1)} className="px-4 py-2 font-semibold text-gray-500">Cancel</button>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="bg-[#7C3AED] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-purple-200 active:scale-95 transition-all"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-4">Product Images ({formData.images.length})</p>
              <div className="flex gap-4">
                {formData.images.map((img, index) => (
                  <div key={index} className="w-32 h-40 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                    <img src={img} alt="Product" className="w-full h-full object-cover" />
                  </div>
                ))}
                {formData.images.length < 4 && (
                  <button className="w-32 h-40 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 font-bold text-[10px]">
                    + ADD IMAGE
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase">General Information</p>
              <div>
                <label className="text-xs font-semibold text-gray-600">Product Name</label>
                <input 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full mt-1 p-3 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-purple-100"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Description</label>
                <textarea 
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full mt-1 p-3 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-purple-100"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Specifications</p>
              <div>
                <label className="text-xs font-semibold text-gray-600">Base Price (INR)</label>
                <input 
                  name="basePrice"
                  type="number"
                  value={formData.basePrice}
                  onChange={handleChange}
                  className="w-full mt-1 p-3 bg-gray-50 rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Color Name</label>
                <input 
                  name="colorName"
                  value={formData.colorName}
                  onChange={handleChange}
                  className="w-full mt-1 p-3 bg-gray-50 rounded-lg"
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                <span className="text-xs font-bold flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" /> Active on Storefront
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditVariantPage;