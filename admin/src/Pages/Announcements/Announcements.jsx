import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Eye, EyeOff } from "lucide-react";
import api from "../../services/api";
import { ANNOUNCEMENT, CATEGORY } from "../../Constants/apiroutes.js";

const PRESETS = [
  { name: "Naarisa brown", backgroundColor: "#2B2112", textColor: "#F5E6D0" },
  { name: "Festive maroon", backgroundColor: "#7A1F1F", textColor: "#FFE9B0" },
  { name: "Diwali gold", backgroundColor: "#AB721E", textColor: "#FFFFFF" },
  { name: "Emerald", backgroundColor: "#1F4D3A", textColor: "#F5E6D0" },
];

const PRESET_LINKS = ["/new-in", "/best-sellers"];

const emptyForm = {
  message: "",
  linkText: "Shop now",
  link: "",
  backgroundColor: PRESETS[0].backgroundColor,
  textColor: PRESETS[0].textColor,
  startsAt: "",
  endsAt: "",
  order: 0,
  isActive: true,
};

// <input type="datetime-local"> works in the admin's local time; the API stores UTC
const toLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const fromLocalInput = (value) => (value ? new Date(value).toISOString() : null);

const formatDate = (iso) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

const statusOf = (a, now = new Date()) => {
  if (!a.isActive) return { label: "Hidden", className: "bg-[#f0f0f0] text-[#666]" };
  if (a.startsAt && new Date(a.startsAt) > now) return { label: "Scheduled", className: "bg-[#dbeafe] text-[#1d4ed8]" };
  if (a.endsAt && new Date(a.endsAt) < now) return { label: "Ended", className: "bg-[#f0f0f0] text-[#666]" };
  return { label: "Live", className: "bg-[#dcfce7] text-[#15803d]" };
};

const scheduleText = (a) => {
  if (a.startsAt && a.endsAt) return `${formatDate(a.startsAt)} → ${formatDate(a.endsAt)}`;
  if (a.startsAt) return `From ${formatDate(a.startsAt)}`;
  if (a.endsAt) return `Until ${formatDate(a.endsAt)}`;
  return "No end date";
};

