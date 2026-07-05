import React from 'react';
import { motion } from 'framer-motion';
import { FiBookOpen, FiUsers, FiTarget, FiTrendingUp, FiPlay, FiClock, FiAward } from 'react-icons/fi';

const HeroSection = () => {
  return (
    <section className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header với navigation */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-8">
            <a href="/" className="text-gray-700 dark:text-gray-300 font-medium hover:text-primary transition">Trang chủ</a>
            <a href="/courses" className="text-gray-700 dark:text-gray-300 font-medium hover:text-primary transition">Chương trình đào tạo</a>
            <a href="/classes" className="text-gray-700 dark:text-gray-300 font-medium hover:text-primary transition">Lớp học</a>
            <a href="/exams" className="text-gray-700 dark:text-gray-300 font-medium hover:text-primary transition">Thi - Kiểm tra</a>
            <a href="/library" className="text-gray-700 dark:text-gray-300 font-medium hover:text-primary transition">Thư viện</a>
            <a href="/live" className="text-gray-700 dark:text-gray-300 font-medium hover:text-primary transition">Live Class</a>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 dark:text-gray-300 font-medium">Phạm Thanh Sơn</span>
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
              P
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* KPI 1: TỈ LỆ HOÀN THÀNH KPI HỌC TẬP */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold opacity-90">TỈ LỆ HOÀN THÀNH KPI HỌC TẬP</h3>
              <FiTarget className="text-2xl opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-2">0%</div>
            <div className="text-sm opacity-90 mb-4">Số giờ học: 5/0</div>
            <div className="flex space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-3 h-3 bg-white/30 rounded-full"></div>
              ))}
            </div>
            <button className="text-sm font-medium bg-white/20 hover:bg-white/30 transition rounded-lg px-4 py-2">
              Chi tiết
            </button>
          </motion.div>

          {/* KPI 2: LỚP ĐÃ THAM GIA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold opacity-90">LỚP ĐÃ THAM GIA</h3>
              <FiUsers className="text-2xl opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-2">46</div>
            <div className="text-sm opacity-90 mb-4">Lớp học</div>
            <button className="text-sm font-medium bg-white/20 hover:bg-white/30 transition rounded-lg px-4 py-2">
              Chi tiết
            </button>
          </motion.div>

          {/* KPI 3: TỈ LỆ HOÀN THÀNH IDP */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold opacity-90">TỈ LỆ HOÀN THÀNH IDP</h3>
              <FiTrendingUp className="text-2xl opacity-80" />
            </div>
            <div className="text-2xl font-bold mb-1">2025</div>
            <div className="text-3xl font-bold mb-2">0%</div>
            <div className="text-sm opacity-90 mb-4">Hoàn thành 0/0 nội dung</div>
            <button className="text-sm font-medium bg-white/20 hover:bg-white/30 transition rounded-lg px-4 py-2">
              Chi tiết
            </button>
          </motion.div>

          {/* KPI 4: ATM */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold opacity-90">ATM</h3>
              <FiAward className="text-2xl opacity-80" />
            </div>
            <div className="text-sm opacity-90 mb-2">Quản lý sau đào tạo</div>
            <div className="text-sm opacity-90 mb-1">Lớp đã tạo hành động: 0/0</div>
            <div className="text-sm opacity-90 mb-4">Hoàn thành: 0/0</div>
            <button className="text-sm font-medium bg-white/20 hover:bg-white/30 transition rounded-lg px-4 py-2">
              Chi tiết
            </button>
          </motion.div>
        </div>

        {/* Classes in Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <div className="w-4 h-4 bg-primary rounded mr-3"></div>
            LỚP ĐANG HỌC (2) LỚP
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course Card 1 */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <FiBookOpen className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Sổ tay Văn bản Pháp luật</h3>
                    <p className="text-sm opacity-90">Chuyên đề 1</p>
                  </div>
                </div>
                <FiPlay className="text-2xl opacity-80" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FiClock className="text-sm opacity-80" />
                  <span className="text-sm opacity-90">Tiếp tục học</span>
                </div>
                <button className="text-sm font-medium bg-white/20 hover:bg-white/30 transition rounded-lg px-4 py-2">
                  Vào học
                </button>
              </div>
            </div>

            {/* Course Card 2 */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <FiAward className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">An toàn bảo mật thông tin</h3>
                    <p className="text-sm opacity-90">Chương trình</p>
                  </div>
                </div>
                <FiPlay className="text-2xl opacity-80" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FiClock className="text-sm opacity-80" />
                  <span className="text-sm opacity-90">Tiếp tục học</span>
                </div>
                <button className="text-sm font-medium bg-white/20 hover:bg-white/30 transition rounded-lg px-4 py-2">
                  Vào học
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="max-w-md mx-auto"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Type here to search"
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
