// src/services/paymentService.js
import axios from "axios";
import { baseUrl } from "../utils/api";

const API_URL = `${baseUrl}/payments`;

/**
 * Tạo payment mới
 */
export const createPayment = async (token, paymentData) => {
  try {
    const res = await axios.post(
      API_URL,
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi tạo payment:", error);
    throw error.response?.data || error;
  }
};

/**
 * Cập nhật trạng thái payment (teacher/admin)
 */
export const updatePaymentStatus = async (token, paymentId, status) => {
  try {
    const res = await axios.put(
      `${API_URL}/${paymentId}/status`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật payment status:", error);
    throw error.response?.data || error;
  }
};

/**
 * Lấy danh sách payments của user
 */
export const getUserPayments = async (token) => {
  try {
    const res = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy payments:", error);
    throw error.response?.data || error;
  }
};

