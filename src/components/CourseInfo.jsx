import React, { useState } from "react";
import { FiBookOpen, FiClock } from "react-icons/fi";
import { enrollCourse } from "../services/enrollmentService";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import PaymentDialog from "./PaymentDialog.jsx";
import ProgressBar from "./ProgressBar";

const CourseInfo = ({ course, courseProgress = 0, initialEnrollmentStatus = null, onEnroll }) => {
  const [enrollmentStatus, setEnrollmentStatus] = useState(initialEnrollmentStatus);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [enrollment, setEnrollment] = useState(null);
  const token = localStorage.getItem("token");

  const handleEnroll = async () => {
    try {
      const res = await enrollCourse(token, course.id);

      if (res.status === "success") {
        // Lưu enrollment data để dùng cho payment
        setEnrollment({ id: res.data?.payment_id || res.data?.enrollment_id });
        setEnrollmentStatus(res.data?.enrollment_status || "pending");

        Swal.fire({
          icon: "success",
          title: "Đăng ký thành công!",
          text: `Bạn đã đăng ký khóa học "${course.title}". Vui lòng thanh toán để hoàn tất.`,
          timer: 2000,
          showConfirmButton: false,
        });

        // Mở payment dialog sau khi enroll thành công
        setTimeout(() => {
          setOpenPaymentDialog(true);
        }, 500);
        
        onEnroll?.(res.data?.enrollment_status || "pending");
      } else {
        Swal.fire({
          icon: "error",
          title: "Đăng ký thất bại",
          text: res.message || "Có lỗi xảy ra, vui lòng thử lại!",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Đăng ký thất bại",
        text: err.response?.data?.message || err.message || "Có lỗi xảy ra, vui lòng thử lại!",
      });
    }
  };

  const handlePaySuccess = (paymentData) => {
    setEnrollmentStatus("pending");
    onEnroll?.("pending");
  };

  const renderEnrollmentBadge = () => {
    switch (enrollmentStatus) {
      case "pending":
        return (
          <span
            className="flex items-center gap-1 px-4 py-1 bg-yellow-200 text-yellow-800 rounded-full font-medium cursor-pointer"
            onClick={() => setOpenPaymentDialog(true)}
          >
            <FiClock />
            Đang chờ thanh toán
          </span>
        );
      case "paid":
        return (
          <span className="px-4 py-1 bg-green-200 text-green-800 rounded-full font-medium">
            Đã đăng ký
          </span>
        );
      case "failed":
        return (
          <span className="px-4 py-1 bg-red-200 text-red-800 rounded-full font-medium">
            Thanh toán thất bại
          </span>
        );
      case "refunded":
        return (
          <span className="px-4 py-1 bg-gray-200 text-gray-800 rounded-full font-medium">
            Đã hoàn tiền
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        {course.title}
      </h1>

      <div className="flex items-center gap-4 mb-4">
        <span className="text-lg bg-primary/10 text-primary px-3 py-1 rounded-full">
          {course.subject}
        </span>
        <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
          {course.grade}
        </span>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <FiBookOpen />
          <span>Giảng viên: {course.teacher?.name}</span>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Giới thiệu khóa học</h2>
        <p className="text-gray-700 dark:text-gray-300">{course.description}</p>
      </div>

      {/* Nếu đã đăng ký, hiển thị trạng thái */}
      {enrollmentStatus ? (
        <div className="mb-4">{renderEnrollmentBadge()}</div>
      ) : (
        <button
          onClick={handleEnroll}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-medium"
        >
          Đăng ký khóa học
        </button>
      )}

      {/* Tiến độ học tập */}
      <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            📊 Tiến độ khóa học
          </h3>
          <span className="text-2xl font-bold text-primary">
            {courseProgress}%
          </span>
        </div>
        <ProgressBar current={courseProgress} total={100} />
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {courseProgress === 100 
            ? "🎉 Chúc mừng! Bạn đã hoàn thành khóa học này!" 
            : `Bạn cần hoàn thành ${100 - courseProgress}% nữa`}
        </p>
      </div>

      {/* Payment Dialog */}
      {openPaymentDialog && enrollment && (
        <PaymentDialog
          course={course}
          enrollment={enrollment}
          onClose={() => setOpenPaymentDialog(false)}
          onPaySuccess={handlePaySuccess}
        />
      )}
    </div>
  );
};

export default CourseInfo;
