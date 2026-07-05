import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';

const ResultModal = ({ score, onClose, autoClose = 10 }) => {
  const [countdown, setCountdown] = useState(autoClose);

  useEffect(() => {
    if (countdown <= 0) {
      onClose();
      return;
    }

    const interval = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown, onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-5"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl p-10 max-w-lg w-full shadow-xl text-center"
        >
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheck className="text-4xl text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-5">Nộp bài thành công!</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Điểm của bạn: <span className="font-semibold text-xl">{score}</span>
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Trang sẽ tự động quay lại sau <span className="font-semibold">{countdown}</span> giây...
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ResultModal;
