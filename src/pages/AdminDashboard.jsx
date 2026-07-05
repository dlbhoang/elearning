import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import { FiBarChart2 } from 'react-icons/fi';

const mockUsers = [
  { id: 1, name: 'Cô Mai Hương', email: 'teacher@example.com', role: 'teacher' },
  { id: 2, name: 'Nguyễn Văn B', email: 'student@example.com', role: 'student' },
  { id: 3, name: 'Admin', email: 'admin@example.com', role: 'admin' },
  { id: 4, name: 'Trần Thị C', email: 'student2@example.com', role: 'student' },
  { id: 5, name: 'Thầy Nam', email: 'teacher2@example.com', role: 'teacher' },
];
const mockCourses = [
  { id: 1, title: 'Toán nâng cao lớp 10', teacher: 'Cô Mai Hương' },
  { id: 2, title: 'Vật lý thực hành lớp 8', teacher: 'Thầy Nam' },
  { id: 3, title: 'Ngữ văn lớp 9 ôn thi vào 10', teacher: 'Cô Mai Hương' },
];
const mockStats = {
  logins: 1234,
  online: 12,
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!localStorage.getItem('token') || user?.role !== 'admin') navigate('/login');
  }, [navigate]);

  const totalUsers = mockUsers.length;
  const totalTeachers = mockUsers.filter(u => u.role === 'teacher').length;
  const totalStudents = mockUsers.filter(u => u.role === 'student').length;
  const totalCourses = mockCourses.length;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-yellow-50 via-white to-yellow-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AdminSidebar onLogout={handleLogout} />
      <div className="flex-1 flex flex-col min-h-screen">
        <AdminHeader onLogout={handleLogout} />
        <main className="flex-1 p-4 md:p-10">
          {/* Card tổng quan */}
          <section id="dashboard" className="mb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              <div className="flex items-center gap-4 bg-gradient-to-r from-yellow-100 to-yellow-300 dark:from-yellow-900 dark:to-yellow-700 rounded-xl shadow p-5">
                <div className="bg-white dark:bg-gray-800 rounded-full p-3 shadow"><FiBarChart2 className="text-2xl text-yellow-600 dark:text-yellow-300" /></div>
                <div>
                  <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-200">{totalUsers}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Tổng người dùng</div>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-gradient-to-r from-blue-100 to-blue-300 dark:from-blue-900 dark:to-blue-700 rounded-xl shadow p-5">
                <div className="bg-white dark:bg-gray-800 rounded-full p-3 shadow"><FiBarChart2 className="text-2xl text-blue-600 dark:text-blue-300" /></div>
                <div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-200">{totalTeachers}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Giáo viên</div>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-gradient-to-r from-green-100 to-green-300 dark:from-green-900 dark:to-green-700 rounded-xl shadow p-5">
                <div className="bg-white dark:bg-gray-800 rounded-full p-3 shadow"><FiBarChart2 className="text-2xl text-green-600 dark:text-green-300" /></div>
                <div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-200">{totalStudents}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Học sinh</div>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-gradient-to-r from-purple-100 to-purple-300 dark:from-purple-900 dark:to-purple-700 rounded-xl shadow p-5">
                <div className="bg-white dark:bg-gray-800 rounded-full p-3 shadow"><FiBarChart2 className="text-2xl text-purple-600 dark:text-purple-300" /></div>
                <div>
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-200">{totalCourses}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Khoá học</div>
                </div>
              </div>
            </div>
          </section>
          {/* Chart/Thống kê sơ bộ */}
          <section id="stats" className="mb-10">
            <div className="text-xl font-bold text-yellow-700 dark:text-yellow-200 mb-4 flex items-center gap-2"><FiBarChart2 /> Thống kê sơ bộ</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 flex flex-col items-center justify-center min-h-[250px]">
                <div className="text-lg font-semibold mb-2">Biểu đồ số lượng người dùng</div>
                <div className="w-full h-40 flex items-center justify-center text-gray-400 dark:text-gray-600">[Chart Users Placeholder]</div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 flex flex-col items-center justify-center min-h-[250px]">
                <div className="text-lg font-semibold mb-2">Biểu đồ số lượng khoá học</div>
                <div className="w-full h-40 flex items-center justify-center text-gray-400 dark:text-gray-600">[Chart Courses Placeholder]</div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard; 