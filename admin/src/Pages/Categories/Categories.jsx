import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, ImagePlus, Eye, EyeOff } from "lucide-react";
import api from "../../services/api";
import { CATEGORY } from "../../Constants/apiroutes.js";

const BADGE_SUGGESTIONS = ["NEW", "DIWALI", "FESTIVE", "SALE"];

const emptyForm = {
  label: "",
  tagline: "",
  badge: "",
  order: 0,
  showOnHome: true,
  isActive: true,
  imageFile: null,
  imagePreview: "",
  removeImage: false,
};

// Mirrors the backend's slugify(..., { lower: true, strict: true }) closely enough for a preview
const previewSlug = (text) =>
  text.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const errorMessage = (err, fallback) => {
  if (err.response?.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
  return err.response?.data?.message || fallback;
};

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, category = edit
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get(CATEGORY.ALL);
      setCategories(res.data.data || []);
    } catch (err) {
      showToast(errorMessage(err, "Could not load categories"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, []);

  const openNew = () => {
    const nextOrder = categories.reduce((max, c) => Math.max(max, c.order || 0), 0) + 1;
    setForm({ ...emptyForm, order: nextOrder });
    setFormError("");
    setEditing({});
  };

  const openEdit = (category) => {
    setForm({
      ...emptyForm,
      label: category.label,
      tagline: category.tagline || "",
      badge: category.badge || "",
      order: category.order ?? 0,
      showOnHome: category.showOnHome,
      isActive: category.isActive,
      imagePreview: category.image?.url || "",
    });
    setFormError("");
    setEditing(category);
  };

  const closeModal = () => {
    if (form.imageFile) URL.revokeObjectURL(form.imagePreview);
    setEditing(null);
  };

  const set = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const pickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return setFormError("Use a JPG, PNG or WEBP image.");
    if (file.size > 10 * 1024 * 1024) return setFormError("Image must be under 10 MB.");
    if (form.imageFile) URL.revokeObjectURL(form.imagePreview);
    setFormError("");
    setForm((f) => ({ ...f, imageFile: file, imagePreview: URL.createObjectURL(file), removeImage: false }));
  };

  const removeImage = () => {
    if (form.imageFile) URL.revokeObjectURL(form.imagePreview);
    setForm((f) => ({ ...f, imageFile: null, imagePreview: "", removeImage: true }));
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.label.trim()) return setFormError("Category name is required.");

    const data = new FormData();
    data.append("label", form.label.trim());
    data.append("tagline", form.tagline.trim());
    data.append("badge", form.badge.trim());
    data.append("order", String(form.order || 0));
    data.append("showOnHome", String(form.showOnHome));
    data.append("isActive", String(form.isActive));
    if (form.imageFile) data.append("image", form.imageFile);
    if (form.removeImage) data.append("removeImage", "true");

    setSaving(true);
    try {
      const isNew = !editing._id;
      if (isNew) await api.post(CATEGORY.CREATE, data);
      else await api.patch(CATEGORY.UPDATE(editing._id), data);
      showToast(isNew ? `"${form.label.trim()}" created` : "Category updated");
      closeModal();
      fetchCategories();
    } catch (err) {
      setFormError(errorMessage(err, "Could not save the category"));
    } finally {
      setSaving(false);
    }
  };

  const toggleVisible = async (category) => {
    const data = new FormData();
    data.append("isActive", String(!category.isActive));
    try {
      await api.patch(CATEGORY.UPDATE(category._id), data);
      showToast(category.isActive ? `"${category.label}" and its products are hidden from the website` : `"${category.label}" and its products are now live`);
      fetchCategories();
    } catch (err) {
      showToast(errorMessage(err, "Could not update the category"), "error");
    }
  };

  const remove = async (category) => {
    if (!window.confirm(`Delete the "${category.label}" category? This cannot be undone.`)) return;
    try {
      await api.delete(CATEGORY.DELETE(category._id));
      showToast(`"${category.label}" deleted`);
      fetchCategories();
    } catch (err) {
      showToast(errorMessage(err, "Could not delete the category"), "error");
    }
  };

  const isNew = editing && !editing._id;

  return (
    <div className="min-h-screen bg-[#f5f5f7] px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
      {toast && (
        <div
          className={`fixed right-4 top-4 z-[60] max-w-sm rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
            toast.type === "error" ? "bg-red-500" : "bg-green-500"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#111] sm:text-[32px]">Categories</h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-[#666]">
            Collections shown in the website menu, footer, home page tiles and filters. Hiding a category also hides
            its products from the website. For a launch (e.g. "Suits"): create it hidden, add its products, then click Show.
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex shrink-0 items-center justify-center gap-2 rounded-[10px] bg-[#7c3aed] px-5 py-3 text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(124,58,237,0.35)] hover:bg-[#6d28d9]"
        >
          <Plus size={18} /> New category
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        {loading ? (
          <p className="p-10 text-center text-sm text-[#888]">Loading categories…</p>
        ) : categories.length === 0 ? (
          <p className="p-10 text-center text-sm text-[#888]">No categories yet.</p>
        ) : (
          <ul className="divide-y divide-[#f0f0f0]">
            {categories.map((c) => (
              <li key={c._id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:px-6">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  {c.image?.url ? (
                    <img src={c.image.url} alt="" className="h-14 w-[75px] shrink-0 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-14 w-[75px] shrink-0 items-center justify-center rounded-lg bg-[#2B2112] px-1 text-center text-[10px] italic leading-tight text-[#F5E6D0]">
                      {c.label}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[#111]">{c.label}</span>
                      {c.badge && (
                        <span className="rounded bg-[#fef3c7] px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#92400e]">
                          {c.badge}
                        </span>
                      )}
                      {!c.isActive && (
                        <span className="rounded bg-[#f0f0f0] px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#666]">
                          HIDDEN
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-[#888]">
                      /categories/{c.slug} · {c.productCount} product{c.productCount === 1 ? "" : "s"} · order {c.order}
                      {c.showOnHome ? " · on home page" : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:shrink-0">
                  <button
                    onClick={() => toggleVisible(c)}
                    className="flex items-center gap-1.5 rounded-lg border border-[#e5e5e5] px-3 py-2 text-xs font-semibold text-[#444] hover:bg-[#fafafa]"
                    title={c.isActive ? "Hide this category and its products from the website" : "Show this category and its products on the website"}
                  >
                    {c.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                    {c.isActive ? "Hide" : "Show"}
                  </button>
                  <button
                    onClick={() => openEdit(c)}
                    className="rounded-lg border border-[#e5e5e5] p-2 text-[#444] hover:bg-[#fafafa]"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => remove(c)}
                    className="rounded-lg border border-[#fee2e2] p-2 text-[#dc2626] hover:bg-[#fef2f2]"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-6"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <form
            onSubmit={save}
            className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white sm:max-w-lg sm:rounded-2xl"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[#f0f0f0] bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-[#111]">{isNew ? "New category" : `Edit ${editing.label}`}</h2>
                <p className="mt-1 text-xs text-[#888]">
                  {isNew
                    ? `Website link: /categories/${previewSlug(form.label) || "…"}`
                    : `Products are linked to this category as "${editing.name}".`}
                </p>
              </div>
              <button type="button" onClick={closeModal} className="p-1 text-[#888] hover:text-[#111]">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 px-6 py-5">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#666]">Category name</span>
                <input
                  value={form.label}
                  onChange={set("label")}
                  maxLength={40}
                  placeholder="e.g. Suits"
                  className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2.5 text-sm outline-none focus:border-[#7c3aed]"
                  autoFocus
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#666]">Tagline</span>
                <input
                  value={form.tagline}
                  onChange={set("tagline")}
                  maxLength={120}
                  placeholder="e.g. Festive elegance for every celebration."
                  className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2.5 text-sm outline-none focus:border-[#7c3aed]"
                />
              </label>

              <div>
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#666]">
                  Badge <span className="font-normal normal-case text-[#999]">(shown next to the name in the menu)</span>
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    value={form.badge}
                    onChange={set("badge")}
                    maxLength={20}
                    placeholder="None"
                    className="w-32 rounded-lg border border-[#e5e5e5] px-3 py-2 text-sm uppercase outline-none focus:border-[#7c3aed]"
                  />
                  {BADGE_SUGGESTIONS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, badge: f.badge === b ? "" : b }))}
                      className={`rounded-full border px-3 py-1 text-[11px] font-bold tracking-wider ${
                        form.badge.toUpperCase() === b
                          ? "border-[#7c3aed] bg-[#ede9fe] text-[#6d28d9]"
                          : "border-[#e5e5e5] text-[#666] hover:border-[#c4b5fd]"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#666]">
                  Home page tile <span className="font-normal normal-case text-[#999]">(4:3 image; without one, a styled text tile is shown)</span>
                </span>
                {form.imagePreview ? (
                  <div className="relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: "4/3" }}>
                    <img src={form.imagePreview} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
                      title="Remove image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#e5e5e5] py-8 text-sm text-[#888] hover:border-[#c4b5fd]">
                    <ImagePlus size={22} />
                    Upload image (JPG, PNG or WEBP, max 10 MB)
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pickImage} className="hidden" />
                  </label>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#666]">Order</span>
                  <input
                    type="number"
                    value={form.order}
                    onChange={set("order")}
                    className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2.5 text-sm outline-none focus:border-[#7c3aed]"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm text-[#333] sm:mt-6">
                  <input type="checkbox" checked={form.showOnHome} onChange={set("showOnHome")} className="h-4 w-4 accent-[#7c3aed]" />
                  Show on home page
                </label>
                <label className="flex items-center gap-2 text-sm text-[#333] sm:mt-6">
                  <input type="checkbox" checked={form.isActive} onChange={set("isActive")} className="h-4 w-4 accent-[#7c3aed]" />
                  Visible on website
                </label>
              </div>
              <p className="text-xs text-[#999]">Lower order numbers appear first. Use 0 to put a new launch at the front.</p>

              {formError && <p className="rounded-lg bg-[#fef2f2] px-3 py-2 text-sm text-[#dc2626]">{formError}</p>}
            </div>

            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-[#f0f0f0] bg-white px-6 py-4">
              <button type="button" onClick={closeModal} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#666] hover:bg-[#f5f5f5]">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#7c3aed] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#6d28d9] disabled:opacity-60"
              >
                {saving ? "Saving…" : isNew ? "Create category" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
