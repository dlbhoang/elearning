import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiCalendar, FiCheckCircle, FiBookOpen, FiActivity, FiTarget, FiSearch, FiFilter, FiPlay, FiEye } from 'react-icons/fi';

import Footer from '../components/Footer';
import StatCard from '../components/StatCard.jsx';
import ExamCard from '../components/ExamCard.jsx';
import ResultDialog from '../components/ResultDialog.jsx';
import { getStudentExams } from '../services/examService';

const Exams = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const [error, setError] = useState(null);
  const [openResultId, setOpenResultId] = useState(null);

  const subjects = ['all', 'Toán', 'Văn', 'Anh', 'Lý', 'Hóa', 'Sinh', 'Sử', 'Địa', 'Vật lý', 'Ngữ văn', 'Lịch sử'];

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Vui lòng đăng nhập');
          return;
        }

        console.log('📋 Đang lấy danh sách bài thi cho học sinh...');
        const data = await getStudentExams(token);
        console.log('✅ Bài thi từ API:', data);
        
        // Nếu API trả về array trực tiếp
        if (Array.isArray(data)) {
          setExams(data);
        } else if (data.data && Array.isArray(data.data)) {
          setExams(data.data);
        } else {
          console.warn('⚠️ Dữ liệu bài thi không hợp lệ:', data);
          setExams([]);
        }
      } catch (err) {
        console.error('❌ Lỗi lấy bài thi:', err.message);
        setError(err.message || 'Không thể lấy danh sách bài thi');
        setExams([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExams();
  }, []);

  const filteredExams = exams.filter(exam => {
    const matchesSearch = (exam.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          exam.subject?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterSubject === 'all' || exam.subject === filterSubject;
    // Nếu không có status, xem như upcoming
    const examStatus = exam.status || 'upcoming';
    const matchesTab = activeTab === 'all' || examStatus === activeTab;
    return matchesSearch && matchesFilter && matchesTab;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 lg:pt-24 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 lg:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
            <p className="text-red-600 dark:text-red-400 text-lg">❌ {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 lg:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Thi & Kiểm tra</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">Quản lý và tham gia các bài thi, kiểm tra của bạn</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={<FiCalendar />} color="blue" label="Sắp tới" value={exams.filter(e => e.status === 'upcoming').length} />
          <StatCard icon={<FiCheckCircle />} color="green" label="Đã hoàn thành" value={exams.filter(e => e.status === 'completed').length} />
          <StatCard icon={<FiActivity />} color="yellow" label="Điểm TB" value={calculateAverageScore(exams)} />
          <StatCard icon={<FiTarget />} color="purple" label="Tổng số bài" value={exams.length} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Tìm kiếm bài thi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white transition-all duration-200"
              />
            </div>
            <div className="lg:w-48 relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-2xl text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>
                    {subject === 'all' ? 'Tất cả môn' : subject}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'upcoming', label: 'Sắp tới' },
            { id: 'completed', label: 'Đã hoàn thành' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Exams Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.length > 0 ? filteredExams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} setOpenResultId={setOpenResultId} />
          )) : (
            <div className="text-center py-16 col-span-full text-gray-500 dark:text-gray-400">
              Không tìm thấy bài thi
            </div>
          )}
        </motion.div>

      </div>

      <Footer />

      {openResultId && <ResultDialog exams={exams} openResultId={openResultId} setOpenResultId={setOpenResultId} />}
    </div>
  );
};

export default Exams;

const calculateAverageScore = (exams) => {
  const completed = exams.filter(e => e.isCompleted && e.score !== null);
  if (!completed.length) return 0;
  return (completed.reduce((acc, e) => acc + e.score, 0) / completed.length).toFixed(2);
};
