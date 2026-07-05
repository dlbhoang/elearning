import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiBookOpen, FiUsers, FiClock, FiTarget } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { getMyCourses } from '../services/courseService';
import { baseUrl } from '../utils/api';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token'); // token lưu khi login
  const now = new Date();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch courses từ API
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        let myCourses = await getMyCourses(token);
        console.log('📚 My courses:', myCourses);
        
        // Fetch student count cho mỗi course
        myCourses = await Promise.all(myCourses.map(async (course) => {
          try {
            const url = `${baseUrl}/courses/${course.id}/students-count`;
            console.log(`📡 Fetching: ${url}`);
            const res = await fetch(url, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            console.log(`✅ Course ${course.id}: count=${data.count}, avgProgress=${data.avgProgress}`);
            return {
              ...course,
              students: data.count || 0,
              progress: data.avgProgress || 0
            };
          } catch (err) {
            console.error(`❌ Lỗi fetch student count cho course ${course.id}:`, err);
            return { ...course, students: 0, progress: 0 };
          }
        }));
        
        console.log('📊 Courses with student data:', myCourses);
        setCourses(myCourses);
      } catch (err) {
        console.error('❌ Lỗi fetch courses:', err);
      }
      setLoading(false);
    };
    fetchCourses();
  }, [token]);

  // Summary
  const summaryData = [
    { icon: <FiBookOpen />, title: "LỚP ĐANG GIẢNG DẠY", count: courses.length, bg: "from-purple-500 to-purple-600" },
    { icon: <FiUsers />, title: "TỔNG HỌC VIÊN", count: courses.reduce((acc, c) => acc + (c.students || 0), 0), bg: "from-blue-500 to-blue-600" },
    { icon: <FiClock />, title: "KHÓA HỌC TẠO", count: courses.length, bg: "from-green-500 to-green-600" },
    { icon: <FiTarget />, title: "TIẾN ĐỘ TRUNG BÌNH", count: `${Math.round(courses.reduce((acc, c) => acc + (c.progress || 0), 0) / (courses.length || 1))}%`, bg: "from-pink-500 to-pink-600" }
  ];

  // Finished courses
  const finishedCourses = courses.filter(course => new Date(course.created_at) < now);

  const renderCoursesGrid = (courses) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map(course => (
        <motion.div
          key={course.id}
          whileHover={{ scale: 1.03 }}
          className="relative rounded-2xl overflow-hidden shadow-lg cursor-pointer"
          onClick={() => navigate(`/teacher-courses/${course.id}`)}
        >
          <img 
            src={course.image} 
            alt={course.title} 
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-4 text-white">
            <h3 className="text-lg font-bold">{course.title}</h3>
            <p className="text-sm opacity-80">{course.subject} | {course.grade}</p>
            <p className="text-sm mt-1 opacity-80">Bắt đầu: {course.created_at?.split('T')[0]}</p>
          </div>
          <div className="absolute top-4 right-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
            {course.isHot ? "HOT" : course.isNew ? "NEW" : ""}
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 lg:pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Chào mừng, {user.name || 'giáo viên'}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Đây là tổng quan các lớp học và khóa học bạn đang giảng dạy.
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {summaryData.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * idx }}
              className={`rounded-2xl p-6 text-white shadow-lg bg-gradient-to-br ${item.bg} flex items-center gap-4`}
            >
              <div className="text-3xl">{item.icon}</div>
              <div>
                <h3 className="text-sm font-medium opacity-90">{item.title}</h3>
                <p className="text-2xl font-bold mt-1">{item.count}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Finished Courses */}
        <motion.div className="mt-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            KHÓA HỌC ĐÃ DẠY ({finishedCourses.length})
          </h2>
          {loading ? <p>Đang tải...</p> : finishedCourses.length > 0 ? renderCoursesGrid(finishedCourses) : (
            <p className="text-gray-600 dark:text-gray-400">Chưa có khóa học nào đã dạy</p>
          )}
        </motion.div>

        {/* All Teacher Courses */}
        <motion.div className="mt-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            TẤT CẢ KHÓA HỌC CỦA BẠN ({courses.length})
          </h2>
          {loading ? <p>Đang tải...</p> : courses.length > 0 ? renderCoursesGrid(courses) : (
            <p className="text-gray-600 dark:text-gray-400">Chưa có khóa học nào</p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
