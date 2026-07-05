import React from 'react';
import { motion } from 'framer-motion';

const ResultDialog = ({ exams, openResultId, setOpenResultId }) => {
  const examResult = exams.find(e => e.id === openResultId);
  if (!examResult) return null;

  // Tính số câu đúng từ questions
  const correctAnswers = examResult.questions 
    ? examResult.questions.filter(q => q.correct).length 
    : 0;

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-lg w-full relative"
      >
        <button
          onClick={() => setOpenResultId(null)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl font-bold"
        >
          ✖
        </button>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Kết quả: {examResult.title}
          </h2>

          <div className="space-y-2 text-gray-700 dark:text-gray-300">
            <div className="flex justify-between">
              <span>Điểm:</span> 
              <span className={`font-bold ${getScoreColor(examResult.score)}`}>
                {examResult.score ?? 0}/{examResult.maxScore}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Số câu đúng:</span> 
              <span>{correctAnswers}/{examResult.totalQuestions}</span>
            </div>

            <div className="flex justify-between">
              <span>Thời gian làm:</span> 
              <span>{examResult.duration} phút</span>
            </div>

            {examResult.comment && (
              <div className="flex justify-between">
                <span>Nhận xét:</span> 
                <span className="font-medium">{examResult.comment}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ResultDialog;
