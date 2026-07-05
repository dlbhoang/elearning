import React from 'react';
import { FiMenu, FiBarChart2, FiLogOut } from 'react-icons/fi';

const AdminHeader = ({ onLogout }) => (
  <header className="flex items-center justify-between bg-yellow-100 dark:bg-gray-800 px-6 py-4 shadow-md sticky top-0 z-20">
    <div className="flex items-center gap-3">
      <FiMenu className="text-2xl md:hidden text-yellow-700 dark:text-yellow-300" />
      <span className="text-xl font-bold text-yellow-700 dark:text-yellow-300 flex items-center gap-2"><FiBarChart2 /> Admin Dashboard</span>
    </div>
    <div className="flex items-center gap-3">
      <img src="/images/admin.jpg" alt="Admin" className="w-10 h-10 rounded-full border-2 border-yellow-400 dark:border-yellow-700 object-cover" />
      <span className="font-semibold text-yellow-700 dark:text-yellow-200">Admin</span>
      <button onClick={onLogout} className="ml-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-800 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg font-bold text-white shadow flex items-center gap-2 transition"><FiLogOut /> Đăng xuất</button>
    </div>
  </header>
);

export default AdminHeader; 