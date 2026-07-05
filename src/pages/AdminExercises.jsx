import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import { FiFileText } from 'react-icons/fi';
import { getAllExercises, searchExercises } from '../services/adminExerciseService';

const AdminExercises = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!localStorage.getItem('token') || user?.role !== 'admin') navigate('/login');
  }, [navigate]);

  const filteredExercises = search ? searchExercises(search) : getAllExercises();

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-yellow-50 via-white to-yellow-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AdminSidebar onLogout={() => { localStorage.clear(); navigate('/login'); }} />
      <div className="flex-1 flex flex-col min-h-screen">
        <AdminHeader onLogout={() => { localStorage.clear(); navigate('/login'); }} />
        <main className="flex-1 p-4 md:p-10">
          <section className="mb-10">
            <div className="text-2xl font-bold text-green-700 dark:text-green-200 mb-6 flex items-center gap-2"><FiFileText /> Quản lý bài tập</div>
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên bài tập, khoá học hoặc giáo viên..."
                className="px-4 py-2 rounded-lg border border-green-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-green-800 dark:text-green-100 focus:outline-none focus:ring-2 focus:ring-green-400 w-full sm:w-80 shadow"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="overflow-x-auto rounded-xl shadow">
              <table className="min-w-full divide-y divide-green-200 dark:divide-gray-700">
                <thead className="bg-green-100 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-green-700 dark:text-green-200 uppercase">Tên bài tập</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-green-700 dark:text-green-200 uppercase">Khoá học</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-green-700 dark:text-green-200 uppercase">Giáo viên</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-green-100 dark:divide-gray-800">
                  {filteredExercises.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-gray-500 dark:text-gray-400">Không tìm thấy bài tập nào.</td>
                    </tr>
                  ) : (
                    filteredExercises.map(ex => (
                      <tr key={ex.id}>
                        <td className="px-4 py-3 font-semibold text-green-800 dark:text-green-100">{ex.title}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{ex.course}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{ex.teacher}</td>
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

export default AdminExercises; 