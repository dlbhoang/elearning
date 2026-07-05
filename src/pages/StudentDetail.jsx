import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FiArrowLeft, FiMail, FiBook, FiCreditCard, FiCalendar, FiCheckCircle, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import axios from 'axios';
import { baseUrl } from '../utils/api';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!localStorage.getItem('token') || user?.role !== 'teacher') {
      navigate('/login');
      return;
    }
    
    fetchStudentData();
  }, [id, navigate]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

      // Fetch student courses
      const response = await axios.get(`${API_BASE_URL}/enrollments/student/${id}/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("📨 API Response:", response);
      console.log("📊 Response Data:", response.data);
      console.log("🔢 Response Data Structure:", response.data?.data);

      const courseData = response.data?.data || response.data;
      console.log("✅ Course Data:", courseData);

      if (courseData && Array.isArray(courseData) && courseData.length > 0) {
        // Get unique student info from first record
        const studentInfo = courseData[0];
        console.log("👤 Student Info from first record:", studentInfo);
        
        setStudent({
          id: studentInfo.user_id,
          name: studentInfo.user_name,
          email: studentInfo.user_email,
          avatar: studentInfo.user_avatar,
          grade: studentInfo.grade,
        });
        setCourses(courseData);
      } else {
        console.warn("⚠️ Không có dữ liệu khóa học!");
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu học sinh:", error);
      Swal.fire("Lỗi", "Không thể tải thông tin học sinh", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async (enrollmentId, courseName) => {
    try {
      const result = await Swal.fire({
        title: 'Xác nhận duyệt thanh toán',
        text: `Duyệt thanh toán tiền mặt cho khóa học "${courseName}"?`,
        icon: 'question',
        showCancelButton: true,
        // Use project button classes for consistent styling
        buttonsStyling: false,
        customClass: {
          confirmButton: 'btn btn-success',
          cancelButton: 'btn btn-danger'
        },
        confirmButtonText: 'Duyệt',
        cancelButtonText: 'Hủy',
      });

      if (!result.isConfirmed) return;

      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

      const response = await axios.put(
        `${API_BASE_URL}/payments/approve/${enrollmentId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Approve response:", response.data);

      // Update courses state immediately
      const updatedCourses = courses.map(c => 
        c.enrollment_id === enrollmentId 
          ? { ...c, payment_status: 'success' }
          : c
      );
      setCourses(updatedCourses);

      Swal.fire('Thành công!', 'Duyệt thanh toán thành công', 'success');
      
      // Reload data from server để đảm bảo consistency
      setTimeout(() => fetchStudentData(), 500);
    } catch (error) {
      console.error("Lỗi duyệt thanh toán:", error);
      Swal.fire('Lỗi', 'Không thể duyệt thanh toán', 'error');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center pt-28">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Đang tải thông tin...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!student) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center pt-28">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Không tìm thấy học sinh</p>
            <button
              onClick={() => navigate('/manage-students')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Quay lại
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const totalCourses = courses.length;
  const paidCourses = courses.filter(c => c.payment_status === 'success').length;
  const totalAmount = courses.reduce((sum, c) => sum + (parseFloat(c.price) || 0), 0);
  const paidAmount = courses
    .filter(c => c.payment_status === 'success')
    .reduce((sum, c) => sum + (parseFloat(c.price) || 0), 0);

  console.log("💰 Financial Summary - Paid courses:", paidCourses, "Total:", totalAmount, "Paid:", paidAmount);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-28 pb-10 px-2 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Nút quay lại */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/manage-students')}
            className="flex items-center gap-2 mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <FiArrowLeft /> Quay lại
          </motion.button>

          {/* Card thông tin học sinh */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 mb-8"
          >
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-400 to-blue-200 dark:from-blue-700 dark:to-blue-400 p-2">
                <img
                  src={student.avatar || 'https://via.placeholder.com/128'}
                  alt={student.name}
                  className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-900"
                />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-4xl font-bold text-blue-700 dark:text-white mb-2">{student.name}</h1>
                <div className="flex flex-col gap-2 text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <FiMail className="text-blue-600" />
                    <span>{student.email}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <FiBook className="text-green-600" />
                    <span className="font-semibold">{student.grade}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Thống kê */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-lg text-center"
              >
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalCourses}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Khóa học</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-lg text-center"
              >
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{paidCourses}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Đã thanh toán</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 p-4 rounded-lg text-center"
              >
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{totalCourses - paidCourses}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Chờ thanh toán</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-4 rounded-lg text-center"
              >
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{paidAmount.toLocaleString()}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Đã chi</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Danh sách khóa học */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FiBook /> Các khóa học đã đăng ký
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-200 dark:divide-gray-700">
                <thead className="bg-blue-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-200 uppercase">Khóa học</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-200 uppercase">Môn học</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-200 uppercase">Giá</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-200 uppercase">Ngày đăng ký</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-200 uppercase">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-200 uppercase">Thanh toán</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-blue-100 dark:divide-gray-800">
                  {courses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        Học sinh chưa đăng ký khóa học nào
                      </td>
                    </tr>
                  ) : (
                    courses.map((course, idx) => (
                      <motion.tr
                        key={idx}
                        whileHover={{ backgroundColor: '#f0f9ff' }}
                        className="dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-200">
                          {course.course_title}
                        </td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                          {course.subject}
                        </td>
                        <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">
                          {parseFloat(course.price || 0).toLocaleString()}đ
                        </td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <FiCalendar className="text-gray-500" />
                          {new Date(course.enrolled_at).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            course.status === 'paid'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : course.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {course.status === 'paid' ? 'Đã kích hoạt' : course.status === 'pending' ? 'Chờ' : 'Chưa'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {course.payment_status === 'success' ? (
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                              <FiCheckCircle />
                              <span className="text-sm font-semibold">Đã thanh toán</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                                <FiClock />
                                <span className="text-sm font-semibold">Chờ duyệt</span>
                              </div>
                              <button
                                onClick={() => handleApprovePayment(course.enrollment_id, course.course_title)}
                                className="btn btn-success btn-sm"
                              >
                                Duyệt
                              </button>
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Tóm tắt tài chính */}
          {courses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8"
            >
              <h3 className="text-2xl font-bold text-blue-700 dark:text-white mb-6 flex items-center gap-2">
                <FiCreditCard /> Tóm tắt tài chính
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-6 rounded-xl"
                >
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold">Tổng chi phí</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                    {totalAmount.toLocaleString()}đ
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-6 rounded-xl"
                >
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold">Đã thanh toán</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                    {paidAmount.toLocaleString()}đ
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 p-6 rounded-xl"
                >
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold">Còn nợ</p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                    {(totalAmount - paidAmount).toLocaleString()}đ
                  </p>
                </motion.div>
              </div>
              {/* Send report to parent */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('token');
                      if (!token) throw new Error('Chưa đăng nhập');
                      const message = `Báo cáo học tập của ${student.name}: đã đăng ký ${totalCourses} khóa, đã thanh toán ${paidCourses} khóa, tổng đã chi ${paidAmount.toLocaleString()}đ.`;
                      const res = await axios.post(`${baseUrl}/notifications/send-parent`, { student_id: student.id, title: 'Báo cáo học tập', message }, { headers: { Authorization: `Bearer ${token}` } });
                      if (res.data?.status === 'success') {
                        Swal.fire('Đã gửi', 'Báo cáo đã được gửi tới phụ huynh (nếu có).', 'success');
                      } else {
                        Swal.fire('Lỗi', res.data?.message || 'Không thể gửi báo cáo', 'error');
                      }
                    } catch (err) {
                      console.error('Send parent error:', err);
                      Swal.fire('Lỗi', 'Không thể gửi báo cáo tới phụ huynh', 'error');
                    }
                  }}
                  className="btn btn-primary"
                >
                  Gửi báo cáo cho phụ huynh
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default StudentDetail; 