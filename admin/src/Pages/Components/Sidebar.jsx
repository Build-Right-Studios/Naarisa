import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  Image as ImageIcon,
  UserCircle,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const menu = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Products", path: "/products", icon: Package },
  { name: "Orders", path: "/orders", icon: ShoppingCart },
  { name: "Coupons", path: "/coupons", icon: Tag },
  { name: "Banners", path: "/banner", icon: ImageIcon },
  { name: "Customers", path: "/customers", icon: UserCircle },
];

function Sidebar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile top bar with hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-black border-b border-zinc-800 flex items-center justify-between px-4 z-40">
        <h1 className="text-xl font-bold tracking-widest text-white">NAARISA</h1>
        <button
          onClick={() => setIsOpen(true)}
          className="text-zinc-400 hover:text-white p-2"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Overlay backdrop, mobile only, shown when sidebar is open */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-64 bg-black text-zinc-400 border-r border-zinc-800 flex flex-col justify-between p-5 z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div>
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-widest text-white">
                NAARISA
              </h1>
              <p className="text-xs text-zinc-500">
                Admin Console
              </p>
            </div>
            {/* Close button, mobile only */}
            <button
              onClick={closeSidebar}
              className="lg:hidden text-zinc-400 hover:text-white p-1"
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>

          <div className="space-y-2">
            {menu.map((item, index) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={index}
                  to={item.path}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg"
                        : "hover:bg-zinc-900"
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <NavLink
            to="/settings"
            onClick={closeSidebar}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-900"
          >
            <Settings size={18} />
            Settings
          </NavLink>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-600 hover:text-white w-full text-left transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;