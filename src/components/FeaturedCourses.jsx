import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { getAllCoursesList } from '../services/courseService';

const tagColors = {
  'Mới': 'bg-green-100 text-green-700',
  'Hot': 'bg-red-100 text-red-700',
  'Miễn phí': 'bg-blue-100 text-blue-700',
};

const tagIcons = {
  'Mới': '🆕',
  'Hot': '🔥',
  'Miễn phí': '🎁',
};

const getTag = (course) => course.badge || course.tag || (course.isHot && 'Hot') || (course.isNew && 'Mới') || (course.isFree && 'Miễn phí');

const FeaturedCourses = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const coursesPerView = 3;
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (token) {
          const result = await getAllCoursesList(token);
          if (result.courses && Array.isArray(result.courses)) {
            // Lấy 9 khóa học đầu tiên để hiển thị
            setCourses(result.courses.slice(0, 9));
          }
        }
      } catch (error) {
        console.error('❌ Lỗi khi lấy danh sách khóa học:', error);
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourses();
  }, []);
  
  const totalPages = Math.ceil(courses.length / coursesPerView);

  // Auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % totalPages);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [totalPages]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalPages) % totalPages);
  };

  const getCurrentCourses = () => {
    const startIndex = currentIndex * coursesPerView;
    return courses.slice(startIndex, startIndex + coursesPerView);
  };
  
  if (isLoading) {
    return (
      <section className="bg-gradient-to-br from-primary/10 to-primary/20 dark:from-gray-900 dark:to-gray-800 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto mb-12"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  if (courses.length === 0) {
    return null;
  }

  return (
    <section className="bg-gradient-to-br from-primary/10 to-primary/20 dark:from-gray-900 dark:to-gray-800 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white text-center"
        >
          🌟 Tất cả khóa học
        </motion.h2>
        <p className="mt-3 text-gray-600 dark:text-gray-400 text-center max-w-xl mx-auto">
          Khám phá tất cả các khóa học chất lượng, giúp bạn đạt mục tiêu học tập nhanh hơn.
        </p>

        <div className="mt-12 relative">
          {/* Navigation buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          >
            <FiChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          >
            <FiChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Courses container */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="flex gap-6 md:grid md:grid-cols-3 md:gap-8"
              >
                {getCurrentCourses().map((course, index) => {
                  const tag = getTag(course);
                  const courseImage = course.image || course.teacher?.avatar || '/assets/course-placeholder.jpg';
                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                      className="min-w-[280px] md:min-w-0 bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition flex-shrink-0 transform hover:scale-[1.015]"
                    >
                      <div className="relative group">
                        <img
                          src={courseImage}
                          alt={course.title}
                          className="w-full h-48 object-cover rounded-t-2xl transition-transform duration-300 group-hover:scale-105"
                        />
                        {tag && (
                          <span
                            className={`absolute top-3 left-3 text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1 shadow ${tagColors[tag] || 'bg-primary/10 text-primary'}`}
                          >
                            <span>{tagIcons[tag] || '⭐'}</span> {tag}
                          </span>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white line-clamp-2">{course.title}</h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-2">
                          {course.description || 'Khóa học chất lượng cao'}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-primary font-semibold">
                            {course.price ? `${Number(course.price).toLocaleString()}đ` : 'Miễn phí'}
                          </span>
                          {course.teacher?.name && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {course.teacher.name}
                            </span>
                          )}
                        </div>
                        <Link
                          to={`/courses/${course.id}`}
                          className="mt-4 inline-flex items-center text-sm text-primary font-semibold hover:underline"
                        >
                          Xem chi tiết <FiArrowRight className="ml-1" />
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Pagination dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-primary scale-125' 
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
              />
            ))}
          </div>

          {/* Course counter */}
          {courses.length > 0 && (
            <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
              Hiển thị {currentIndex * coursesPerView + 1}-{Math.min((currentIndex + 1) * coursesPerView, courses.length)} trong tổng số {courses.length} khóa học
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
