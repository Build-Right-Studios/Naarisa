import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import axios from "axios";
import { BASE, ADMIN_USERS } from "../Constants/apiroutes.js";

const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
};

const avatarColors = [
    { bg: "#EDE9FE", text: "#6D28D9" },
    { bg: "#DBEAFE", text: "#1D4ED8" },
    { bg: "#FCE7F3", text: "#9D174D" },
    { bg: "#D1FAE5", text: "#065F46" },
    { bg: "#FEF3C7", text: "#92400E" },
];

const getColor = (name) => {
    if (!name) return avatarColors[0];
    const index = name.charCodeAt(0) % avatarColors.length;
    return avatarColors[index];
};

const Customers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const limit = 10;

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(
                `${BASE.ROUTE}${ADMIN_USERS.GET_ALL}`,
                { params: { page, limit } }
            );
            setUsers(data.users);
            setPagination(data.pagination);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page]);

    const filtered = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.phone?.includes(search)
    );

    return (
        <div style={{ padding: "2rem" }}>

            {/* Header */}
            <div style={{ marginBottom: "1.5rem" }}>
                <h1 style={{ fontSize: "28px", fontWeight: 600, margin: "0 0 4px", color: "var(--color-text-primary)" }}>
                    Customers
                </h1>
                <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", margin: 0 }}>
                    View and manage your customer base
                </p>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative w-80">
                    {/* Icon */}
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />

                    {/* Input */}
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 
                 focus:outline-none focus:ring-2 focus:ring-black/80 
                 focus:border-transparent 
                 shadow-sm hover:shadow-md transition-all duration-200"
                    />
                </div>
            </div>

            {/* Table */}
            <div style={{
                background: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: "12px",
                overflow: "hidden"
            }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                            {["Name", "Phone Number", "Email", "Orders", "Spent", "Status", "Actions"].map(col => (
                                <th key={col} style={{
                                    padding: "12px 16px",
                                    textAlign: "left",
                                    fontSize: "11px",
                                    fontWeight: 500,
                                    color: "var(--color-text-tertiary)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.04em"
                                }}>
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-secondary)", fontSize: "14px" }}>
                                    Loading customers...
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-secondary)", fontSize: "14px" }}>
                                    No customers found
                                </td>
                            </tr>
                        ) : filtered.map((user, i) => {
                            const color = getColor(user.name);
                            return (
                                <tr key={user._id} style={{
                                    borderBottom: i < filtered.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none",
                                    transition: "background 0.15s"
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = "var(--color-background-secondary)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                >
                                    {/* Name */}
                                    <td style={{ padding: "16px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <div style={{
                                                width: "36px",
                                                height: "36px",
                                                borderRadius: "50%",
                                                background: color.bg,
                                                color: color.text,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "12px",
                                                fontWeight: 500,
                                                flexShrink: 0
                                            }}>
                                                {getInitials(user.name)}
                                            </div>
                                            <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text-primary)" }}>
                                                {user.name}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Phone */}
                                    <td style={{ padding: "16px", fontSize: "13px", color: "var(--color-text-secondary)" }}>
                                        +91 {user.phone}
                                    </td>

                                    {/* Email */}
                                    <td style={{ padding: "16px", fontSize: "13px", color: "var(--color-text-secondary)" }}>
                                        {user.email || "—"}
                                    </td>

                                    {/* Orders */}
                                    <td style={{ padding: "16px", fontSize: "14px", color: "var(--color-text-primary)" }}>
                                        {user.totalOrders ?? "—"}
                                    </td>

                                    {/* Spent */}
                                    <td style={{ padding: "16px", fontSize: "14px", color: "var(--color-text-primary)" }}>
                                        {user.totalSpent ? `₹${user.totalSpent.toLocaleString()}` : "—"}
                                    </td>

                                    {/* Status */}
                                    <td style={{ padding: "16px" }}>
                                        <span style={{
                                            fontSize: "11px",
                                            fontWeight: 500,
                                            padding: "4px 10px",
                                            borderRadius: "20px",
                                            background: user.isActive ? "#EDE9FE" : "var(--color-background-secondary)",
                                            color: user.isActive ? "#6D28D9" : "var(--color-text-secondary)"
                                        }}>
                                            {user.isActive ? "ACTIVE" : "INACTIVE"}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td style={{ padding: "16px" }}>
                                        <button
                                            onClick={() => navigate(`/customers/${user._id}`)}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                color: "var(--color-text-secondary)",
                                                padding: "4px"
                                            }}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                <path d="M1 10C1 10 4 4 10 4s9 6 9 6-3 6-9 6-9-6-9-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div style={{
                        padding: "14px 16px",
                        borderTop: "0.5px solid var(--color-border-tertiary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                    }}>
                        <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                            Showing <strong>{(page - 1) * limit + 1}–{Math.min(page * limit, pagination.total)}</strong> of <strong>{pagination.total}</strong> customers
                        </span>
                        <div style={{ display: "flex", gap: "6px" }}>
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                style={{
                                    width: "32px", height: "32px", borderRadius: "8px",
                                    border: "0.5px solid var(--color-border-secondary)",
                                    background: "none", cursor: page === 1 ? "not-allowed" : "pointer",
                                    opacity: page === 1 ? 0.4 : 1, fontSize: "14px"
                                }}
                            >
                                ‹
                            </button>
                            {Array.from({ length: Math.min(3, pagination.totalPages) }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    style={{
                                        width: "32px", height: "32px", borderRadius: "8px",
                                        border: "0.5px solid var(--color-border-secondary)",
                                        background: page === p ? "#7C3AED" : "none",
                                        color: page === p ? "#fff" : "var(--color-text-primary)",
                                        cursor: "pointer", fontSize: "13px", fontWeight: page === p ? 500 : 400
                                    }}
                                >
                                    {p}
                                </button>
                            ))}
                            <button
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={page === pagination.totalPages}
                                style={{
                                    width: "32px", height: "32px", borderRadius: "8px",
                                    border: "0.5px solid var(--color-border-secondary)",
                                    background: "none", cursor: page === pagination.totalPages ? "not-allowed" : "pointer",
                                    opacity: page === pagination.totalPages ? 0.4 : 1, fontSize: "14px"
                                }}
                            >
                                ›
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Customers;