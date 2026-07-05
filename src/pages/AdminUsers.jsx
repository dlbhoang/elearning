import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import { FiUsers } from 'react-icons/fi';
import { getAllUsers, searchUsers } from '../services/adminUserService';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!localStorage.getItem('token') || user?.role !== 'admin') navigate('/login');
  }, [navigate]);

  const filteredUsers = search ? searchUsers(search) : getAllUsers();

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-yellow-50 via-white to-yellow-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AdminSidebar onLogout={() => { localStorage.clear(); navigate('/login'); }} />
      <div className="flex-1 flex flex-col min-h-screen">
        <AdminHeader onLogout={() => { localStorage.clear(); navigate('/login'); }} />
        <main className="flex-1 p-4 md:p-10">
          <section className="mb-10">
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-200 mb-6 flex items-center gap-2"><FiUsers /> Quản lý người dùng</div>
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc email..."
                className="px-4 py-2 rounded-lg border border-yellow-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-yellow-800 dark:text-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full sm:w-80 shadow"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="overflow-x-auto rounded-xl shadow">
              <table className="min-w-full divide-y divide-yellow-200 dark:divide-gray-700">
                <thead className="bg-yellow-100 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-yellow-700 dark:text-yellow-200 uppercase">Tên</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-yellow-700 dark:text-yellow-200 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-yellow-700 dark:text-yellow-200 uppercase">Vai trò</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-yellow-100 dark:divide-gray-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-gray-500 dark:text-gray-400">Không tìm thấy người dùng nào.</td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => (
                      <tr key={user.id || user.email}>
                        <td className="px-4 py-3 font-semibold text-yellow-800 dark:text-yellow-100">{user.name}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{user.email}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300 capitalize">{user.role}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminUsers; 