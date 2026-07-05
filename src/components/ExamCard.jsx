import React from 'react';
import { FiCalendar, FiClock, FiPlay, FiEye } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const ExamCard = ({ exam, setOpenResultId }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'missed': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{exam.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{exam.description}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(exam.status)}`}>
            {exam.status === 'upcoming' ? 'Sắp tới' : exam.status === 'completed' ? 'Hoàn thành' : 'Đã bỏ lỡ'}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div>{exam.teacher}</div>
          <div>{exam.classroom}</div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {exam.total_questions || exam.totalQuestions || 0}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Câu hỏi</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {exam.duration || 0}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Phút</div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <FiCalendar />
            {exam.date ? new Date(exam.date).toLocaleDateString('vi-VN') : 'Chưa xác định'}
          </div>
          <div className="flex items-center gap-1">
            <FiClock />{exam.time || 'Chưa xác định'}
          </div>
        </div>

        <div className="flex gap-2">
          {exam.isCompleted ? (
            <button onClick={() => setOpenResultId(exam.id)} className="flex-1 bg-green-500 text-white py-2 px-4 rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
              <FiEye /> Xem kết quả
            </button>
          ) : (
            <Link to={`/exam/${exam.id}`} className="flex-1 bg-primary text-white py-2 px-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
              <FiPlay /> Bắt đầu thi
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamCard;
