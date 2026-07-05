import React, { useState, useRef, useEffect } from 'react';
import { FiMenu, FiX, FiChevronDown, FiBookOpen, FiUser, FiHome, FiMail, FiLogIn, FiLogOut, FiEdit3, FiLayers, FiFileText, FiAward, FiStar, FiTrendingUp,FiUsers, FiClipboard,FiBell, FiBellOff} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { getAllCoursesList } from '../services/courseService';
import axios from 'axios';
import { baseUrl } from '../utils/api';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [showSubjects, setShowSubjects] = useState(false);
  const [hoveredGrade, setHoveredGrade] = useState(null);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef(null);
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);

  // Lấy danh sách lớp học từ API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const result = await getAllCoursesList(token);
          if (result.courses && Array.isArray(result.courses)) {
            setCourses(result.courses);
            const uniqueGrades = [...new Set(result.courses.map(c => c.grade).filter(Boolean))];
            setGrades(uniqueGrades);
          }
        }
      } catch (error) {
        console.error('❌ Lỗi khi lấy danh sách khóa học:', error);
      }
    };
    fetchCourses();
  }, []);

  // Lấy danh sách môn học theo lớp đã chọn
  const subjectsByGrade = hoveredGrade && courses.length > 0
    ? [...new Set(courses.filter(course => course.grade === hoveredGrade).map(course => course.subject).filter(Boolean))]
    : [];

  // Notifications are fetched from the server; remove mock data

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleCourses = () => setCoursesOpen(prev => !prev);
  const toggleNotification = () => setNotificationOpen(prev => !prev);

  // Function để kiểm tra trạng thái đăng nhập
  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsLoggedIn(true);
      try {
        const userData = JSON.parse(user);
        setUserRole(userData?.role || null);
        setUserName(userData?.name || '');
    } catch {
        setUserRole(null);
        setUserName('');
      }
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
      setUserName('');
    }
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập khi component mount
    checkLoginStatus();
    
    // Đóng dropdown khi click ngoài
    const handleClick = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Kiểm tra trạng thái đăng nhập định kỳ
  useEffect(() => {
    const interval = setInterval(() => {
      checkLoginStatus();
    }, 1000); // Kiểm tra mỗi giây

    return () => clearInterval(interval);
  }, []);

  // Lắng nghe sự thay đổi của localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        setIsLoggedIn(true);
        try {
          const userData = JSON.parse(user);
          setUserRole(userData?.role || null);
          setUserName(userData?.name || '');
        } catch {
          setUserRole(null);
          setUserName('');
        }
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
        setUserName('');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setCoursesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notificationList, setNotificationList] = useState([]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`${baseUrl}/notifications`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data?.status === 'success') {
        const data = res.data.data || [];
        // Map to include icon and human-friendly time (server may provide created_at)
        const mapped = data.map(n => ({
          ...n,
          icon: n.type === 'exam_reminder' ? '📝' : n.type === 'new_lesson' ? '🎓' : n.type === 'grading' ? '✅' : '🔔',
          time: n.created_at ? new Date(n.created_at).toLocaleString('vi-VN') : ''
        }));
        setNotificationList(mapped);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

 const handleNotificationClick = async (id) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;
    // Optimistic update
    setNotificationList(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    const res = await axios.post(`${baseUrl}/notifications/mark-read`, { notification_id: id }, { headers: { Authorization: `Bearer ${token}` } });
    if (res.data?.status !== 'success') {
      // revert if failed
      setNotificationList(prev => prev.map(n => n.id === id ? { ...n, isRead: false } : n));
    } else {
      const notif = notificationList.find(n => n.id === id);
      setSelectedNotification(notif || null);
    }
  } catch (err) {
    console.error('Error marking notification read:', err);
  }
};

  // Fetch notifications on mount and when dropdown opens
  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (notificationOpen) fetchNotifications();
  }, [notificationOpen]);
  return (
    <header className={`w-full fixed top-0 left-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl shadow-2xl border-b border-gray-200/30 dark:border-gray-700/30' 
        : 'bg-white dark:bg-gray-900 shadow-lg border-b border-gray-100 dark:border-gray-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 lg:h-24">
          {/* Logo Section */}
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <img 
                src="/assets/icon_logo.png" 
                alt="VTS Academy Logo" 
                className="relative h-12 w-12 lg:h-14 lg:w-14 object-contain transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" 
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 via-primary to-gray-700 dark:from-white dark:via-primary dark:to-gray-300 bg-clip-text text-transparent">
                VTS Academy
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center gap-1">
                <FiStar className="text-primary text-xs" />
                Nền tảng học tập chuyên nghiệp
              </p>
            </div>
        </div>

<nav className="hidden lg:flex items-center space-x-1">
  {userRole === 'student' ? (
    // Student Navigation
    <>
      <Link 
        to="/student-dashboard" 
        className="px-6 py-3 rounded-2xl text-gray-700 dark:text-gray-300 font-semibold hover:text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300 flex items-center gap-3 group"
      >
        <FiTrendingUp className="text-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
        Dashboard
      </Link>
      
      <Link 
        to="/all-courses" 
        className="px-6 py-3 rounded-2xl text-gray-700 dark:text-gray-300 font-semibold hover:text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300 flex items-center gap-3 group"
      >
        <FiBookOpen className="text-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
        Chương trình đào tạo
      </Link>
      
      <Link 
        to="/my-courses" 
        className="px-6 py-3 rounded-2xl text-gray-700 dark:text-gray-300 font-semibold hover:text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300 flex items-center gap-3 group"
      >
        <FiUsers className="text-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
        Lớp học
      </Link>
      
      <Link 
        to="/exams" 
        className="px-6 py-3 rounded-2xl text-gray-700 dark:text-gray-300 font-semibold hover:text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300 flex items-center gap-3 group"
      >
        <FiClipboard className="text-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
        Thi-kiểm tra
      </Link>
    </>
  ) : userRole === 'teacher' ? (
    // Teacher Navigation
    <>
      <Link 
        to="/teacher-dashboard" 
        className="px-6 py-3 rounded-2xl text-purple-700 dark:text-purple-300 font-semibold hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-purple-500/5 transition-all duration-300 flex items-center gap-3 group"
      >
        <FiTrendingUp className="text-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
        Dashboard GV
      </Link>

      <Link 
        to="/manage-students" 
        className="px-6 py-3 rounded-2xl text-purple-700 dark:text-purple-300 font-semibold hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-purple-500/5 transition-all duration-300 flex items-center gap-3 group"
      >
        <FiUsers className="text-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
        Quản lý học sinh
      </Link>

      <Link 
        to="/manage-exams" 
        className="px-6 py-3 rounded-2xl text-purple-700 dark:text-purple-300 font-semibold hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-purple-500/5 transition-all duration-300 flex items-center gap-3 group"
      >
        <FiFileText className="text-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
        Quản lý bài tập
      </Link>

      <Link 
        to="/teaching-courses" 
        className="px-6 py-3 rounded-2xl text-purple-700 dark:text-purple-300 font-semibold hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-purple-500/5 transition-all duration-300 flex items-center gap-3 group"
      >
        <FiLayers className="text-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
        Khóa học đang dạy
      </Link>
    </>
  ) : (
    // Default Navigation (guest or other roles)
    <>
      <Link 
        to="/" 
        className="px-6 py-3 rounded-2xl text-gray-700 dark:text-gray-300 font-semibold hover:text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300 flex items-center gap-3 group"
      >
        <FiHome className="text-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
        Trang chủ
      </Link>
      <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleCourses}
                    className="px-6 py-3 rounded-2xl text-gray-700 dark:text-gray-300 font-semibold hover:text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300 flex items-center gap-3 group"
            >
                    <FiBookOpen className="text-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
              Khóa học
                    <FiChevronDown size={18} className={`transition-all duration-300 ${coursesOpen ? 'rotate-180 scale-110' : ''}`} />
            </button>
            <AnimatePresence>
              {coursesOpen && (
                <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="absolute left-0 top-full mt-3 bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 rounded-3xl shadow-2xl w-80 z-30 backdrop-blur-xl overflow-hidden"
                      >
                        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 font-bold text-gray-800 dark:text-gray-200 bg-gradient-to-r from-primary/15 to-primary/5">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/20 rounded-xl">
                              <FiAward className="text-primary text-xl" />
                            </div>
                            <div>
                              <div className="text-lg">Khóa học theo Lớp</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 font-normal">Chọn lớp học phù hợp</div>
                            </div>
                          </div>
                  </div>
                        <div className="p-4">
                    {grades.map(grade => (
                      <button
                        key={grade}
                              className="block w-full text-left px-6 py-4 rounded-2xl text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary transition-all duration-300 font-semibold group"
                        onClick={() => {
                          setCoursesOpen(false);
                          navigate(`/all-courses?grade=${encodeURIComponent(grade)}`);
                        }}
                      >
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        {grade}
                              </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

                <Link 
                  to="/contact" 
                  className="px-6 py-3 rounded-2xl text-gray-700 dark:text-gray-300 font-semibold hover:text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300 flex items-center gap-3 group"
                >
                  <FiMail className="text-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
            Liên hệ
          </Link>
              </>
            )}
        </nav>

        <div className="flex items-center space-x-4">
            {isLoggedIn && (userRole === 'student' || userRole === 'teacher') && (
              <div className="relative" ref={notificationRef}>
               <button 
  onClick={toggleNotification}
  className="relative w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center rounded-2xl bg-gradient-to-r from-yellow-500/20 to-yellow-500/10 dark:from-yellow-500/30 dark:to-yellow-500/20 text-yellow-600 dark:text-yellow-400 shadow-xl hover:shadow-2xl hover:from-yellow-500/30 hover:to-yellow-500/20 transition-all duration-300 focus:outline-none group transform hover:scale-105"
>
  {notificationList.filter(n => !n.isRead).length === 0 ? (
    <FiBellOff className="text-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
  ) : (
    <FiBell className="text-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
  )}
  {notificationList.filter(n => !n.isRead).length > 0 && (
    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
      {notificationList.filter(n => !n.isRead).length}
    </span>
  )}
</button>
                <AnimatePresence>
                  {notificationOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.9 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="absolute right-0 mt-4 w-80 bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 rounded-3xl shadow-2xl z-50 backdrop-blur-xl overflow-hidden"
                    >
                      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-yellow-500/15 to-yellow-500/5">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-gray-800 dark:text-white text-lg">Thông báo</h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {notificationList.filter(n => !n.isRead).length} mới
                          </span>
                        </div>
                      </div>
                      
                      <div className="max-h-96 overflow-y-auto">
                        {notificationList.length > 0 ? (
                          notificationList.map((notification) => (
                            <div
                              key={notification.id}
                              className={`px-6 py-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                                !notification.isRead ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                              }`}
                              onClick={() => handleNotificationClick(notification.id)} // Thêm dòng này
                            >
                              <div className="flex items-start gap-3">
                                <div className="text-2xl">{notification.icon}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                      {notification.title}
                                    </h4>
                                    {!notification.isRead && (
                                      <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                                    )}
                                  </div>
                                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {notification.time}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-6 py-8 text-center">
                            <div className="text-4xl mb-2">🔕</div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                              Không có thông báo mới
                            </p>
                          </div>
                        )}
          </div>
                      {/* Hiển thị chi tiết thông báo */}
                      {selectedNotification && (
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: 20 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
  >
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full p-8 relative border border-gray-200 dark:border-gray-700">
      <button
        className="absolute top-3 right-3 text-gray-400 hover:text-primary text-xl"
        onClick={() => setSelectedNotification(null)}
        aria-label="Đóng"
      >
        ×
      </button>
      <div className="flex flex-col items-center gap-3 mb-4">
        <div className="text-5xl">{selectedNotification.icon}</div>
        <h4 className="font-bold text-gray-900 dark:text-white text-lg text-center">{selectedNotification.title}</h4>
      </div>
      <p className="text-gray-700 dark:text-gray-300 text-base mb-4 text-center">{selectedNotification.message}</p>
      <span className="block text-xs text-gray-500 dark:text-gray-400 text-center">{selectedNotification.time}</span>
    </div>
  </motion.div>
)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          {!isLoggedIn ? (
              <Link 
                to="/login" 
                className="px-8 py-3 bg-gradient-to-r from-primary via-primary to-primary/90 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:from-primary/90 hover:to-primary/80 transition-all duration-300 font-bold flex items-center gap-3 group transform hover:scale-105"
              >
                <FiLogIn className="text-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
              Đăng nhập
            </Link>
          ) : (
            <div className="relative" ref={userDropdownRef}>
              <button
                  className="px-6 py-3 bg-gradient-to-r from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 text-primary rounded-2xl shadow-xl hover:shadow-2xl hover:from-primary/30 hover:to-primary/20 transition-all duration-300 focus:outline-none group transform hover:scale-105 flex items-center gap-3"
                onClick={() => setUserDropdownOpen((v) => !v)}
                aria-label="Tài khoản"
              >
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300 hidden sm:block">
                    {userName || 'User'}
                  </span>
                  <FiChevronDown size={16} className={`transition-all duration-300 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.9 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="absolute right-0 mt-4 w-72 bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 rounded-3xl shadow-2xl z-50 backdrop-blur-xl overflow-hidden"
                    >
                      <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-primary/15 to-primary/5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/80 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                            {userName ? userName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 dark:text-white text-lg">{userName || 'User'}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                              <FiAward className="text-primary" />
                              {userRole === 'student' ? 'Học viên xuất sắc' : userRole === 'teacher' ? 'Giáo viên' : 'Admin'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="py-4">
                        <Link to="/profile" className="flex items-center gap-4 px-8 py-4 text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary transition-all duration-300 group">
                          <div className="p-2 bg-primary/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                            <FiUser className="text-lg" />
                          </div>
                          <span className="font-semibold">Thông tin cá nhân</span>
                  </Link>
                      
                      
                  {userRole === 'teacher' && (
                    <>
                            <Link to="/manage-students" className="flex items-center gap-4 px-8 py-4 text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-purple-500/5 hover:text-purple-600 transition-all duration-300 group">
                              <div className="p-2 bg-purple-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <FiUser className="text-lg" />
                              </div>
                              <span className="font-semibold">Quản lý học sinh</span>
                      </Link>
                            <Link to="/manage-exercises" className="flex items-center gap-4 px-8 py-4 text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-purple-500/5 hover:text-purple-600 transition-all duration-300 group">
                              <div className="p-2 bg-purple-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <FiFileText className="text-lg" />
                              </div>
                              <span className="font-semibold">Quản lý bài tập</span>
                      </Link>
                            <Link to="/teaching-courses" className="flex items-center gap-4 px-8 py-4 text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-green-500/5 hover:text-green-600 transition-all duration-300 group">
                              <div className="p-2 bg-green-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <FiLayers className="text-lg" />
                              </div>
                              <span className="font-semibold">Khóa học đang dạy</span>
                      </Link>
                    </>
                  )}
                        <div className="border-t border-gray-100 dark:border-gray-700 mt-4 pt-4">
                  <button
                            className="flex items-center gap-4 w-full px-8 py-4 text-red-600 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-red-500/5 hover:text-red-700 transition-all duration-300 group"
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      setIsLoggedIn(false);
                      setUserDropdownOpen(false);
                      if (userRole === 'student') {
                        navigate('/');
                      } else {
                        window.location.reload();
                      }
                    }}
                  >
                            <div className="p-2 bg-red-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                              <FiLogOut className="text-lg" />
                            </div>
                            <span className="font-semibold">Đăng xuất</span>
                  </button>
                </div>
                      </div>
                    </motion.div>
              )}
                </AnimatePresence>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="lg:hidden">
              <button 
                onClick={toggleMenu} 
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-300 hover:text-primary hover:from-primary/10 hover:to-primary/5 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
              {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50"
          >
            <div className="px-6 py-8 space-y-6">
              {userRole === 'student' ? (
                <>
                  <Link 
                    to="/student-dashboard" 
                    className="flex items-center gap-4 px-6 py-4 rounded-2xl text-gray-700 dark:text-gray-200 font-semibold hover:text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300"
                    onClick={() => setMenuOpen(false)}
                  >
                    <div className="p-2 bg-primary/20 rounded-xl">
                      <FiTrendingUp className="text-xl" />
                    </div>
                    <span className="text-lg">Dashboard</span>
                  </Link>
                  <Link 
                    to="/all-courses" 
                    className="flex items-center gap-4 px-6 py-4 rounded-2xl text-gray-700 dark:text-gray-200 font-semibold hover:text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300"
                    onClick={() => setMenuOpen(false)}
                  >
                    <div className="p-2 bg-primary/20 rounded-xl">
                      <FiBookOpen className="text-xl" />
                    </div>
                    <span className="text-lg">Chương trình đào tạo</span>
                  </Link>
                  
                  <Link 
                    to="/my-courses" 
                    className="flex items-center gap-4 px-6 py-4 rounded-2xl text-gray-700 dark:text-gray-200 font-semibold hover:text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300"
                    onClick={() => setMenuOpen(false)}
                  >
                    <div className="p-2 bg-primary/20 rounded-xl">
                      <FiUsers className="text-xl" />
                    </div>
                    <span className="text-lg">Lớp học</span>
                  </Link>
                  
                  <Link 
                    to="/exams" 
                    className="flex items-center gap-4 px-6 py-4 rounded-2xl text-gray-700 dark:text-gray-200 font-semibold hover:text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300"
                    onClick={() => setMenuOpen(false)}
                  >
                    <div className="p-2 bg-primary/20 rounded-xl">
                      <FiClipboard className="text-xl" />
                    </div>
                    <span className="text-lg">Thi-kiểm tra</span>
                  </Link>
                </>
              ) : (
                // Default Mobile Navigation for non-students
                <>
                  <Link 
                    to="/" 
                    className="flex items-center gap-4 px-6 py-4 rounded-2xl text-gray-700 dark:text-gray-200 font-semibold hover:text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300"
                    onClick={() => setMenuOpen(false)}
                  >
                    <div className="p-2 bg-primary/20 rounded-xl">
                      <FiHome className="text-xl" />
                    </div>
                    <span className="text-lg">Trang chủ</span>
              </Link>
              
                  <div className="space-y-4">
                    <div className="px-6 py-3 font-bold text-gray-700 dark:text-gray-200 flex items-center gap-4">
                      <div className="p-2 bg-primary/20 rounded-xl">
                        <FiBookOpen className="text-xl text-primary" />
                      </div>
                      <span className="text-lg">Khóa học</span>
                </div>
                    <div className="pl-16 space-y-2">
                      {grades.slice(0, 6).map(grade => (
                    <Link
                      key={grade}
                      to={`/all-courses?grade=${encodeURIComponent(grade)}`}
                          className="block px-6 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300 font-medium"
                      onClick={() => setMenuOpen(false)}
                    >
                      {grade}
                    </Link>
                  ))}
                </div>
              </div>

                  <Link 
                    to="/contact" 
                    className="flex items-center gap-4 px-6 py-4 rounded-2xl text-gray-700 dark:text-gray-200 font-semibold hover:text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300"
                    onClick={() => setMenuOpen(false)}
                  >
                    <div className="p-2 bg-primary/20 rounded-xl">
                      <FiMail className="text-xl" />
                    </div>
                    <span className="text-lg">Liên hệ</span>
              </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
