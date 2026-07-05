// src/components/ChatbotWindow.jsx
import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { getAllCoursesList } from '../services/courseService';

const ChatbotWindow = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { text: "Xin chào! Tôi có thể giúp gì cho bạn?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          setLoading(true);
          const result = await getAllCoursesList(token);
          if (result.courses && Array.isArray(result.courses)) {
            setCourses(result.courses);
          }
        }
      } catch (error) {
        console.error('❌ Lỗi khi lấy danh sách khóa học:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  const getBotReply = (msg) => {
    const text = msg.toLowerCase();
    
    // Thống kê khoá học
    if (text.includes('bao nhiêu khoá học') || text.includes('thống kê khoá học') || text.includes('có bao nhiêu khóa')) {
      return `Hệ thống hiện có ${courses.length} khoá học.`;
    }
    
    // Tìm khóa học
    if (text.includes('khóa học') || text.includes('khóa') || text.includes('course')) {
      const searchTerm = msg.split('khóa học')[1]?.trim() || msg.split('khóa')[1]?.trim() || msg.split('course')[1]?.trim();
      if (searchTerm) {
        const found = courses.filter(c => 
          c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.subject?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (found.length > 0) {
          const list = found.slice(0, 5).map(c => `- ${c.title} (${c.subject})`).join('\n');
          return `Tìm thấy ${found.length} khóa học:\n${list}${found.length > 5 ? '\n...và nhiều khóa học khác' : ''}`;
        }
        return `Không tìm thấy khóa học nào với từ khóa "${searchTerm}".`;
      }
      return `Hiện có ${courses.length} khóa học. Bạn muốn tìm khóa học nào?`;
    }
    
    // Thống kê theo môn học
    if (text.includes('môn học') || text.includes('môn')) {
      const subjects = [...new Set(courses.map(c => c.subject).filter(Boolean))];
      return `Hệ thống có các môn học sau: ${subjects.join(', ')}.`;
    }
    
    // Thống kê theo lớp
    if (text.includes('lớp') || text.includes('grade')) {
      const grades = [...new Set(courses.map(c => c.grade).filter(Boolean))];
      return `Hệ thống có khóa học cho các lớp: ${grades.join(', ')}.`;
    }
    
    // Mặc định
    return "Tôi có thể giúp bạn tìm khóa học, thống kê, hoặc thông tin về hệ thống. Hãy hỏi tôi bất cứ điều gì!";
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { text: input, sender: "user" }];
    setMessages(newMessages);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { text: getBotReply(input), sender: "bot" },
      ]);
    }, 600);
  };

  return (
    <div className="fixed bottom-24 right-6 w-96 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden z-50 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h2 className="font-semibold text-lg">Trợ lý học tập</h2>
            {loading && (
              <p className="text-xs text-blue-100">Đang tải dữ liệu...</p>
            )}
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="hover:bg-white/20 rounded-lg p-2 transition-colors"
          aria-label="Đóng"
        >
          <FaTimes />
        </button>
      </div>
      
      {/* Messages */}
      <div className="p-4 h-80 overflow-y-auto space-y-3 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === "bot" ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`text-sm p-3 rounded-2xl max-w-[85%] shadow-sm ${
                msg.sender === "bot"
                  ? "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
                  : "bg-blue-600 text-white"
              }`}
            >
              {msg.text.split('\n').map((line, i) => (
                <div key={i} className={i > 0 ? 'mt-1' : ''}>{line}</div>
              ))}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-700 p-3 rounded-2xl shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Input */}
      <div className="flex border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập câu hỏi..."
          className="flex-1 px-4 py-3 text-sm outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400"
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="bg-blue-600 text-white px-5 hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Gửi
        </button>
      </div>
    </div>
  );
};

export default ChatbotWindow;
