import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import CourseInfo from "../components/CourseInfo";
import ChapterList from "../components/ChapterList.jsx";
import ProgressBar from "../components/ProgressBar";
import { getCourseById, getCourseChapters, getCourseProgress } from "../services/courseService";
import { checkEnrollment } from "../services/authService.js";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openResultId, setOpenResultId] = useState(null);
  const [courseProgress, setCourseProgress] = useState(0);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        console.log("🔍 Course ID:", id);
        console.log("🔑 Token:", token);

        // ===== COURSE =====
        const courseData = await getCourseById(id, token);
        console.log("📦 API getCourseById response:", courseData);
        setCourse(courseData);

        // ===== CHAPTERS =====
        const chaptersData = await getCourseChapters(id, token);
        console.log("📚 API getCourseChapters response:", chaptersData);
        setChapters(chaptersData || []);

        // ===== ENROLLMENT =====
        const enrollmentData = await checkEnrollment(id);
        console.log("💳 API checkEnrollment response:", enrollmentData);

        /**
         * Ví dụ backend trả:
         * {
         *   status: "success",
         *   enrollment_status: "paid"
         * }
         */
        setEnrollmentStatus(enrollmentData?.enrollment_status || null);

        // ===== PROGRESS =====
        try {
          const progressData = await getCourseProgress(id, token);
          console.log("📊 Course progress:", progressData);
          console.log("🔢 Progress value:", progressData?.progress);
          setCourseProgress(progressData?.progress || 0);
        } catch (progressErr) {
          console.warn("⚠️ Lỗi lấy progress:", progressErr);
        }
      } catch (error) {
        console.error("❌ Lỗi tải dữ liệu khóa học:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
    
    // Auto-refresh progress mỗi 5 giây
    const progressInterval = setInterval(async () => {
      try {
        const token = localStorage.getItem("token");
        const progressData = await getCourseProgress(id, token);
        setCourseProgress(progressData?.progress || 0);
      } catch (err) {
        console.warn("⚠️ Lỗi auto-refresh progress:", err);
      }
    }, 5000);

    return () => clearInterval(progressInterval);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-700 dark:text-gray-300">Đang tải...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow text-center">
          <h2 className="text-2xl font-bold mb-4">
            Không tìm thấy khóa học
          </h2>
          <button
            className="mt-4 px-6 py-2 bg-primary text-white rounded-xl"
            onClick={() => navigate("/my-courses")}
          >
            Quay lại danh sách khóa học
          </button>
        </div>
      </div>
    );
  }

  // pending hoặc paid thì được học
  const canAccessLessons =
    enrollmentStatus === "pending" || enrollmentStatus === "paid";

  console.log("✅ enrollmentStatus:", enrollmentStatus);
  console.log("✅ canAccessLessons:", canAccessLessons);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 lg:pt-24">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          className="flex items-center gap-2 text-primary font-medium mb-6 hover:underline"
          onClick={() => navigate("/my-courses")}
        >
          <FiArrowLeft />
          Quay lại danh sách khóa học
        </button>

        {/* PROGRESS BAR */}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* COURSE INFO */}
          <div className="lg:col-span-1">
            <CourseInfo
              course={course}
              courseProgress={courseProgress}
              initialEnrollmentStatus={enrollmentStatus}
              onEnroll={(status) => {
                console.log("🟢 onEnroll callback:", status);
                setEnrollmentStatus(status);
              }}
            />
          </div>

          {/* CHAPTER LIST */}
          <div className="lg:col-span-2">
            <ChapterList
              chapters={chapters}
              exams={exams}
              setOpenResultId={setOpenResultId}
              enrolled={canAccessLessons}
            />
          </div>
        </div>

        {/* RESULT MODAL */}
        {openResultId && (
          <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow">
            <h3 className="text-xl font-bold mb-2">
              Kết quả bài thi #{openResultId}
            </h3>
            <button
              onClick={() => setOpenResultId(null)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
            >
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
