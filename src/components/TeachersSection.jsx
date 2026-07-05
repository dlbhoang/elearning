import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiBookOpen, FiMail, FiStar, FiAward, FiUsers, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import teachers from '../data/teacher.json';

const TeachersSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Hiển thị tất cả giáo viên thay vì chỉ 6 người
  const allTeachers = teachers;

  // Debug: Log để kiểm tra dữ liệu
  console.log('Teachers data:', allTeachers);
  console.log('Current index:', currentIndex);
  console.log('Current teacher:', allTeachers[currentIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allTeachers.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [allTeachers.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % allTeachers.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + allTeachers.length) % allTeachers.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Kiểm tra nếu không có dữ liệu
  if (!allTeachers || allTeachers.length === 0) {
    return (
      <section className="py-20 px-6 bg-gradient-to-br from-primary/5 via-white to-primary/10 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white mb-4"
          >
            👨‍🏫 Đội ngũ giảng viên xuất sắc
          </motion.h2>
          <div className="py-12">
            <div className="text-6xl mb-4">👨‍🏫</div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Chưa có thông tin giảng viên
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-primary/5 via-white to-primary/10 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white mb-4">
            👨‍🏫 Đội ngũ giảng viên xuất sắc
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Được giảng dạy bởi những giáo viên giàu kinh nghiệm, có chuyên môn cao và tâm huyết với nghề
          </p>
        </motion.div>

        <div className="relative">
          {/* Carousel Container */}
          <div className="relative overflow-hidden rounded-2xl shadow-2xl">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-12">
              <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                {/* Teacher Image */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
                  <img 
                    src={allTeachers[currentIndex].avatar || '/assets/teacher-placeholder.jpg'}
                    alt={allTeachers[currentIndex].name}
                    className="relative w-48 h-48 rounded-full object-cover border-4 border-primary shadow-xl group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = '/assets/teacher-placeholder.jpg';
                    }}
                  />
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-primary to-primary/80 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110">
                    <FiAward size={20} />
                  </div>
                </div>

                {/* Teacher Info */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
                    <FiStar className="text-yellow-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {allTeachers[currentIndex].experience} năm kinh nghiệm
                    </span>
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                    {allTeachers[currentIndex].name}
                  </h3>
                  
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 flex items-center justify-center lg:justify-start gap-2">
                    <FiBookOpen className="text-primary" />
                    {allTeachers[currentIndex].subject}
                  </p>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    {allTeachers[currentIndex].bio}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <FiUsers className="text-primary" />
                      <span>500+ học viên</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <FiBookOpen className="text-primary" />
                      <span>15+ khóa học</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex gap-3 justify-center lg:justify-start">
                    <Link 
                      to={`/teachers/${allTeachers[currentIndex].id}`}
                      className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition font-semibold"
                    >
                      Xem chi tiết
                    </Link>
                    <a 
                      href={`mailto:${allTeachers[currentIndex].email}`}
                      className="px-6 py-2 border border-primary text-primary rounded-full hover:bg-primary/10 transition font-semibold"
                    >
                      Liên hệ
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-10"
          >
            <FiArrowLeft className="text-primary" size={20} />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-10"
          >
            <FiArrowRight className="text-primary" size={20} />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-6 gap-2">
            {allTeachers.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? 'bg-primary scale-125' 
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
              />
            ))}
          </div>

          {/* Teacher counter */}
          <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
            Giảng viên {currentIndex + 1} trong tổng số {allTeachers.length} giảng viên
          </div>
        </div>

        {/* View All Teachers Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center mt-12"
        >
          <Link 
            to="/lecturer"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition font-semibold shadow-lg hover:shadow-xl"
          >
            <FiUsers size={20} />
            Xem tất cả giảng viên
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default TeachersSection; 