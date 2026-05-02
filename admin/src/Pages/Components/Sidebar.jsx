import React from "react";
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

  const handleLogout = () => {
    localStorage.removeItem("token"); // remove token
    navigate("/login"); // redirect to login
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-black text-zinc-400 border-r border-zinc-800 flex flex-col justify-between p-5">
      <div>
        <div className="mb-10">
          <h1 className="text-2xl font-bold tracking-widest text-white">
            NAARISA
          </h1>
          <p className="text-xs text-zinc-500">
            Admin Console
          </p>
        </div>

        <div className="space-y-2">
          {menu.map((item, index) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={index}
                to={item.path}
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
  );
}

export default Sidebar;
