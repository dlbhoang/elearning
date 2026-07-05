import React from "react";
import { FaChalkboardTeacher, FaBookOpen, FaEnvelope } from "react-icons/fa";
import { motion } from "framer-motion";
import teachers from "../data/teacher.json";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const Lecturer = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <main className="flex-1 pt-28 pb-16 px-2">
        <div className="max-w-6xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-extrabold text-blue-700 dark:text-blue-300 mb-4 text-center flex items-center justify-center gap-3"
          >
            <FaChalkboardTeacher className="text-4xl" /> Đội ngũ giảng viên
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-lg text-gray-600 dark:text-gray-300 text-center mb-12 max-w-2xl mx-auto"
          >
            Đội ngũ giáo viên của VTS Academy là những người giàu kinh nghiệm, tận tâm và luôn sẵn sàng đồng hành cùng học viên trên con đường chinh phục tri thức.
          </motion.p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {teachers.map((teacher, idx) => (
              <motion.div
                key={teacher.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.5 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition p-6 flex flex-col items-center text-center"
              >
                <img
                  src={teacher.avatar}
                  alt={teacher.name}
                  className="w-28 h-28 object-cover rounded-full border-4 border-blue-200 dark:border-blue-700 shadow mb-4"
                />
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1 flex items-center gap-2">
                  {teacher.name}
                </h2>
                <div className="text-blue-600 dark:text-blue-400 font-semibold mb-2 flex items-center gap-2">
                  <FaBookOpen /> {teacher.specialty || teacher.subject || "Chuyên môn: Đa ngành"}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">{teacher.bio}</p>
                <div className="flex gap-3 justify-center">
                  {teacher.email && (
                    <a href={`mailto:${teacher.email}`} className="text-blue-500 hover:text-blue-700 transition" title="Gửi email">
                      <FaEnvelope size={20} />
                    </a>
                  )}
                  <Link
                    to={`/teachers/${teacher.id}`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition shadow"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Lecturer;
