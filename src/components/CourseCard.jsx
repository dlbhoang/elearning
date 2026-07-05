import React, { useState } from 'react';
import { FiCalendar, FiUser, FiBookOpen, FiUsers, FiZap } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

const BADGE_MAP = {
  'Miễn phí': { color: 'bg-primary/10 text-primary', label: 'Miễn phí' },
  'Trả phí': { color: 'bg-primary/10 text-primary', label: 'Trả phí' },
  'Hot': { color: 'bg-red-100 text-red-600', label: 'Hot' },
  'Mới': { color: 'bg-green-100 text-green-700', label: 'Mới' },
  'Sắp khai giảng': { color: 'bg-gray-100 text-gray-700', label: 'Sắp khai giảng' },
};

const DEFAULT_IMAGE = '/assets/vite.svg';

const CourseCard = ({ course, onRegister }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [success, setSuccess] = useState(false);

  const handleRegister = (e) => {
    e.stopPropagation(); // Ngăn click card bị trigger
    setShowModal(true);
  };

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setShowModal(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
    if (onRegister) onRegister(course);
  };

  const handleCardClick = () => {
    navigate(`/courses/${course.id}`);
  };

  // Xử lý badge
  let badgeLabel = course.badge || course.tag;
  let badgeStyle = badgeLabel && BADGE_MAP[badgeLabel] ? BADGE_MAP[badgeLabel].color : '';
  if (!badgeLabel) {
    if (course.isFree) { badgeLabel = 'Miễn phí'; badgeStyle = BADGE_MAP['Miễn phí'].color; }
    else if (course.isHot) { badgeLabel = 'Hot'; badgeStyle = BADGE_MAP['Hot'].color; }
    else if (course.isNew) { badgeLabel = 'Mới'; badgeStyle = BADGE_MAP['Mới'].color; }
    else if (course.isComingSoon) { badgeLabel = 'Sắp khai giảng'; badgeStyle = BADGE_MAP['Sắp khai giảng'].color; }
  }

  const courseImage = course.image || course.teacher?.avatar || DEFAULT_IMAGE;
  const teacherName = course.teacher?.name || 'Giáo viên';
  const teacherId = course.teacher?.id;

  return (
    <div 
      onClick={handleCardClick}
      className="group bg-white dark:bg-gray-800 dark:text-gray-100 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-0 flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.025] cursor-pointer overflow-hidden relative"
    >
      <div className="relative">
        <img src={courseImage} alt={course.title} className="w-full h-44 object-cover rounded-t-3xl" />
        {badgeLabel && (
          <span className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full shadow-lg ${badgeStyle} z-10 flex items-center gap-1`}>
            {badgeLabel === 'Hot' && <FiZap className="text-red-500" />}
            {badgeLabel === 'Mới' && <FiBookOpen className="text-green-500" />}
            {badgeLabel === 'Miễn phí' && <span className="text-primary">FREE</span>}
            {badgeLabel}
          </span>
        )}
        {course.isComingSoon && course.startDate && (
          <span className="absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow z-10 flex items-center gap-1">
            <FiCalendar className="mr-1" /> {new Date(course.startDate).toLocaleDateString('vi-VN')}
          </span>
        )}
        <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-1 bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-lg px-4 py-2 backdrop-blur-md border border-primary/10 dark:border-primary/20 z-10">
          <h3 className="text-lg font-extrabold text-primary dark:text-primary line-clamp-1">{course.title}</h3>
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            {course.grade && <span className="bg-primary/10 text-primary px-2 py-1 rounded-full font-semibold">Lớp {course.grade}</span>}
            {course.duration && <span><FiCalendar className="inline mr-1" /> {course.duration}</span>}
            {course.lessonsCount !== undefined && (
              <span className="flex items-center gap-1"><FiBookOpen /> {course.lessonsCount} bài học</span>
            )}
            {course.studentsCount !== undefined && (
              <span className="flex items-center gap-1"><FiUsers /> {course.studentsCount} học viên</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-5 pt-6">
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3 transition-colors duration-300">{course.description}</p>
        <div className="flex items-center gap-2 mb-2">
          <FiUser className="text-primary" />
          {teacherId ? (
            <Link to={`/teachers/${teacherId}`} className="text-primary font-semibold hover:underline transition dark:text-primary/80">{teacherName}</Link>
          ) : (
            <span className="text-gray-600 dark:text-gray-400">{teacherName}</span>
          )}
        </div>
        <div className="flex items-end justify-between mt-auto gap-2">
          <span className="text-xl font-bold text-primary drop-shadow-lg bg-white/80 dark:bg-gray-900/80 px-4 py-1 rounded-full border border-primary/20">{course.price}</span>
          <button
            onClick={handleRegister}
            className="px-7 py-2 bg-primary hover:bg-primary/90 text-white text-base font-bold rounded-full shadow-xl transition-all duration-200 dark:bg-primary/80 dark:text-gray-900 dark:hover:bg-primary/60 focus:ring-2 focus:ring-primary/50 focus:outline-none"
          >
            Đăng ký ngay
          </button>
        </div>
      </div>

      {/* Modal đăng ký */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <form onSubmit={handleFormSubmit} className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col gap-4 border border-primary/20">
            <h2 className="text-xl font-bold text-primary mb-2 text-center">Đăng ký khoá học</h2>
            <input type="text" name="name" placeholder="Họ và tên" value={form.name} onChange={handleFormChange} required className="px-4 py-2 rounded-lg border border-primary focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"/>
            <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleFormChange} required className="px-4 py-2 rounded-lg border border-primary focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"/>
            <input type="tel" name="phone" placeholder="Số điện thoại" value={form.phone} onChange={handleFormChange} required className="px-4 py-2 rounded-lg border border-primary focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"/>
            <div className="flex gap-3 justify-end mt-2">
              <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-full font-semibold shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition">Huỷ</button>
              <button type="submit" className="px-5 py-2 bg-primary text-white rounded-full font-semibold shadow hover:bg-primary/90 transition">Xác nhận</button>
            </div>
          </form>
        </div>
      )}

      {/* Thông báo thành công */}
      {success && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] bg-primary text-white px-6 py-3 rounded-full shadow-lg font-semibold animate-bounceIn">
          Đăng ký thành công!
        </div>
      )}
    </div>
  );
};

export default CourseCard;
