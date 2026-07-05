import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiGrid, FiList, FiStar, FiUsers, FiClock, FiBookOpen, FiAward } from 'react-icons/fi';
import Footer from '../components/Footer';
import CourseCard from '../components/CourseCard';
import CoursePopup from '../components/CoursePopup.jsx';
import BenefitsSection from '../components/BenefitsSection';
import TestimonialsSection from '../components/TestimonialsSection';
import { useLocation } from 'react-router-dom';
import { getAllCoursesList } from "../services/courseService";

const AllCourses = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const [gradeFilter, setGradeFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('default');
  const [isLoading, setIsLoading] = useState(true);
  const coursesPerPage = 12;

  // Lấy user từ localStorage
  const getUserGrade = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.grade || '';
    } catch {
      return '';
    }
  };

  // Fetch dữ liệu từ API
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const { courses: apiCourses } = await getAllCoursesList(token);

        console.log("📦 API Courses:", apiCourses);

        if (!Array.isArray(apiCourses)) {
          console.warn("⚠️ API không trả về mảng:", apiCourses);
          setCourses([]);
          return;
        }

        const mappedCourses = apiCourses.map((c) => ({
          id: c.id,
          title: c.title || "Chưa có tiêu đề",
          description: c.description || "",
          duration: c.duration || "",
          price:
            c.price && !isNaN(Number(c.price)) ? Number(c.price) : 0,
          grade: c.grade || "",
          subject: c.subject || "",
          image: c.image,
          studentsCount: Number.isFinite(c.students) ? c.students : 0,
          lessonsCount: c.lessonsCount || 0,
          rating: Number.isFinite(c.rating) ? c.rating : 0,
          teacher: {
            id: c.teacher?.id || null,
            name: c.teacher?.name || "Chưa rõ",
            email: c.teacher?.email || "",
            avatar:
              c.teacher?.avatar || "/assets/teacher-placeholder.jpg",
            experience: c.teacher?.experience || "",
            bio: c.teacher?.bio || "",
          },
          isFree: c.price === "0.00" || c.price === 0,
          isHot: false,
          isNew: false,
          isComingSoon: false,
          startDate: c.created_at,
          badge:
            c.price === "0.00" || c.price === 0 ? "Miễn phí" : null,
        }));

        setCourses(mappedCourses);
      } catch (err) {
        console.error("❌ Lỗi khi load courses:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Xử lý URL params và filter
  useEffect(() => {
    setIsLoading(true);

    const urlGrade = params.get('grade');
    const userGrade = getUserGrade();

    if (urlGrade) {
      setGradeFilter(urlGrade);
    } else if (userGrade) {
      setGradeFilter(userGrade);
    } else {
      setGradeFilter('');
    }

    const urlSubject = params.get('subject');
    if (urlSubject) {
      setSubjectFilter(urlSubject);
    } else {
      setSubjectFilter('');
    }

    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [location.search]);

  const handleGradeFilter = (grade) => {
    setGradeFilter(grade);
    setCurrentPage(1);

    const newUrl = new URL(window.location);
    if (grade) newUrl.searchParams.set('grade', grade);
    else newUrl.searchParams.delete('grade');
    window.history.replaceState({}, '', newUrl);
  };

  const handleSort = (sortType) => {
    setSortBy(sortType);
    setCurrentPage(1);
  };

  // Filter
  const filteredCourses = courses.filter((course) => {
    const matchGrade = !gradeFilter || course.grade === gradeFilter;
    const matchSubject = !subjectFilter || (course.subject && course.subject.toLowerCase() === subjectFilter.toLowerCase());
    const matchSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchGrade && matchSubject && matchSearch;
  });

  // Sort
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return (a.price || 0) - (b.price || 0);
      case 'price-desc':
        return (b.price || 0) - (a.price || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'students':
        return (b.students || 0) - (a.students || 0);
      case 'newest':
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      default:
        return 0;
    }
  });

  // Pagination
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = sortedCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(sortedCourses.length / coursesPerPage);
  const grades = [...new Set(courses.map((course) => course.grade))].filter(Boolean);

  // ⏳ Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 lg:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-8"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 lg:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Khám phá khóa học
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Chọn khóa học phù hợp với trình độ và mục tiêu học tập của bạn
          </p>
        </motion.div>

        {/* User Grade Notification */}
        {gradeFilter && getUserGrade() === gradeFilter && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center justify-center gap-3">
              <FiAward className="text-2xl text-primary" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Khóa học dành cho {gradeFilter}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Được tùy chỉnh phù hợp với trình độ của bạn
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 mb-8"
        >
          {/* Search Bar */}
          <div className="relative mb-8">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Tìm kiếm khóa học, môn học hoặc giảng viên..."
              className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-gray-600 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white transition-all duration-200"
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Tìm kiếm khóa học"
            />
          </div>

          {/* Grade Filter */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiBookOpen className="text-primary" />
              Lọc theo lớp học
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                className={`px-6 py-3 rounded-2xl border-2 font-semibold transition-all duration-200 ${
                  gradeFilter === '' 
                    ? 'bg-primary text-white border-primary shadow-lg' 
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary hover:text-primary'
                }`}
                onClick={() => handleGradeFilter('')}
                aria-label="Xem tất cả lớp"
              >
                Tất cả lớp
              </button>
              {grades.length > 0 ? (
                grades.map((grade) => {
                  const isUserGrade = getUserGrade() === grade;
                  const isSelected = gradeFilter === grade;
                  return (
                    <button
                      key={grade}
                      className={`px-6 py-3 rounded-2xl border-2 font-semibold transition-all duration-200 relative ${
                        isSelected 
                          ? 'bg-primary text-white border-primary shadow-lg' 
                          : isUserGrade
                          ? 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary hover:text-primary'
                      }`}
                      onClick={() => handleGradeFilter(grade)}
                      aria-label={`Lọc theo ${grade}`}
                    >
                      {grade}
                      {isUserGrade && !isSelected && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse"></span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="text-gray-500 dark:text-gray-400 text-sm">
                  Đang tải danh sách lớp...
                </div>
              )}
            </div>
          </div>

          {/* Sort and View Options */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <FiFilter className="text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Sắp xếp khóa học"
              >
                <option value="default">Mặc định</option>
                <option value="newest">Mới nhất</option>
                <option value="rating">Đánh giá cao nhất</option>
                <option value="students">Nhiều học viên nhất</option>
                <option value="price">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Hiển thị:</span>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-primary text-white shadow-lg' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                aria-label="Xem dạng lưới"
              >
                <FiGrid className="text-lg" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-primary text-white shadow-lg' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                aria-label="Xem dạng danh sách"
              >
                <FiList className="text-lg" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Course Statistics */}
        {gradeFilter && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-lg">
              <div className="text-3xl font-bold text-primary mb-2">{sortedCourses.length}</div>
              <div className="text-gray-600 dark:text-gray-400">Tổng khóa học</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-lg">
              <div className="text-3xl font-bold text-primary mb-2">
                {sortedCourses.filter(c => c.isHot).length}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Khóa học Hot</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-lg">
              <div className="text-3xl font-bold text-primary mb-2">
                {sortedCourses.filter(c => c.isNew).length}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Khóa học Mới</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-lg">
              <div className="text-3xl font-bold text-primary mb-2">
                {Math.round(sortedCourses.reduce((acc, c) => acc + (c.rating || 4.5), 0) / sortedCourses.length * 10) / 10}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Đánh giá TB</div>
            </div>
          </motion.div>
        )}

        {/* Courses Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-6"
          }
        >
          {currentCourses.length > 0 ? (
            currentCourses.map((course, index) => {
              let badge = course.badge;
              if (!badge) {
                if (course.isFree) badge = 'Miễn phí';
                else if (course.isHot) badge = 'Hot';
                else if (course.isNew) badge = 'Mới';
              }

              if (viewMode === 'list') {
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3 relative">
                        <img
                          src={course.image || (course.teacher && course.teacher.avatar) || '/assets/course-placeholder.jpg'}
                          alt={course.title}
                          className="w-full h-48 md:h-full object-cover"
                        />
                        {badge && (
                          <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                            {badge}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                              {course.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                              {course.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                              <span className="flex items-center gap-1">
                                <FiStar className="text-yellow-500" />
                                {course.rating || '4.5'}
                              </span>
                              <span className="flex items-center gap-1">
                                <FiUsers />
                                {course.students?.toLocaleString() || '1,000'} học viên
                              </span>
                              <span className="flex items-center gap-1">
                                <FiClock />
                                {course.duration || '12 bài học'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-primary">
                                {course.price ? `${course.price.toLocaleString()}đ` : 'Liên hệ'}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                • {course.teacher.name || 'Giảng viên'}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedCourse(course)}
                            className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors font-medium ml-4"
                            aria-label={`Xem chi tiết khóa học ${course.title}`}
                          >
                            Xem chi tiết
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <CourseCard
                    course={{
                      ...course,
                      badge,
                      image: course.image || (course.teacher && course.teacher.avatar)
                    }}
                    onRegister={(course) => setSelectedCourse(course)}
                  />
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-full text-center py-16"
            >
              <div className="text-8xl mb-6">📚</div>
              <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">
                Không tìm thấy khóa học
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {gradeFilter 
                  ? `Hiện tại chưa có khóa học nào cho ${gradeFilter}`
                  : 'Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                }
              </p>
              {gradeFilter && getUserGrade() === gradeFilter && (
                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 max-w-md mx-auto">
                  <p className="text-primary font-medium">
                    💡 Gợi ý: Bạn có thể xem khóa học của các lớp khác để mở rộng kiến thức
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mt-8"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Hiển thị {indexOfFirstCourse + 1}-{Math.min(indexOfLastCourse, sortedCourses.length)} trong tổng số {sortedCourses.length} khóa học
                {gradeFilter && getUserGrade() === gradeFilter && (
                  <span className="ml-2 text-primary font-medium">(Lớp của bạn)</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`px-4 py-2 border rounded-xl font-semibold transition-all duration-200 ${
                      currentPage === idx + 1 
                        ? 'bg-primary text-white border-primary shadow-lg' 
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary hover:text-primary'
                    }`}
                    aria-label={`Trang ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Additional Sections */}
        <div className="mt-16">
          <BenefitsSection />
        </div>
        <div className="mt-16">
          <TestimonialsSection />
        </div>
      </div>

      {selectedCourse && (
        <CoursePopup course={selectedCourse} onClose={() => setSelectedCourse(null)} />
      )}

      <Footer />
    </div>
  );
};

export default AllCourses;