const errorMessage = (err, fallback) => {
  if (err.response?.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
  return err.response?.data?.message || fallback;
};

// Same look as the storefront bar
const BarPreview = ({ a }) => (
  <div
    className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-10 py-2.5 text-center text-[13px] tracking-[0.06em]"
    style={{ backgroundColor: a.backgroundColor, color: a.textColor, fontFamily: "'Jost', sans-serif" }}
  >
    <span>{a.message || "Your message appears here"}</span>
    {a.linkText && <span className="whitespace-nowrap font-bold underline underline-offset-[3px]">{a.linkText} →</span>}
  </div>
);

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, announcement = edit
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get(ANNOUNCEMENT.ALL);
      setAnnouncements(res.data.data || []);
    } catch (err) {
      showToast(errorMessage(err, "Could not load event bars"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    api.get(CATEGORY.ALL).then((res) => setCategories(res.data.data || [])).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, []);

  const openNew = () => {
    setForm(emptyForm);
    setFormError("");
    setEditing({});
  };

  const openEdit = (a) => {
    setForm({
      message: a.message,
      linkText: a.linkText || "",
      link: a.link || "",
      backgroundColor: a.backgroundColor,
      textColor: a.textColor,
      startsAt: toLocalInput(a.startsAt),
      endsAt: toLocalInput(a.endsAt),
      order: a.order ?? 0,
      isActive: a.isActive,
    });
    setFormError("");
    setEditing(a);
  };

  const set = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) return setFormError("Message is required.");

    const payload = {
      message: form.message.trim(),
      linkText: form.linkText.trim(),
      link: form.link.trim(),
      backgroundColor: form.backgroundColor,
      textColor: form.textColor,
      startsAt: fromLocalInput(form.startsAt),
      endsAt: fromLocalInput(form.endsAt),
      order: Number(form.order) || 0,
      isActive: form.isActive,
    };

    setSaving(true);
    try {
      const isNew = !editing._id;
      if (isNew) await api.post(ANNOUNCEMENT.CREATE, payload);
      else await api.patch(ANNOUNCEMENT.UPDATE(editing._id), payload);
      showToast(isNew ? "Event bar created" : "Event bar updated");
      setEditing(null);
      fetchAnnouncements();
    } catch (err) {
      setFormError(errorMessage(err, "Could not save the event bar"));
    } finally {
      setSaving(false);
    }
  };

  const toggleVisible = async (a) => {
    try {
      await api.patch(ANNOUNCEMENT.UPDATE(a._id), { isActive: !a.isActive });
      showToast(a.isActive ? "Event bar hidden" : "Event bar turned on");
      fetchAnnouncements();
    } catch (err) {
      showToast(errorMessage(err, "Could not update the event bar"), "error");
    }
  };

  const remove = async (a) => {
    if (!window.confirm("Delete this event bar? This cannot be undone.")) return;
    try {
      await api.delete(ANNOUNCEMENT.DELETE(a._id));
      showToast("Event bar deleted");
      fetchAnnouncements();
    } catch (err) {
      showToast(errorMessage(err, "Could not delete the event bar"), "error");
    }
  };

  const isNew = editing && !editing._id;
  const linkedCategory = categories.find((c) => form.link === `/categories/${c.slug}`);
  const isPresetLink = Boolean(linkedCategory) || PRESET_LINKS.includes(form.link);

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
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#111] sm:text-[32px]">Event Bar</h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-[#666]">
            A message shown at the very top of every page of the website, such as a festive launch or sale. Set an end
            date and it switches off by itself. If several are live, they take turns.
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex shrink-0 items-center justify-center gap-2 rounded-[10px] bg-[#7c3aed] px-5 py-3 text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(124,58,237,0.35)] hover:bg-[#6d28d9]"
        >
          <Plus size={18} /> New event bar
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="rounded-2xl bg-white p-10 text-center text-sm text-[#888]">Loading…</p>
        ) : announcements.length === 0 ? (
          <p className="rounded-2xl bg-white p-10 text-center text-sm text-[#888]">
            No event bars yet. Create one to announce a launch, like your Diwali collection.
          </p>
        ) : (
          announcements.map((a) => {
            const status = statusOf(a);
            return (
              <div key={a._id} className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                <BarPreview a={a} />
                <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 text-xs text-[#666]">
                    <span className={`mr-2 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${status.className}`}>
                      {status.label}
                    </span>
                    {scheduleText(a)}
                    {a.link && <span className="ml-2 text-[#999]">→ {a.link}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleVisible(a)}
                      className="flex items-center gap-1.5 rounded-lg border border-[#e5e5e5] px-3 py-2 text-xs font-semibold text-[#444] hover:bg-[#fafafa]"
                    >
                      {a.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                      {a.isActive ? "Hide" : "Turn on"}
                    </button>
                    <button onClick={() => openEdit(a)} className="rounded-lg border border-[#e5e5e5] p-2 text-[#444] hover:bg-[#fafafa]" title="Edit">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => remove(a)} className="rounded-lg border border-[#fee2e2] p-2 text-[#dc2626] hover:bg-[#fef2f2]" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-6"
          onClick={(e) => e.target === e.currentTarget && setEditing(null)}
        >
          <form onSubmit={save} className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white sm:max-w-xl sm:rounded-2xl">
            <div className="sticky top-0 z-10 border-b border-[#f0f0f0] bg-white">
              <div className="flex items-start justify-between px-6 py-5">
                <h2 className="text-xl font-bold text-[#111]">{isNew ? "New event bar" : "Edit event bar"}</h2>
                <button type="button" onClick={() => setEditing(null)} className="p-1 text-[#888] hover:text-[#111]">
                  <X size={20} />
                </button>
              </div>
              <BarPreview a={form} />
            </div>

            <div className="space-y-5 px-6 py-5">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#666]">Message</span>
                <input
                  value={form.message}
                  onChange={set("message")}
                  maxLength={160}
                  placeholder="🪔 Diwali Special — discover our new Suits collection"
                  className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2.5 text-sm outline-none focus:border-[#7c3aed]"
                  autoFocus
                />
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#666]">Links to</span>
                  <select
                    value={isPresetLink ? form.link : form.link ? "custom" : ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setForm((f) => ({ ...f, link: value === "custom" ? (isPresetLink || !f.link ? "/" : f.link) : value }));
                    }}
                    className="w-full rounded-lg border border-[#e5e5e5] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#7c3aed]"
                  >
                    <option value="">Nothing (text only)</option>
                    {categories.map((c) => (
                      <option key={c._id} value={`/categories/${c.slug}`}>
                        {c.label} category{c.isActive ? "" : " (hidden)"}
                      </option>
                    ))}
                    <option value="/new-in">New In</option>
                    <option value="/best-sellers">Best Sellers</option>
                    <option value="custom">Other page or website…</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#666]">Button text</span>
                  <input
                    value={form.linkText}
                    onChange={set("linkText")}
                    maxLength={30}
                    placeholder="Shop now"
                    className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2.5 text-sm outline-none focus:border-[#7c3aed]"
                  />
                </label>
              </div>
              {form.link && !isPresetLink && (
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#666]">Page path or https:// link</span>
                  <input
                    value={form.link}
                    onChange={set("link")}
                    placeholder="/all-products or https://…"
                    className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2.5 text-sm outline-none focus:border-[#7c3aed]"
                  />
                </label>
              )}
              {linkedCategory && !linkedCategory.isActive && (
                <p className="rounded-lg bg-[#fffbeb] px-3 py-2 text-xs text-[#92400e]">
                  "{linkedCategory.label}" is hidden right now. Make it visible on the Categories page before this bar goes live.
                </p>
              )}

              <div>
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#666]">Colours</span>
                <div className="flex flex-wrap items-center gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, backgroundColor: p.backgroundColor, textColor: p.textColor }))}
                      className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ring-offset-2 ${
                        form.backgroundColor === p.backgroundColor && form.textColor === p.textColor ? "ring-2 ring-[#7c3aed]" : ""
                      }`}
                      style={{ backgroundColor: p.backgroundColor, color: p.textColor }}
                    >
                      {p.name}
                    </button>
                  ))}
                  <label className="ml-1 flex items-center gap-1.5 text-xs text-[#666]">
                    Background
                    <input type="color" value={form.backgroundColor} onChange={set("backgroundColor")} className="h-7 w-9 cursor-pointer rounded border border-[#e5e5e5]" />
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-[#666]">
                    Text
                    <input type="color" value={form.textColor} onChange={set("textColor")} className="h-7 w-9 cursor-pointer rounded border border-[#e5e5e5]" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#666]">Starts</span>
                  <input
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={set("startsAt")}
                    className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2.5 text-sm outline-none focus:border-[#7c3aed]"
                  />
                  <span className="mt-1 block text-[11px] text-[#999]">Empty = straight away</span>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#666]">Ends</span>
                  <input
                    type="datetime-local"
                    value={form.endsAt}
                    onChange={set("endsAt")}
                    className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2.5 text-sm outline-none focus:border-[#7c3aed]"
                  />
                  <span className="mt-1 block text-[11px] text-[#999]">Empty = until you hide it</span>
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  <input type="checkbox" checked={form.isActive} onChange={set("isActive")} className="h-4 w-4 accent-[#7c3aed]" />
                  Turned on
                </label>
              </div>

              {formError && <p className="rounded-lg bg-[#fef2f2] px-3 py-2 text-sm text-[#dc2626]">{formError}</p>}
            </div>

            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-[#f0f0f0] bg-white px-6 py-4">
              <button type="button" onClick={() => setEditing(null)} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#666] hover:bg-[#f5f5f5]">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#7c3aed] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#6d28d9] disabled:opacity-60"
              >
                {saving ? "Saving…" : isNew ? "Create event bar" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
