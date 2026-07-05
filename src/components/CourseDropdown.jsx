// src/components/CourseDropdown.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getAllCoursesList } from "../services/courseService";
import { Link } from "react-router-dom";

const dropdownVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const CourseDropdown = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const result = await getAllCoursesList(token);
          if (result.courses && Array.isArray(result.courses)) {
            // Lấy 6 khóa học đầu tiên
            setCourses(result.courses.slice(0, 6));
          }
        }
      } catch (error) {
        console.error('❌ Lỗi khi lấy danh sách khóa học:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <motion.div
        className="absolute left-0 mt-2 w-[500px] bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-xl z-50 p-4"
        initial="hidden"
        animate="visible"
        variants={dropdownVariants}
      >
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </motion.div>
    );
  }

  if (courses.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="absolute left-0 mt-2 w-[500px] bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-xl z-50 overflow-hidden"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={dropdownVariants}
      transition={{ duration: 0.3 }}
    >
      <div className="grid grid-cols-2 gap-4 p-4 max-h-96 overflow-y-auto">
        {courses.map((course) => (
          <Link
            key={course.id}
            to={`/courses/${course.id}`}
            className="flex items-start gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 p-3 rounded-lg transition-all duration-200 group"
          >
            <img
              src={course.image || course.teacher?.avatar || '/assets/course-placeholder.jpg'}
              alt={course.title}
              className="w-16 h-16 object-cover rounded-lg flex-shrink-0 group-hover:scale-105 transition-transform"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary transition-colors">
                {course.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {course.description || course.subject}
              </p>
              {course.price && (
                <p className="text-xs font-semibold text-primary mt-1">
                  {Number(course.price).toLocaleString()}đ
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900">
        <Link
          to="/all-courses"
          className="block text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Xem tất cả khóa học →
        </Link>
      </div>
    </motion.div>
  );
};

export default CourseDropdown;
