import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import teachers from '../data/teacher.json';

// Lấy feedbacks từ tất cả giáo viên
const testimonials = teachers.flatMap(teacher =>
  (teacher.feedbacks || []).map(fb => ({
    name: fb.name,
    comment: fb.comment,
    image: fb.avatar,
    rating: fb.rating
  }))
);

const TestimonialsSection = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const { name, comment, image, rating } = testimonials[index];

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-r from-primary/10 via-white to-primary/20 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white mb-10"
        >
          💬 Cảm nhận từ học viên
        </motion.h2>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.6 }}
            className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-10 max-w-3xl mx-auto border border-gray-200 dark:border-gray-700"
          >
            {/* Quote icon */}
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
            
            <div className="relative">
              <img
                src={image || '/assets/user-placeholder.jpg'}
                alt={name}
                className="w-24 h-24 mx-auto rounded-full object-cover border-4 border-primary shadow-lg mb-6 hover:scale-105 transition-transform"
                onError={(e) => {
                  e.target.src = '/assets/user-placeholder.jpg';
                }}
              />
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 italic leading-relaxed mb-6">
                "{comment}"
              </p>
              <div className="flex justify-center space-x-1 mb-4">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <span 
                      key={i} 
                      className={`text-2xl transition-all ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
                    >
                      ★
                    </span>
                  ))}
              </div>
              <h4 className="font-semibold text-lg text-gray-900 dark:text-white">{name}</h4>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Optional: Indicator dots */}
        <div className="mt-6 flex justify-center space-x-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              className={`w-3 h-3 rounded-full ${
                index === i ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
              }`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
