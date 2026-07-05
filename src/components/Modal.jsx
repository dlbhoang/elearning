// src/components/Modal.jsx
import React from "react";
import { motion } from "framer-motion";

const Modal = ({ message }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center max-w-sm mx-2"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <h2 className="text-green-600 font-bold text-lg mb-2">{message}</h2>
      </motion.div>
    </motion.div>
  );
};

export default Modal;
