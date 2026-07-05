import React, { useState } from "react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebook, FaInstagram, FaUser, FaCommentDots } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Vui lòng nhập đầy đủ họ tên, email và nội dung.");
      return;
    }
    setError("");
    setSent(true);
    setTimeout(() => setSent(false), 2500);
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center pt-20 lg:pt-24 pb-12 px-2">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-4xl w-full flex flex-col md:flex-row overflow-hidden"
      >
        {/* Left: Info */}
        <div className="md:w-1/2 p-8 flex flex-col justify-between bg-gradient-to-br from-blue-600 to-blue-400 dark:from-blue-900 dark:to-blue-700 text-white">
          <div>
            <h2 className="text-3xl font-extrabold mb-2 tracking-tight">Liên hệ VTS Academy</h2>
            <p className="mb-6 text-blue-100">Chúng tôi luôn sẵn sàng lắng nghe ý kiến và hỗ trợ bạn!</p>
            <div className="space-y-4 text-base">
              <div className="flex items-center gap-3"><FaEnvelope /> contact@hoctot.vn</div>
              <div className="flex items-center gap-3"><FaPhone /> +84 912 345 678</div>
              <div className="flex items-center gap-3"><FaMapMarkerAlt /> 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</div>
            </div>
          </div>
          <div className="mt-8 flex gap-4">
            <a href="https://facebook.com/hoctot" target="_blank" rel="noopener noreferrer" className="hover:text-blue-200"><FaFacebook size={24} /></a>
            <a href="https://instagram.com/hoctot" target="_blank" rel="noopener noreferrer" className="hover:text-pink-200"><FaInstagram size={24} /></a>
          </div>
        </div>
        {/* Right: Form */}
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
          <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2"><FaCommentDots /> Gửi liên hệ</h3>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-700 dark:text-white flex items-center gap-2"><FaUser /> Họ tên <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="name"
                placeholder="Nhập họ tên"
                value={form.name}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white font-semibold"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-700 dark:text-white flex items-center gap-2"><FaEnvelope /> Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                name="email"
                placeholder="Nhập email"
                value={form.email}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white font-semibold"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-700 dark:text-white flex items-center gap-2"><FaPhone /> Số điện thoại</label>
              <input
                type="text"
                name="phone"
                placeholder="Nhập số điện thoại"
                value={form.phone}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white font-semibold"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-700 dark:text-white flex items-center gap-2"><FaCommentDots /> Nội dung <span className="text-red-500">*</span></label>
              <textarea
                name="message"
                placeholder="Nhập nội dung liên hệ..."
                value={form.message}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white font-semibold min-h-[100px]"
                required
              />
            </div>
            <AnimatePresence>
              {error && (
                <motion.div className="text-red-500 text-sm font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{error}</motion.div>
              )}
              {sent && (
                <motion.div className="text-green-600 text-sm font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm.</motion.div>
              )}
            </AnimatePresence>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-xl shadow hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2 mt-2"
              disabled={sent}
            >
              Gửi liên hệ
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactPage; 