import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import { createPayment } from "../services/paymentService";
import Swal from "sweetalert2";

// Import logo trực tiếp từ src/assets
import VnpayLogo from "../assets/vnpay.png";
import MoMoLogo from "../assets/momo.png";
import CashLogo from "../assets/tien_mat.png";

const paymentOptions = [
  { id: "vnpay", label: "VNPAY", img: VnpayLogo },
  { id: "momo", label: "Momo", img: MoMoLogo },
  { id: "tien_mat", label: "Tiền mặt", img: CashLogo },
];

const PaymentDialog = ({ course, enrollment, onClose, onPaySuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState("vnpay");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const handlePay = async () => {
    if (!enrollment?.id || !course?.price) {
      Swal.fire("Lỗi", "Thiếu thông tin enrollment hoặc giá khóa học", "error");
      return;
    }

    try {
      setLoading(true);
      
      // Map payment method từ UI sang API format
      const methodMap = {
        vnpay: "vnpay",
        momo: "momo",
        tien_mat: "cash",
      };
      
      const paymentData = {
        enrollment_id: enrollment.id,
        amount: course.price,
        method: methodMap[selectedMethod] || selectedMethod,
      };

      const data = await createPayment(token, paymentData);

      if (data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Thanh toán thành công!",
          text: "Đơn thanh toán đã được tạo. Vui lòng chờ xác nhận.",
          timer: 2000,
        });
        onPaySuccess?.(data.data);
        onClose?.();
      } else {
        Swal.fire("Lỗi", data.message || "Không thể tạo thanh toán", "error");
      }
    } catch (error) {
      console.error("Lỗi khi thanh toán:", error);
      Swal.fire(
        "Lỗi",
        error.response?.data?.message || "Có lỗi xảy ra khi thanh toán",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-transform duration-300 scale-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Thanh toán khóa học
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Course Info */}
        <div className="mb-6 space-y-2">
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Khóa học:</span> {course.title}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Giá:</span> {course.price.toLocaleString()} VND
          </p>
          {course.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
              {course.description.length > 100
                ? course.description.substring(0, 100) + "..."
                : course.description}
            </p>
          )}
        </div>

        {/* Payment Options */}
        <div className="mb-4">
          <span className="text-gray-700 dark:text-gray-300 font-medium">Chọn phương thức thanh toán:</span>
          <div className="mt-2 flex flex-wrap gap-3">
            {paymentOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedMethod(option.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition 
                  ${selectedMethod === option.id 
                    ? "border-primary bg-primary/20" 
                    : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
              >
                <img src={option.img} alt={option.label} className="w-6 h-6 object-contain" />
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handlePay}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
          >
            <img 
              src={paymentOptions.find(opt => opt.id === selectedMethod)?.img} 
              alt={selectedMethod} 
              className="w-6 h-6 object-contain" 
            />
            {loading ? "Đang xử lý..." : "Thanh toán"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDialog;
