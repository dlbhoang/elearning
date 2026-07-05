import React from 'react';
import { FiFacebook, FiTwitter, FiInstagram, FiMail, FiPhone, FiMapPin, FiLinkedin, FiYoutube } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img src="/assets/icon_logo.png" alt="VTS Academy Logo" className="h-10 w-10 object-contain" />
              <div>
                <h3 className="text-xl font-bold text-white">VTS Academy</h3>
                <p className="text-sm text-gray-400">E-Learning Platform</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Nền tảng học tập trực tuyến hàng đầu, cung cấp các khóa học chất lượng cao cho mọi lứa tuổi.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <FiFacebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <FiTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <FiInstagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <FiLinkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <FiYoutube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Liên kết nhanh</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Trang chủ
                </a>
              </li>
              <li>
                <a href="/courses" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Khóa học
                </a>
              </li>
              <li>
                <a href="/lecturer" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Giảng viên
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Hỗ trợ</h4>
            <ul className="space-y-2">
              <li>
                <a href="/help" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Trung tâm trợ giúp
                </a>
              </li>
              <li>
                <a href="/faq" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Câu hỏi thường gặp
                </a>
              </li>
              <li>
                <a href="/tutorial" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Hướng dẫn sử dụng
                </a>
              </li>
              <li>
                <a href="/feedback" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Góp ý
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Liên hệ</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FiMail className="text-primary" size={16} />
                <span className="text-gray-400 text-sm">contact@vtsacademy.vn</span>
              </div>
              <div className="flex items-center space-x-3">
                <FiPhone className="text-primary" size={16} />
                <span className="text-gray-400 text-sm">+84 912 345 678</span>
              </div>
              <div className="flex items-start space-x-3">
                <FiMapPin className="text-primary mt-1" size={16} />
                <span className="text-gray-400 text-sm">
                  123 Đường ABC, Quận XYZ,<br />
                  TP. Hồ Chí Minh, Việt Nam
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} VTS Academy. Tất cả quyền được bảo lưu.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="/privacy-policy" className="text-gray-400 hover:text-primary transition-colors">
                Chính sách bảo mật
              </a>
              <a href="/terms-of-service" className="text-gray-400 hover:text-primary transition-colors">
                Điều khoản dịch vụ
              </a>
              <a href="/refund-policy" className="text-gray-400 hover:text-primary transition-colors">
                Chính sách hoàn tiền
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
