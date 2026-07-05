import React from 'react';
import { motion } from 'framer-motion';
import { FiX, FiCalendar, FiClock, FiUser, FiBookOpen } from 'react-icons/fi';

const CoursePopup = ({ course, onClose }) => {
  if (!course) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
      <motion.div
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 relative"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
        >
          <FiX size={24} />
        </button>

        <div className="flex flex-col md:flex-row gap-6">
          <img
            src={course.image}
            alt={course.title}
            className="w-full md:w-56 h-56 object-cover rounded-xl shadow-md"
          />

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">{course.title}</h2>
            <p className="text-gray-600 mb-3 text-sm">{course.description}</p>

            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <FiClock className="text-indigo-500" />
                <span>Thời lượng: {course.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiBookOpen className="text-green-500" />
                <span>Lớp học: {course.grade}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiUser className="text-blue-500" />
                <span>Giáo viên: {course.teacher}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCalendar className="text-purple-500" />
                <span>Khai giảng: {course.startDate || 'Đang cập nhật'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800">Giá: {course.price}</span>
              </div>
            </div>

            {/* Lịch học chi tiết */}
            {course.schedule && (
              <div className="mt-4">
                <h4 className="font-semibold mb-1 text-sm text-gray-700">Lịch học chi tiết:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {course.schedule.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Nút đăng ký */}
            <button className="mt-6 w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-xl transition duration-200">
              Đăng ký ngay
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CoursePopup;
