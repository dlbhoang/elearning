import React from 'react';
import { FiInfo, FiGlobe, FiLock, FiUser, FiMail } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';

const sections = [
  {
    icon: <FiInfo className="text-blue-500 text-2xl" />, title: 'Mục đích thu thập thông tin',
    content: 'Chúng tôi thu thập thông tin cá nhân để phục vụ việc đăng ký, hỗ trợ học tập, nâng cao chất lượng dịch vụ và chăm sóc khách hàng.'
  },
  {
    icon: <FiGlobe className="text-green-500 text-2xl" />, title: 'Phạm vi sử dụng',
    content: 'Thông tin chỉ được sử dụng trong nội bộ VTS Academy, không chia sẻ cho bên thứ ba nếu không có sự đồng ý của bạn.'
  },
  {
    icon: <FiLock className="text-yellow-500 text-2xl" />, title: 'Bảo mật & lưu trữ',
    content: 'Dữ liệu cá nhân được bảo mật bằng các biện pháp kỹ thuật, chỉ lưu trữ trong thời gian cần thiết cho mục đích sử dụng.'
  },
  {
    icon: <FiUser className="text-purple-500 text-2xl" />, title: 'Quyền của người dùng',
    content: 'Bạn có quyền kiểm tra, cập nhật, yêu cầu xóa hoặc ngừng sử dụng thông tin cá nhân bất cứ lúc nào.'
  },
  {
    icon: <FiMail className="text-indigo-500 text-2xl" />, title: 'Liên hệ',
    content: 'Mọi thắc mắc về bảo mật, vui lòng liên hệ: contact@vtsacademy.vn hoặc số điện thoại hỗ trợ trên website.'
  }
];

const PrivacyPolicy = () => (
  <>
    <Header />
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-24 pb-10 px-2 sm:px-6">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 dark:text-white mb-8 text-center">Chính sách bảo mật</h1>
        <div className="space-y-8">
          {sections.map((sec, idx) => (
            <div key={idx} className="flex gap-4 items-start bg-blue-50 dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <div>{sec.icon}</div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{sec.title}</h2>
                <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">{sec.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <Footer />
  </>
);

export default PrivacyPolicy;
