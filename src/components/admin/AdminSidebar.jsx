import React from 'react';
import { FiBarChart2, FiUsers, FiBookOpen, FiFileText, FiLogOut } from 'react-icons/fi';

const AdminSidebar = ({ onLogout }) => (
  <aside className="hidden md:flex flex-col w-64 bg-primary dark:bg-gray-900 text-white py-8 px-6 shadow-2xl">
    <div className="flex items-center gap-3 mb-10">
      <FiBarChart2 className="text-3xl" />
      <span className="text-2xl font-extrabold tracking-wide">ADMIN</span>
    </div>
    <nav className="flex flex-col gap-4 text-lg font-semibold">
      <a href="/admin" className="hover:text-primary/80 transition flex items-center gap-2"><FiBarChart2 /> Dashboard</a>
      <a href="/admin/users" className="hover:text-primary/80 transition flex items-center gap-2"><FiUsers /> Người dùng</a>
      <a href="/admin/courses" className="hover:text-primary/80 transition flex items-center gap-2"><FiBookOpen /> Khoá học</a>
      <a href="/admin/exercises" className="hover:text-primary/80 transition flex items-center gap-2"><FiFileText /> Bài tập</a>
      <a href="#stats" className="hover:text-primary/80 transition flex items-center gap-2"><FiBarChart2 /> Thống kê</a>
    </nav>
    <button onClick={onLogout} className="mt-auto flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg font-bold shadow transition">
      <FiLogOut /> Đăng xuất
    </button>
  </aside>
);

export default AdminSidebar; 