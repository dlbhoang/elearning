import React from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useDarkMode } from '../contexts/DarkModeContext';
import { motion } from 'framer-motion';

const DarkModeToggle = ({ className = "" }) => {
  const { darkMode, toggleDarkMode } = useDarkMode();

  const handleToggle = () => {
    try {
      toggleDarkMode();
    } catch (error) {
      console.error('Error toggling dark mode:', error);
    }
  };

  return (
    <motion.button
      onClick={handleToggle}
      className={`p-2 rounded-full bg-primary/10 dark:bg-primary/30 text-primary dark:text-yellow-200 shadow-lg hover:bg-primary/20 dark:hover:bg-primary/50 transition ${className}`}
      aria-label="Toggle dark mode"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        initial={false}
        animate={{ rotate: darkMode ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {darkMode ? <FiSun size={22} /> : <FiMoon size={22} />}
      </motion.div>
    </motion.button>
  );
};

export default DarkModeToggle; 