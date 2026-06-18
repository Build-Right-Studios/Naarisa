import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE, VARIANT } from '../../Constants/apiroutes.js';

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

// ─── Rich Text Editor ─────────────────────────────────────────────────────────
function RichTextarea({ value, onChange, placeholder }) {
  const editorRef = useRef(null);
  const isInternalChange = useRef(false);
  const [activeFormats, setActiveFormats] = useState({
    bold: false, italic: false, underline: false, bullets: false,
  });

  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const syncContent = () => {
    isInternalChange.current = true;
    onChange(editorRef.current?.innerHTML || "");
    updateActiveFormats();
  };

  const updateActiveFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      bullets: document.queryCommandState("insertUnorderedList"),
    });
  };

  const exec = (cmd) => {
    editorRef.current?.focus();
    if (cmd === "bullets") {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const li = (container.nodeType === 3 ? container.parentNode : container).closest?.("li");
      if (li) {
        const ul = li.closest("ul");
        if (ul) {
          const fragment = document.createDocumentFragment();
          ul.querySelectorAll("li").forEach((item, i) => {
            if (i > 0) fragment.appendChild(document.createElement("br"));
            fragment.appendChild(document.createTextNode(item.textContent));
          });
          ul.replaceWith(fragment);
        }
      } else {
        document.execCommand("insertUnorderedList", false, null);
      }
    } else {
      document.execCommand(cmd, false, null);
    }
    syncContent();
  };

  const toolbarBtns = [
    { key: "bold", cmd: "bold", label: "B", extraStyle: { fontWeight: 700 } },
    { key: "italic", cmd: "italic", label: "I", extraStyle: { fontStyle: "italic" } },
    { key: "underline", cmd: "underline", label: "U", extraStyle: { textDecoration: "underline" } },
    {
      key: "bullets", cmd: "bullets", extraStyle: {},
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="4" cy="7" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="4" cy="17" r="1.5" fill="currentColor" stroke="none" />
          <line x1="9" y1="7" x2="21" y2="7" />
          <line x1="9" y1="12" x2="21" y2="12" />
          <line x1="9" y1="17" x2="21" y2="17" />
        </svg>
      ),
    },
  ];

  return (
    <div style={{
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      overflow: "hidden",
      background: "#f9fafb",
    }}>
      <div style={{
        display: "flex",
        gap: 4,
        padding: "6px 8px",
        borderBottom: "1px solid #e5e7eb",
        background: "#fff",
      }}>
        {toolbarBtns.map(({ key, cmd, label, icon, extraStyle }) => {
          const isActive = activeFormats[key];
          return (
            <button
              key={key}
              type="button"
              title={key}
              onMouseDown={(e) => { e.preventDefault(); exec(cmd); }}
              style={{
                border: `1px solid ${isActive ? "#7c3aed" : "transparent"}`,
                borderRadius: 6,
                width: 30, height: 28,
                cursor: "pointer",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "inherit",
                padding: 0,
                lineHeight: 1,
                background: isActive ? "#ede9fe" : "none",
                color: isActive ? "#7c3aed" : "#333",
                ...extraStyle,
              }}
            >
              {icon || label}
            </button>
          );
        })}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={syncContent}
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
        onSelect={updateActiveFormats}
        data-placeholder={placeholder}
        style={{
          minHeight: 100,
          padding: "10px 14px",
          fontSize: 14,
          color: "#111",
          lineHeight: 1.6,
          outline: "none",
          fontFamily: "inherit",
          background: "#f9fafb",
        }}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
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
    stylingTips: '',
    fabricCare: '',
    returnExchange: '',
    basePrice: 0,
    discountedPrice: '',
    images: [],
    sizes: [],
    colorName: '',
    colorHex: '#000000',
    isBestSeller: false,
    isNewArrival: false,
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
        setFormData({
          name: data.productId?.name || '',
          description: data.description || '',
          stylingTips: data.stylingTips || '',
          fabricCare: data.fabricCare || '',
          returnExchange: data.returnExchange || '',
          basePrice: data.productId?.basePrice || 0,
          discountedPrice: data.discountPrice || '',
          images: data.images || [],
          sizes: data.sizes || [],
          colorName: data.color?.name || '',
          colorHex: data.color?.hex || '#000000',
          isBestSeller: data.isBestSeller || false,
          isNewArrival: data.isNewArrival || false,
        });
      } catch (error) {
        console.error(error);
        alert(error.response?.data?.message || "Failed to load variant");
      } finally {
        setFetching(false);
      }
    };
    if (id) fetchVariantData();
  }, [id]);

  const totalImages = formData.images.length + newImages.length;
  const existingSizeLabels = formData.sizes.map((s) => s.size);
  const availableSizesToAdd = ALL_SIZES.filter((s) => !existingSizeLabels.includes(s));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStockChange = (index, newQty) => {
    setFormData((prev) => {
      const updatedSizes = [...prev.sizes];
      updatedSizes[index] = { ...updatedSizes[index], quantity: Math.max(0, Number(newQty)) };
      return { ...prev, sizes: updatedSizes };
    });
  };

  const handleAddSize = (sizeLabel) => {
    setFormData((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { size: sizeLabel, quantity: 0 }],
    }));
  };

  const handleRemoveSize = (index) => {
    setFormData((prev) => ({ ...prev, sizes: prev.sizes.filter((_, i) => i !== index) }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const currentCount = formData.images.length + newImages.length;
    if (currentCount + files.length > 8) { alert("Maximum 8 images allowed"); return; }
    setNewImages((prev) => [...prev, ...files]);
  };

  const handleRemoveExistingImage = (image) => {
    setRemovedImages((prev) => [...prev, image.public_id]);
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.public_id !== image.public_id),
    }));
  };

  const handleRemoveNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const payload = new FormData();
      payload.append("discountPrice", formData.discountedPrice ? Number(formData.discountedPrice) : "");
      payload.append("sizes", JSON.stringify(formData.sizes));
      payload.append("color", JSON.stringify({ name: formData.colorName.trim().toLowerCase(), hex: formData.colorHex }));
      payload.append("existingImages", JSON.stringify(formData.images));
      payload.append("description", formData.description);
      payload.append("stylingTips", "");
      payload.append("fabricCare", formData.fabricCare);
      payload.append("returnExchange", formData.returnExchange);
      payload.append("isBestSeller", formData.isBestSeller);
      payload.append("isNewArrival", formData.isNewArrival);
      newImages.forEach((file) => payload.append("images", file));

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

  if (fetching) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        Loading...
      </div>
    );
  }

  const discount =
    formData.basePrice && formData.discountedPrice
      ? Math.round(((formData.basePrice - formData.discountedPrice) / formData.basePrice) * 100)
      : null;

  return (
    <div style={{ minHeight: "100vh", background: "#F8F8F8", padding: 32, fontFamily: "'Segoe UI', sans-serif", boxSizing: "border-box" }}>

      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <p style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Edit Variant</p>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: "4px 0 0", color: "#111" }}>{formData.name}</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={loading || saved}
          style={{
            padding: "12px 24px",
            borderRadius: 12,
            border: "none",
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            cursor: loading || saved ? "not-allowed" : "pointer",
            background: saved ? "#22c55e" : "#111",
            transition: "background 0.2s",
          }}
        >
          {loading ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>

        {/* ── LEFT + MIDDLE (col-span-2) ── */}
        <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* IMAGES */}
          <div style={ES.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <p style={ES.sectionLabel}>Product Images</p>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#888" }}>{totalImages} / 8</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              {formData.images.map((img, index) => (
                <div key={index} style={ES.imgWrapper}>
                  <img src={img.url} alt="" style={ES.imgThumb} />
                  <button type="button" onClick={() => handleRemoveExistingImage(img)} style={ES.imgRemoveBtn}>✕</button>
                </div>
              ))}
              {newImages.map((file, index) => (
                <div key={index} style={{ ...ES.imgWrapper, borderColor: "#6ee7b7" }}>
                  <img src={URL.createObjectURL(file)} alt="" style={ES.imgThumb} />
                  <button type="button" onClick={() => handleRemoveNewImage(index)} style={ES.imgRemoveBtn}>✕</button>
                </div>
              ))}
              {totalImages < 8 && (
                <label style={ES.imgAddBtn}>
                  <span style={{ fontSize: 28, color: "#aaa" }}>+</span>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#aaa" }}>Add</span>
                  <input type="file" multiple accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </div>

          {/* SIZES */}
          <div style={ES.card}>
            <p style={ES.sectionLabel}>Sizes & Stock</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {formData.sizes.map((size, index) => (
                <div key={index} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f9fafb", borderRadius: 12, padding: "12px 16px" }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{size.size}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <input
                      type="number"
                      min={0}
                      value={size.quantity}
                      onChange={(e) => handleStockChange(index, e.target.value)}
                      style={{ width: 90, border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", textAlign: "center", fontSize: 14, outline: "none" }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(index)}
                      style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "#fef2f2", color: "#f87171", cursor: "pointer", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}
                    >✕</button>
                  </div>
                </div>
              ))}
            </div>
            {availableSizesToAdd.length > 0 && (
              <div>
                <p style={{ ...ES.sectionLabel, marginBottom: 12 }}>Add Size</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {availableSizesToAdd.map((sizeLabel) => (
                    <button
                      key={sizeLabel}
                      type="button"
                      onClick={() => handleAddSize(sizeLabel)}
                      style={{ padding: "8px 16px", borderRadius: 8, border: "2px dashed #d1d5db", background: "none", fontSize: 13, fontWeight: 700, color: "#888", cursor: "pointer" }}
                    >
                      + {sizeLabel}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* DESCRIPTION */}
          <div style={ES.card}>
            <p style={ES.sectionLabel}>Description</p>
            <RichTextarea
              value={formData.description}
              onChange={(val) => setFormData((prev) => ({ ...prev, description: val }))}
              placeholder="Describe the product's aesthetic and fit..."
            />
          </div>

          {/* EDITORIAL DETAILS */}
          <div style={ES.card}>
            <p style={ES.sectionLabel}>Editorial Details</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* <div>
                <label style={ES.fieldLabel}>Styling Tips</label>
                <RichTextarea
                  value={formData.stylingTips}
                  onChange={(val) => setFormData((prev) => ({ ...prev, stylingTips: val }))}
                  placeholder="How to wear this piece..."
                />
              </div> */}
              <div>
                <label style={ES.fieldLabel}>Fabric & Care</label>
                <RichTextarea
                  value={formData.fabricCare}
                  onChange={(val) => setFormData((prev) => ({ ...prev, fabricCare: val }))}
                  placeholder="Maintenance and cleaning instructions..."
                />
              </div>

              <div>
                <label style={ES.fieldLabel}>Return & Exchange</label>
                <RichTextarea
                  value={formData.returnExchange}
                  onChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      returnExchange: val,
                    }))
                  }
                  placeholder="Return eligibility, exchange timelines and conditions..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* COLOR */}
          <div style={ES.card}>
            <p style={ES.sectionLabel}>Color</p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ position: "relative" }}>
                <input
                  type="color"
                  value={formData.colorHex}
                  onChange={(e) => setFormData((prev) => ({ ...prev, colorHex: e.target.value }))}
                  style={{ opacity: 0, position: "absolute", inset: 0, width: "100%", height: "100%", cursor: "pointer" }}
                />
                <div style={{ width: 44, height: 44, borderRadius: 12, border: "2px solid #e5e7eb", background: formData.colorHex }} />
              </div>
              <input
                name="colorName"
                value={formData.colorName}
                onChange={handleChange}
                placeholder="e.g. Midnight Purple"
                style={{ flex: 1, padding: "10px 14px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, fontSize: 14, outline: "none" }}
              />
            </div>
          </div>

          {/* PRICING */}
          <div style={ES.card}>
            <p style={ES.sectionLabel}>Pricing</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={ES.fieldLabel}>Base Price</label>
                <input
                  value={`₹${formData.basePrice}`}
                  readOnly
                  disabled
                  style={{ width: "100%", padding: "10px 14px", background: "#f3f4f6", border: "none", borderRadius: 12, fontSize: 14, color: "#888", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={ES.fieldLabel}>Discount Price</label>
                <input
                  name="discountedPrice"
                  type="number"
                  value={formData.discountedPrice}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "10px 14px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                />
              </div>
              {discount !== null && (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "10px 14px" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#16a34a" }}>{discount}% OFF</span>
                </div>
              )}
            </div>
          </div>

          {/* FEATURED SETTINGS */}
          <div style={ES.card}>
            <p style={ES.sectionLabel}>Featured Settings</p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {/* Best Seller */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#111",
                  }}
                >
                  Best Seller
                </span>

                <input
                  type="checkbox"
                  checked={formData.isBestSeller}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isBestSeller: e.target.checked,
                    }))
                  }
                  style={{
                    width: 18,
                    height: 18,
                    cursor: "pointer",
                  }}
                />
              </label>

              {/* New Arrival */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#111",
                  }}
                >
                  New Arrival
                </span>

                <input
                  type="checkbox"
                  checked={formData.isNewArrival}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isNewArrival: e.target.checked,
                    }))
                  }
                  style={{
                    width: 18,
                    height: 18,
                    cursor: "pointer",
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ES = {
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    border: "1px solid #f0f0f0",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "#aaa",
    margin: "0 0 16px",
  },
  fieldLabel: {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#888",
    marginBottom: 8,
  },
  imgWrapper: {
    position: "relative",
    width: 112, height: 144,
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid #e5e7eb",
    flexShrink: 0,
  },
  imgThumb: {
    width: "100%", height: "100%",
    objectFit: "cover",
  },
  imgRemoveBtn: {
    position: "absolute",
    top: 8, right: 8,
    width: 28, height: 28,
    borderRadius: "50%",
    background: "rgba(0,0,0,0.6)",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  imgAddBtn: {
    width: 112, height: 144,
    border: "2px dashed #d1d5db",
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    gap: 4,
  },
};

export default EditVariantPage;