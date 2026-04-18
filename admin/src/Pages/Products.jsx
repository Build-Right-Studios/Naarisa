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

const ProductTable = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const token = "YOUR_TOKEN_HERE";

  // FETCH PRODUCTS
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/product/get-products", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setProducts(data.data);
          setFilteredProducts(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // SEARCH FILTER
  useEffect(() => {
    const filtered = products.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [search, products]);

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      const res = await fetch(`/api/variant/${id}/deactivate`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleNewVarient = () => navigate("/add-variant");
  const handleNewProduct = () => navigate("/add-product");  
  const handleView = (id) => navigate(`/product/${id}`);
  const handleEdit = (id) => navigate(`/edit-product/${id}`);

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>

        <div className="flex gap-3">
          <button onClick={handleNewVarient} className="flex items-center gap-2 border border-purple-500 text-purple-600 px-4 py-2 rounded-xl">
            <Plus size={16} /> Add New Variant
          </button>

          <button onClick={handleNewProduct} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl">
            <Plus size={16} /> New Product
            
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white"
          />
        </div>

        <button className="flex items-center gap-2 text-gray-600">
          All Products <ChevronDown size={16} />
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-4">Products</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Customers</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map((item) => (
              <tr key={item._id} className="border-t hover:bg-gray-50">

                {/* PRODUCT INFO */}
                <td className="px-6 py-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                  <div>
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-xs text-gray-400">
                      {item.category || "No Category"} • SKU: {item._id?.slice(0, 8)}
                    </p>
                  </div>
                </td>

                {/* STATUS */}
                <td className="px-6 py-4">
                  <span className="bg-green-100 text-green-600 text-xs px-3 py-1 rounded-full">
                    ✓ Published
                  </span>
                </td>

                {/* PRICE */}
                <td className="px-6 py-4 font-semibold">
                  ${item.basePrice}
                </td>

                {/* CUSTOMERS*/}
                <td className="px-6 py-4 text-gray-700">
                  {Math.floor(Math.random() * 30000)}
                </td>

                {/* ACTIONS */}
                <td className="px-6 py-4">
                  <div className="flex gap-4 text-gray-600">
                    <Eye
                      className="cursor-pointer hover:text-black"
                      size={18}
                      onClick={() => handleView(item._id)}
                    />
                    <Edit2
                      className="cursor-pointer hover:text-blue-600"
                      size={18}
                      onClick={() => handleEdit(item._id)}
                    />
                    <Trash2
                      className="cursor-pointer hover:text-red-600"
                      size={18}
                      onClick={() => handleDelete(item._id)}
                    />
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
