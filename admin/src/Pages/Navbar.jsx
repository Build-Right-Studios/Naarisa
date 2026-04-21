import React from 'react';
import { IoSearchOutline, IoNotificationsOutline, IoHelpCircleOutline } from "react-icons/io5";

const Navbar = ({ currentUser }) => {
  const userName = currentUser?.name || "Admin User";
  const userRole = currentUser?.role || "SUPER ADMIN";
  const userImage = currentUser?.profilePic || "https://ui-avatars.com/api/?name=Admin+User";

  return (
    <nav className="flex items-center justify-between w-full h-16 px-8 bg-[#F8F9FA] border-b border-gray-200">
      
      <div className="relative w-96">
        <span className="absolute inset-y-0 left-4 flex items-center text-gray-500">
          <IoSearchOutline size={20} />
        </span>
        <input
          type="text"
          placeholder="Search resources..."
          className="w-full py-2 pl-12 pr-4 bg-white border border-transparent rounded-full shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-400 placeholder-gray-400"
        />
      </div>

      <div className="flex items-center gap-6">

        <div className="flex items-center gap-4 pr-6 border-r border-gray-300 text-gray-600">
          <div className="relative cursor-pointer">
            <IoNotificationsOutline size={24} />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#6366F1] border-2 border-white rounded-full"></span>
          </div>
          <IoHelpCircleOutline size={26} className="cursor-pointer" />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-gray-800 leading-none">
              {userName}
            </span>
            <span className="text-[10px] font-semibold text-gray-400 tracking-tighter mt-1">
              {userRole}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
            <img 
              src={userImage} 
              alt="User" 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;