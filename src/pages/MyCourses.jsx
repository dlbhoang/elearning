import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';

const MyCourses = () => {
  const [tab, setTab] = useState('inprogress');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) navigate('/login');
    else fetchMyCourses();
  }, [navigate]);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

      // Fetch enrolled courses with payment status
      const response = await axios.get(`${API_BASE_URL}/courses/me/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.status === 'success') {
        // Chỉ hiển thị khóa học đã thanh toán
        const paidCourses = response.data.data.filter(c => c.payment_status === 'success');
        setCourses(paidCourses);
        console.log("✅ My courses fetched:", paidCourses.length);
      }
    } catch (error) {
      console.error("❌ Lỗi fetch khóa học:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.state && location.state.highlightCourseId) {
      setTimeout(() => {
        const el = document.getElementById('course-' + location.state.highlightCourseId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-4', 'ring-primary');
          setTimeout(() => el.classList.remove('ring-4', 'ring-primary'), 2000);
        }
      }, 300);
    }
  }, [location.state]);

  // Card hiển thị khóa học
  const CourseCard = ({ course, completed }) => (
    <div
      key={course.id}
      id={`course-${course.id}`}
      className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 flex gap-4 transition-all hover:shadow-lg"
    >
      {/* Hình ảnh khóa học */}
      <img
        src={course.image}
        alt={course.title}
        className="w-24 h-24 object-cover rounded-lg border"
      />

      <div className="flex-1">
        <div className={`text-lg font-bold mb-1 ${completed ? 'text-green-600' : 'text-primary'}`}>
          {course.title}
        </div>
        <div className="text-gray-600 dark:text-gray-300 text-sm mb-2">
          Giáo viên: {course.teacher?.name || 'Chưa cập nhật'}
        </div>

        {/* Progress */}
        {!completed ? (
          <>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: `${course.progress || 0}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Tiến độ: <span className="font-semibold text-primary">{course.progress || 0}%</span>
            </div>
          </>
        ) : (
          <div className="text-xs font-semibold text-green-600 mb-2">Hoàn thành 100%</div>
        )}

        {/* Button */}
        <button
          className={`mt-2 px-4 py-1 rounded-full font-semibold shadow transition text-sm ${
            completed
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-primary text-white hover:bg-primary/90'
          }`}
          onClick={() => navigate(`/courses/${course.id}`)}
        >
          {completed ? 'Xem chứng chỉ' : 'Xem chi tiết'}
        </button>
      </div>
    </div>
  );

  // Phân loại theo progress
  const inProgressCourses = courses.filter(c => (c.progress || 0) < 100);
  const completedCourses = courses.filter(c => (c.progress || 0) >= 100);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-28 pb-10 px-2 sm:px-6">
        <div className="max-w-5xl mx-auto py-10 px-4">
          <h2 className="text-2xl font-bold text-primary mb-6">Khoá học của tôi</h2>

          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">Đang tải khóa học...</p>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-4 mb-8">
                <button
                  className={`px-5 py-2 rounded-full font-semibold transition shadow ${
                    tab === 'inprogress'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'
                  }`}
                  onClick={() => setTab('inprogress')}
                >
                  Đang học
                </button>
                <button
                  className={`px-5 py-2 rounded-full font-semibold transition shadow ${
                    tab === 'completed'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'
                  }`}
                  onClick={() => setTab('completed')}
                >
                  Đã hoàn thành
                </button>
              </div>

              {/* Đang học */}
              {tab === 'inprogress' && (
                <>
                  {inProgressCourses.length === 0 ? (
                    <div className="text-gray-500 text-center py-10">
                      Bạn chưa bắt đầu khoá học nào.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {inProgressCourses.map(course => (
                        <CourseCard key={course.id} course={course} completed={false} />
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Đã hoàn thành */}
              {tab === 'completed' && (
                <>
                  {completedCourses.length === 0 ? (
                    <div className="text-gray-500 text-center py-10">
                      Bạn chưa hoàn thành khoá học nào.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {completedCourses.map(course => (
                        <CourseCard key={course.id} course={course} completed={true} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyCourses;
