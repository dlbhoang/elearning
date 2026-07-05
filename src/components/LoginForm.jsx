// src/components/Auth/LoginForm.jsx
import React, { useState } from "react";
import { login } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Modal from "./Modal.jsx"; // Component modal custom

const LoginForm = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login(form); // Gọi API thật
      if (res.token) {
        setModalMessage("Đăng nhập thành công!");
        setShowModal(true);

        setTimeout(() => {
          setShowModal(false);
          // Điều hướng theo role
          const role = res.user.role;
          if (role === "admin") navigate("/admin");
          else if (role === "teacher") navigate("/teacher-dashboard");
          else if (role === "student") navigate("/student-dashboard");
          else navigate("/");
        }, 1500);
      } else {
        setError(res.message || "Đăng nhập thất bại");
        setModalMessage(res.message || "Đăng nhập thất bại");
        setShowModal(true);
        setTimeout(() => setShowModal(false), 1500);
      }
    } catch (err) {
      setError("Đăng nhập thất bại. Vui lòng thử lại.");
      setModalMessage("Đăng nhập thất bại. Vui lòng thử lại.");
      setShowModal(true);
      setTimeout(() => setShowModal(false), 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <AnimatePresence>
            <motion.div
              className="text-red-500 dark:text-red-400 text-sm font-medium"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {error}
            </motion.div>
          </AnimatePresence>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          autoComplete="username"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Mật khẩu"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          autoComplete="current-password"
          required
        />

        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded hover:bg-primary/90 transition font-semibold flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading && (
            <span className="loader border-2 border-t-2 border-primary border-t-white rounded-full w-5 h-5 animate-spin"></span>
          )}
          Đăng nhập
        </button>
      </form>
      <AnimatePresence>
        {showModal && <Modal message={modalMessage} />}
      </AnimatePresence>
    </>
  );
};

export default LoginForm;
