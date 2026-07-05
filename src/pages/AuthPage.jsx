import React, { useState, useEffect } from 'react';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserGraduate, FaQuoteLeft } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import { googleLogin } from "../services/authService";

const tabVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const AuthPage = () => {
  const [tab, setTab] = useState('login');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/register') setTab('register');
    else setTab('login');
  }, [location.pathname]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    navigate(newTab === 'login' ? '/login' : '/register');
  };

  // ✅ gọi service thay vì fetch
  const handleGoogleSuccess = async (credentialResponse) => {
  try {
    const idToken = credentialResponse.credential;
    
    // 🔍 Debug log
    console.log("👉 Google credentialResponse:", credentialResponse);
    console.log("👉 Extracted idToken:", idToken);

    const data = await googleLogin(idToken);

    if (data.status === 'success') {
      const user = data.data.user;
      // Điều hướng theo role (dùng navigate thay vì reload)
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "teacher") navigate("/teacher-dashboard");
      else navigate("/student-dashboard");
    } else {
      console.error("Google login thất bại:", data.message);
    }
  } catch (err) {
    console.error("Google login error:", err);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-2 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-900 p-0 md:p-0 rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col md:flex-row overflow-hidden"
      >
        {/* Bên trái */}
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-blue-600 to-blue-400 dark:from-blue-900 dark:to-blue-700 text-white p-8 w-1/2 relative">
          <div>
            <img src="/assets/icon_logo.png" alt="Logo" className="h-12 mb-4 drop-shadow-xl" />
            <h2 className="text-2xl font-extrabold mb-2 tracking-tight">VTS Academy</h2>
            <p className="text-blue-100 text-sm mb-8">Nền tảng học tập toàn diện, giúp bạn nâng cao kiến thức mọi lúc, mọi nơi.</p>
          </div>
          <div className="mt-auto">
            <FaQuoteLeft className="text-2xl opacity-30 mb-2" />
            <p className="italic text-blue-100 text-base mb-4">“Học tập là chìa khóa mở ra cánh cửa thành công.”</p>
            <div className="flex items-center gap-2">
              <FaUserGraduate className="text-lg" />
              <span className="text-sm">Cùng VTS Academy chinh phục tri thức!</span>
            </div>
          </div>
        </div>

        {/* Bên phải */}
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
          {/* Tab */}
          <div className="flex justify-center mb-8">
            <button
              className={`flex-1 py-2 text-lg font-semibold transition border-b-2 ${tab === 'login' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-blue-600'}`}
              onClick={() => handleTabChange('login')}
            >
              Đăng nhập
            </button>
            <button
              className={`flex-1 py-2 text-lg font-semibold transition border-b-2 ${tab === 'register' ? 'border-green-600 text-green-600 dark:text-green-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-green-600'}`}
              onClick={() => handleTabChange('register')}
            >
              Đăng ký
            </button>
          </div>

          {/* Google login */}
          <div className="flex flex-col gap-3 mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.log('Google login failed')}
            />
          </div>

          {/* OR line */}
          <div className="relative flex items-center mb-6">
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />
            <span className="mx-4 text-gray-400 text-sm">hoặc</span>
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />
          </div>

          {/* Login/Register Form */}
          <AnimatePresence mode="wait">
            {tab === 'login' ? (
              <motion.div
                key="login"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <LoginForm />
              </motion.div>
            ) : (
              <motion.div
                key="register"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <RegisterForm />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
