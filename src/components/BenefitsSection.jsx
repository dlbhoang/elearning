import React from "react";
import { FaChalkboardTeacher, FaLaptopCode, FaCertificate, FaClock } from "react-icons/fa";

const benefits = [
  {
    icon: <FaChalkboardTeacher size={32} className="text-primary" />,
    title: "Giảng viên chất lượng",
    desc: "Đội ngũ giảng viên dày dặn kinh nghiệm và tận tâm.",
  },
  {
    icon: <FaLaptopCode size={32} className="text-green-600" />,
    title: "Thực hành liên tục",
    desc: "Các bài tập thực hành, dự án thực tế xuyên suốt khóa học.",
  },
  {
    icon: <FaCertificate size={32} className="text-primary" />,
    title: "Chứng chỉ hoàn thành",
    desc: "Nhận chứng chỉ sau khi kết thúc khóa học.",
  },
  {
    icon: <FaClock size={32} className="text-purple-600" />,
    title: "Linh hoạt thời gian",
    desc: "Học mọi lúc, mọi nơi theo lịch cá nhân.",
  },
];

const BenefitsSection = () => {
  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900" id="benefits">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">Lợi ích khi tham gia khóa học</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-md hover:shadow-lg transition">
              <div className="mb-4">{b.icon}</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white">{b.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
