import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FiUser, FiCheckCircle, FiClock, FiLayers } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { getTeacherStudents } from '../services/examService';
import Swal from 'sweetalert2';

const getUniqueGrades = (students) => {
  const grades = students.map(s => s.grade).filter(Boolean);
  return Array.from(new Set(grades));
};

const StudentTable = ({ students, emptyText, animateKey, onApprove }) => (
  <div className="overflow-x-auto rounded-2xl shadow-lg bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 mb-10">
    <table className="min-w-full divide-y divide-blue-200 dark:divide-gray-700">
      <thead className="sticky top-0 z-10 bg-blue-100 dark:bg-gray-800">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-200 uppercase">Học sinh</th>
          <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-200 uppercase">Email</th>
          <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-200 uppercase">Lớp</th>
          <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-200 uppercase">Khoá học</th>
          <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-200 uppercase">Thanh toán</th>
          <th className="px-4 py-3"></th>
        </tr>
      </thead>
      <AnimatePresence mode="wait">
        <motion.tbody
          key={animateKey}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-gray-900 divide-y divide-blue-100 dark:divide-gray-800"
        >
          {students.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">{emptyText}</td>
            </tr>
          ) : (
            students.map((student) => (
              <motion.tr
                key={`${student.id}-${student.course_id}`}
                whileHover={{ scale: 1.02, backgroundColor: '#e0f2fe' }}
                className="transition-all"
              >
                <td className="px-4 py-3 flex items-center gap-3">
                  <span className="inline-block w-12 h-12 rounded-full bg-gradient-to-tr from-blue-400 to-blue-200 dark:from-blue-700 dark:to-blue-400 p-1">
                    <img 
                      src={student.avatar || 'https://via.placeholder.com/48'} 
                      alt={student.name} 
                      className="w-full h-full rounded-full object-cover border-2 border-white dark:border-gray-900" 
                    />
                  </span>
                  <span className="font-bold text-lg text-blue-800 dark:text-blue-200">{student.name}</span>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-base">{student.email}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-base">{student.grade}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-base text-sm">{student.course_title}</td>
                <td className="px-4 py-3">
                  {student.payment_status === 'success' ? (
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200 font-semibold text-sm shadow">
                      Đã thanh toán
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200 font-semibold text-sm shadow">
                      Chờ thanh toán
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <Link to={`/students/${student.id}`} className="px-4 py-1 bg-blue-600 text-white rounded-full font-semibold shadow hover:bg-blue-700 transition text-sm">
                    Chi tiết
                  </Link>
                </td>
              </motion.tr>
            ))
          )}
        </motion.tbody>
      </AnimatePresence>
    </table>
  </div>
);

const ManageStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState("Tất cả");
  const [animateKey, setAnimateKey] = useState(0);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (!token || !storedUser) {
        navigate('/login');
        return;
      }

      const user = JSON.parse(storedUser);
      if (user?.role !== 'teacher') {
        navigate('/login');
        return;
      }

      fetchStudents();
    } catch (err) {
      console.error('Storage access error:', err);
      // If storage access is blocked (e.g. privacy mode / iframe), redirect to login
      Swal.fire('Lỗi lưu trữ', 'Trình duyệt chặn truy cập bộ nhớ. Vui lòng bật cookie/storage hoặc đăng nhập lại.', 'error')
        .then(() => navigate('/login'));
      return;
    }
  }, [navigate]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await getTeacherStudents(token);
      setStudents(response.data || []);
    } catch (error) {
      console.error("Lỗi tải danh sách học sinh:", error);
      Swal.fire("Lỗi", "Không thể tải danh sách học sinh", "error");
    } finally {
      setLoading(false);
    }
  };

  const grades = ["Tất cả", ...getUniqueGrades(students)];

  const filteredStudents = selectedGrade === "Tất cả"
    ? students
    : students.filter(s => s.grade === selectedGrade);

  const paidStudents = filteredStudents.filter(s => s.payment_status === "success");
  const pendingStudents = filteredStudents.filter(s => s.payment_status !== "success");

  useEffect(() => {
    setAnimateKey(k => k + 1);
  }, [selectedGrade, students]);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-28 pb-10 px-2 sm:px-6">
        <div className="max-w-6xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-700 dark:text-white mb-8 text-center flex items-center gap-2 justify-center">
            <FiUser /> Quản lý học sinh
          </h1>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">Đang tải danh sách học sinh...</p>
            </div>
          ) : (
            <>
              {/* Dropdown chọn lớp */}
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
                <div className="flex items-center gap-2">
                  <FiLayers className="text-blue-600 dark:text-blue-300" />
                  <span className="font-semibold text-blue-700 dark:text-blue-200">Chọn lớp:</span>
                </div>
                <select
                  className="rounded-lg border-2 border-blue-300 dark:border-blue-700 px-5 py-2 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow transition-all"
                  value={selectedGrade}
                  onChange={e => setSelectedGrade(e.target.value)}
                >
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              {/* Học sinh đã thanh toán */}
              <h2 className="text-2xl font-bold mb-4 text-green-600 flex items-center gap-2">
                <FiCheckCircle /> Học sinh đã thanh toán ({paidStudents.length})
              </h2>
              <StudentTable
                students={paidStudents}
                emptyText="Không có học sinh đã thanh toán."
                animateKey={animateKey}
                onApprove={() => {}}
              />

              {/* Học sinh chờ thanh toán */}
              <h2 className="text-2xl font-bold mb-4 text-yellow-600 flex items-center gap-2">
                <FiClock /> Học sinh chờ thanh toán ({pendingStudents.length})
              </h2>
              <StudentTable
                students={pendingStudents}
                emptyText="Không có học sinh chờ thanh toán."
                animateKey={animateKey + 100}
                onApprove={() => {}}
              />
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ManageStudents;
