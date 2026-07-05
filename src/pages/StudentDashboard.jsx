import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiTarget, FiUsers, FiShield, FiCheckCircle } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../utils/api";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const summaryData = {
    kpiCompletion: { rate: "0%", title: "TỈ LỆ HOÀN THÀNH KPI HỌC TẬP" },
    classesParticipated: { count: "0", title: "LỚP ĐÃ THAM GIA" },
    idpCompletion: { rate: "0%", title: "TỈ LỆ HOÀN THÀNH IDP" },
    exercisesCompleted: { count: "0/0", title: "BÀI TẬP ĐÃ HOÀN THÀNH" },
  };

  const getSubjectIcon = (subject) => {
    const iconMap = {
      Toán: "📐",
      Văn: "📖",
      Anh: "🌍",
      Lý: "⚡",
      Hóa: "🧪",
      Sinh: "🧬",
      Sử: "📚",
      Địa: "🌍",
      Tin: "💻",
      default: "📚",
    };
    return iconMap[subject] || iconMap.default;
  };

  // ==========================
  // LẤY COURSE ĐÃ ĐĂNG KÝ
  // ==========================
  const fetchEnrolledCourses = async () => {
    try {
      const res = await axios.get(`${baseUrl}/courses/me/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === "success") {
        const paidCourses = res.data.data.filter(
          (c) => c.payment_status === "success"
        );

        setEnrolledCourses(
          paidCourses.map((course, index) => ({
            ...course,
            teacherName: course.teacher?.name || "Giáo viên",
            teacherAvatar:
              course.teacher?.avatar || "/avatar-default.png",
            bgColor: index % 2 === 0 ? "bg-green-500" : "bg-blue-600",
            icon: getSubjectIcon(course.subject),
            lastLesson: `Bài ${Math.max(
              1,
              Math.floor(course.progress / 10)
            )}`,
            nextLesson: `Bài ${
              Math.floor(course.progress / 10) + 1
            }`,
          }))
        );
      }
    } catch (err) {
      console.error("❌ Lỗi fetch enrolled courses:", err);
    }
  };

  // ==========================
  // LẤY COURSE GỢI Ý
  // ==========================
  const fetchAvailableCourses = async () => {
    try {
      const grade = user.grade || "Lớp 10";
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/courses/grade/${grade}?page=1&limit=8`
      );

      if (rbaseUrl) {
        setAvailableCourses(
          res.data.data.map((course, index) => ({
            ...course,
            teacherName: course.teacher?.name || "Giáo viên",
            teacherAvatar:
              course.teacher?.avatar || "/avatar-default.png",
            icon: getSubjectIcon(course.subject),
            bgColor: [
              "bg-purple-500",
              "bg-orange-500",
              "bg-blue-500",
              "bg-green-500",
              "bg-red-500",
              "bg-indigo-500",
              "bg-pink-500",
              "bg-teal-500",
            ][index % 8],
          }))
        );
      }
    } catch (err) {
      console.error("❌ Lỗi fetch available courses:", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchEnrolledCourses();
      await fetchAvailableCourses();
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading)
    return (
      <p className="text-center mt-20 text-gray-500">
        Đang tải dữ liệu...
      </p>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold">
            Chào mừng, {user.fullName || "Học viên"} 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Tiếp tục hành trình học tập của bạn
          </p>
        </motion.div>

        {/* COURSE ĐÃ ĐĂNG KÝ */}
        <h2 className="text-2xl font-bold mb-6">
          Khóa học của bạn
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {enrolledCourses.length > 0 ? (
            enrolledCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow overflow-hidden"
              >
                <div className={`${course.bgColor} p-4`}>
                  <h3 className="text-xl font-bold text-white">
                    {course.title}
                  </h3>
                  <p className="text-white/90">
                    {course.subject} • {course.grade}
                  </p>
                </div>

                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={course.teacherAvatar}
                      className="w-12 h-12 rounded-full object-cover"
                      alt="teacher"
                    />
                    <div>
                      <p className="font-semibold">
                        {course.teacherName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {course.duration}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tiến độ</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    to={`/courses/${course.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Tiếp tục học →
                  </Link>
                </div>
              </motion.div>
            ))
          ) : (
            <p>Bạn chưa đăng ký khóa học nào.</p>
          )}
        </div>

        {/* COURSE GỢI Ý */}
        <h2 className="text-2xl font-bold mb-6">
          Khóa học gợi ý
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {availableCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow overflow-hidden"
            >
              <div className={`${course.bgColor} p-4`}>
                <h3 className="text-lg font-bold text-white">
                  {course.title}
                </h3>
              </div>

              <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={course.teacherAvatar}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium">
                      {course.teacherName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {course.duration}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-bold">
                    {course.price?.toLocaleString()}đ
                  </span>
                  <button
                    onClick={() => navigate(`/courses/${course.id}`)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
                  >
                    Đăng ký
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
