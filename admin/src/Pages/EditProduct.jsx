import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:5000";

export default function EditVariant() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ✅ FETCH VARIANT
  useEffect(() => {
    const fetchVariant = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/variant/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.message);

        const v = data.data;

        setForm({
          // 🔒 PRODUCT (READ ONLY)
          name: v.productId?.name || "—",
          category: v.productId?.category || "—",
          description: v.productId?.description || "—",

          // ✏️ VARIANT
          basePrice: v.basePrice || "",
          discountPrice: v.discountPrice || "",
          stock: v.stock || 0,
          size: v.size || "",
          color: v.color?.name || "",
          isActive: v.isActive ?? true,
        });

        setImages((v.images || []).map((url) => ({ url, isNew: false })));

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVariant();
  }, [id]);

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  // ✅ IMAGE HANDLING
  const addImages = (files) => {
    const valid = Array.from(files).filter((f) => f.size <= 5 * 1024 * 1024);

    const newImgs = valid.map((file) => ({
      url: URL.createObjectURL(file),
      file,
      isNew: true,
    }));

    setImages((prev) => [...prev, ...newImgs].slice(0, 4));
  };

  const removeImage = (i) => {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  };

  // ✅ SAVE (PATCH)
  const handleSave = async () => {
    setError("");
    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("basePrice", Number(form.basePrice));
      formData.append("discountPrice", Number(form.discountPrice));
      formData.append("stock", Number(form.stock));
      formData.append("size", form.size);
      formData.append("color[name]", form.color);
      formData.append("isActive", form.isActive);

      images.forEach((img) => {
        if (img.isNew) formData.append("images", img.file);
      });

      const res = await fetch(`${BASE_URL}/api/variant/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      alert("✅ Variant updated");
      navigate("/products");

    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={S.loader}>Loading...</div>;
  if (!form) return <p style={{ color: "red" }}>Variant not found</p>;

  return (
    <div style={S.page}>

      {/* HEADER */}
      <div style={S.header}>
        <div>
          <h1 style={S.title}>{form.name}</h1>
          <p style={S.subtitle}>Manage variant inventory & pricing</p>
        </div>

        <button
          style={{ ...S.saveBtn, opacity: submitting ? 0.6 : 1 }}
          onClick={handleSave}
        >
          {submitting ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {error && <p style={S.error}>{error}</p>}

      <div style={S.grid}>

        {/* LEFT */}
        <div style={S.col}>

          {/* IMAGES */}
          <div style={S.card}>
            <h3 style={S.section}>PRODUCT IMAGES</h3>

            <div style={S.imageGrid}>
              {images.map((img, i) => (
                <div key={i} style={S.imgBox}>
                  <img src={img.url} style={S.img} />
                  <button style={S.remove} onClick={() => removeImage(i)}>✕</button>
                </div>
              ))}

              {images.length < 4 && (
                <div style={S.addBox} onClick={() => fileRef.current.click()}>
                  +
                  <input
                    ref={fileRef}
                    type="file"
                    hidden
                    multiple
                    onChange={(e) => addImages(e.target.files)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* PRODUCT INFO */}
          <div style={S.card}>
            <h3 style={S.section}>GENERAL INFORMATION</h3>

            <input style={S.input} value={form.name} disabled />
            <input style={S.input} value={form.category} disabled />
            <textarea style={S.textarea} value={form.description} disabled />
          </div>
        </div>

        {/* RIGHT */}
        <div style={S.col}>

          {/* VARIANT */}
          <div style={S.card}>
            <h3 style={S.section}>VARIANT DETAILS</h3>

            <label style={S.label}>Base Price</label>
            <input type="number" style={S.input} value={form.basePrice} onChange={set("basePrice")} />

            <label style={S.label}>Discount Price</label>
            <input type="number" style={S.input} value={form.discountPrice} onChange={set("discountPrice")} />

            <label style={S.label}>Stock</label>
            <input type="number" style={S.input} value={form.stock} onChange={set("stock")} />

            <label style={S.label}>Size</label>
            <input style={S.input} value={form.size} onChange={set("size")} />

            <label style={S.label}>Color</label>
            <input style={S.input} value={form.color} onChange={set("color")} />
          </div>

          {/* STATUS */}
          <div style={S.card}>
            <h3 style={S.section}>STATUS</h3>

            <select
              style={S.input}
              value={form.isActive ? "active" : "inactive"}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  isActive: e.target.value === "active",
                }))
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

        </div>

      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const S = {
  page: {
    background: "#f5f5f7",
    minHeight: "100vh",
    padding: "30px 40px",
    fontFamily: "Segoe UI",
  },
  loader: {
    display: "flex",
    justifyContent: "center",
    padding: 50,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    margin: 0,
  },
  subtitle: {
    color: "#666",
    marginTop: 5,
  },
  saveBtn: {
    background: "#7c3aed",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 300px",
    gap: 20,
  },
  col: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },
  section: {
    fontSize: 12,
    fontWeight: 700,
    color: "#888",
    marginBottom: 15,
  },
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    marginBottom: 12,
    background: "#f9fafb",
  },
  textarea: {
    width: "100%",
    minHeight: 100,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
  },
  label: {
    fontSize: 12,
    marginBottom: 5,
    color: "#555",
  },
  imageGrid: {
    display: "flex",
    gap: 10,
  },
  imgBox: {
    width: 100,
    height: 120,
    position: "relative",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: 8,
  },
  remove: {
    position: "absolute",
    top: 5,
    right: 5,
    background: "black",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
  },
  addBox: {
    width: 100,
    height: 120,
    border: "2px dashed #ccc",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: 24,
    color: "#aaa",
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
};