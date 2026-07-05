import React from 'react';
import { FiShield, FiUserCheck, FiUsers, FiLock, FiMail } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';

const sections = [
  {
    icon: <FiShield className="text-blue-500 text-2xl" />, title: 'Giới thiệu',
    content: 'Điều khoản dịch vụ này quy định việc sử dụng nền tảng học tập trực tuyến VTS Academy. Khi sử dụng dịch vụ, bạn đồng ý tuân thủ các điều khoản dưới đây.'
  },
  {
    icon: <FiUserCheck className="text-green-500 text-2xl" />, title: 'Quyền và nghĩa vụ người dùng',
    content: 'Người dùng cần cung cấp thông tin chính xác, bảo mật tài khoản, không sử dụng dịch vụ cho mục đích vi phạm pháp luật, tôn trọng quyền sở hữu trí tuệ và các quy định của nền tảng.'
  },
  {
    icon: <FiUsers className="text-purple-500 text-2xl" />, title: 'Quyền và nghĩa vụ của nền tảng',
    content: 'VTS Academy có quyền thay đổi nội dung, tạm ngưng hoặc chấm dứt dịch vụ, bảo vệ dữ liệu người dùng, hỗ trợ giải đáp thắc mắc và xử lý vi phạm.'
  },
  {
    icon: <FiLock className="text-yellow-500 text-2xl" />, title: 'Chính sách bảo mật',
    content: 'Chúng tôi cam kết bảo mật thông tin cá nhân, không chia sẻ cho bên thứ ba nếu không có sự đồng ý của bạn, trừ trường hợp theo quy định pháp luật.'
  },
  {
    icon: <FiMail className="text-indigo-500 text-2xl" />, title: 'Liên hệ',
    content: 'Mọi thắc mắc về điều khoản, vui lòng liên hệ: contact@vtsacademy.vn hoặc số điện thoại hỗ trợ trên website.'
  }
];

const TermsOfService = () => (
  <>
    <Header />
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-24 pb-10 px-2 sm:px-6">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 dark:text-white mb-8 text-center">Điều khoản dịch vụ</h1>
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

export default TermsOfService;
