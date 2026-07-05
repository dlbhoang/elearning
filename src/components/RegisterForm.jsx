// src/components/Auth/RegisterForm.jsx
import React, { useState } from "react";
import { register } from "../services/authService";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaVenusMars,
  FaEye,
  FaEyeSlash,
  FaTimes,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { validateRegisterForm } from "../utils/validation";

const initialForm = {
  full_name: "",
  email: "",
  password: "",
  gender: "",
  phone: "",
  address: "",
  birthday: "",
  role: "student",
};

const RegisterForm = () => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const errors = validateRegisterForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const payload = {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone || null,
        gender: form.gender || null,
        birthday: form.birthday || null,
        address: form.address || null,
      };

      const res = await register(payload);
      console.log("Register response:", res);

      // ✅ Kiểm tra status đúng
      if (res.status === "success") {
        setShowSuccessModal(true);
      } else {
        setError(res.message || "Đăng ký thất bại");
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Đăng ký thất bại. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowSuccessModal(false);
    navigate("/login");
  };

  const labelClass =
    "font-bold text-gray-800 dark:text-white flex items-center gap-2";
  const inputClass =
    "w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white font-semibold";
  const selectClass =
    "p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold";

  return (
    <>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <AnimatePresence>
          {error && (
            <motion.div
              className="text-red-500 text-sm font-medium"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Họ tên */}
        <div className="flex flex-col gap-2">
          <label className={labelClass}>
            <FaUser className="text-blue-500" /> Họ tên{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="full_name"
            placeholder="Nhập họ tên"
            value={form.full_name}
            onChange={handleChange}
            className={`${inputClass} ${
              fieldErrors.full_name ? "border-red-400" : ""
            }`}
            autoComplete="name"
            required
          />
          <AnimatePresence>
            {fieldErrors.full_name && (
              <motion.div
                className="text-red-500 text-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {fieldErrors.full_name}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label className={labelClass}>
            <FaEnvelope className="text-blue-500" /> Email{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            placeholder="Nhập email"
            value={form.email}
            onChange={handleChange}
            className={`${inputClass} ${fieldErrors.email ? "border-red-400" : ""}`}
            autoComplete="email"
            required
          />
          <AnimatePresence>
            {fieldErrors.email && (
              <motion.div
                className="text-red-500 text-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {fieldErrors.email}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mật khẩu */}
        <div className="flex flex-col gap-2">
          <label className={labelClass}>
            <FaLock className="text-blue-500" /> Mật khẩu{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Tối thiểu 6 ký tự"
              value={form.password}
              onChange={handleChange}
              className={`${inputClass} ${
                fieldErrors.password ? "border-red-400" : ""
              } pr-10`}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-200 hover:text-blue-500"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <AnimatePresence>
            {fieldErrors.password && (
              <motion.div
                className="text-red-500 text-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {fieldErrors.password}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Giới tính + Ngày sinh */}
        <div className="flex gap-2">
          <div className="flex-1 flex flex-col gap-2">
            <label className={labelClass}>
              <FaVenusMars className="text-blue-500" /> Giới tính
            </label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className={selectClass}
            >
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <label className={labelClass}>
              <FaBirthdayCake className="text-blue-500" /> Ngày sinh
            </label>
            <input
              type="date"
              name="birthday"
              value={form.birthday}
              onChange={handleChange}
              className={`${inputClass} ${
                fieldErrors.birthday ? "border-red-400" : ""
              }`}
              placeholder="Ngày sinh"
            />
            <AnimatePresence>
              {fieldErrors.birthday && (
                <motion.div
                  className="text-red-500 text-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {fieldErrors.birthday}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Số điện thoại */}
        <div className="flex flex-col gap-2">
          <label className={labelClass}>
            <FaPhone className="text-blue-500" /> Số điện thoại
          </label>
          <input
            type="text"
            name="phone"
            placeholder="Nhập số điện thoại"
            value={form.phone}
            onChange={handleChange}
            className={`${inputClass} ${fieldErrors.phone ? "border-red-400" : ""}`}
            autoComplete="tel"
          />
          <AnimatePresence>
            {fieldErrors.phone && (
              <motion.div
                className="text-red-500 text-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {fieldErrors.phone}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Địa chỉ */}
        <div className="flex flex-col gap-2">
          <label className={labelClass}>
            <FaMapMarkerAlt className="text-blue-500" /> Địa chỉ
          </label>
          <input
            type="text"
            name="address"
            placeholder="Nhập địa chỉ"
            value={form.address}
            onChange={handleChange}
            className={inputClass}
            autoComplete="address"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-xl shadow hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2 mt-2"
          disabled={loading}
        >
          {loading && (
            <span className="loader border-2 border-t-2 border-green-200 border-t-white rounded-full w-5 h-5 animate-spin"></span>
          )}
          Đăng ký
        </button>
      </form>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal} // click ngoài modal là đóng
          >
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center max-w-sm w-full relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()} // tránh click trong modal đóng
            >
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={closeModal}
              >
                <FaTimes />
              </button>
              <h2 className="text-green-600 font-bold text-lg mb-2">
                🎉 Đăng ký thành công!
              </h2>
              <p className="text-gray-700 dark:text-gray-200">
                Vui lòng đăng nhập để tiếp tục.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RegisterForm;
