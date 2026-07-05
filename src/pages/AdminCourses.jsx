import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import { FiBookOpen, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { getAllCoursesList } from '../services/courseService';
import Swal from 'sweetalert2';

const AdminCourses = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!token || user?.role !== 'admin') {
      navigate('/login');
    } else {
      fetchCourses();
    }
  }, [navigate]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const result = await getAllCoursesList(token);
      if (result.courses && Array.isArray(result.courses)) {
        setCourses(result.courses);
      } else {
        setCourses([]);
      }
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách khóa học:', error);
      Swal.fire('Lỗi', 'Không thể tải danh sách khóa học', 'error');
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = search 
    ? courses.filter(course => 
        course.title?.toLowerCase().includes(search.toLowerCase()) ||
        course.teacher?.name?.toLowerCase().includes(search.toLowerCase()) ||
        course.subject?.toLowerCase().includes(search.toLowerCase())
      )
    : courses;

  if (isLoading) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-yellow-50 via-white to-yellow-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <AdminSidebar onLogout={() => { localStorage.clear(); navigate('/login'); }} />
        <div className="flex-1 flex flex-col min-h-screen">
          <AdminHeader onLogout={() => { localStorage.clear(); navigate('/login'); }} />
          <main className="flex-1 p-4 md:p-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-yellow-50 via-white to-yellow-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AdminSidebar onLogout={() => { localStorage.clear(); navigate('/login'); }} />
      <div className="flex-1 flex flex-col min-h-screen">
        <AdminHeader onLogout={() => { localStorage.clear(); navigate('/login'); }} />
        <main className="flex-1 p-4 md:p-10">
          <section className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-200 flex items-center gap-2">
                <FiBookOpen /> Quản lý khoá học
              </div>
              <button
                onClick={fetchCourses}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-lg"
                title="Làm mới"
              >
                <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
                Làm mới
              </button>
            </div>
            
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên khoá học, giáo viên hoặc môn học..."
                  className="pl-10 pr-4 py-2 w-full rounded-lg border border-purple-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-purple-800 dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Tổng: {filteredCourses.length} khóa học
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-purple-200 dark:divide-gray-700">
                  <thead className="bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-800 dark:to-purple-900">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Tên khoá học</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Môn học</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Lớp</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Giáo viên</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Giá</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Học viên</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-purple-100 dark:divide-gray-800">
                    {filteredCourses.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12">
                          <div className="flex flex-col items-center justify-center">
                            <div className="text-6xl mb-4">📚</div>
                            <p className="text-gray-500 dark:text-gray-400 text-lg">
                              {search ? 'Không tìm thấy khoá học nào phù hợp' : 'Chưa có khoá học nào'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredCourses.map((course, index) => (
                        <tr 
                          key={course.id} 
                          className="hover:bg-purple-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            #{course.id}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-purple-800 dark:text-purple-100">
                              {course.title}
                            </div>
                            {course.description && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                                {course.description}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {course.subject || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {course.grade || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {course.teacher?.avatar && (
                                <img 
                                  className="h-8 w-8 rounded-full mr-2" 
                                  src={course.teacher.avatar} 
                                  alt={course.teacher.name}
                                />
                              )}
                              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {course.teacher?.name || 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-purple-600 dark:text-purple-400">
                            {course.price ? `${Number(course.price).toLocaleString()}đ` : 'Miễn phí'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {course.students || 0} học viên
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminCourses; 