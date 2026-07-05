// src/services/authService.js
import axios from "axios";
import { baseUrl } from "../utils/api";

// -------------------------
// Đăng ký
// -------------------------
export const register = async (payload) => {
  try {
    const res = await axios.post(`${baseUrl}/auth/register`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    console.log("✅ Register API response:", res.data);
    return res.data;
  } catch (err) {
    if (err.response) {
      console.error("❌ Response error from server:", err.response.data);
      return err.response.data;
    } else if (err.request) {
      console.error("❌ No response received:", err.request);
      return { message: "Server không phản hồi" };
    } else {
      console.error("❌ Axios error:", err.message);
      return { message: err.message };
    }
  }
};

// -------------------------
// Đăng nhập
// -------------------------
export const login = async (data) => {
  try {
    const res = await axios.post(`${baseUrl}/auth/login`, data, {
      headers: { "Content-Type": "application/json" },
    });
    if (res.data.status === "success") {
      localStorage.setItem("token", res.data.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.data.user));

      // Redirect theo role
      const user = res.data.data.user;
      if (user.role === "admin") window.location.replace("/admin");
      else if (user.role === "teacher") window.location.replace("/teacher-dashboard");

      return res.data.data;
    }
    return res.data;
  } catch (err) {
    if (err.response) {
      console.error("❌ Response error from server:", err.response.data);
      return err.response.data;
    } else if (err.request) {
      console.error("❌ No response received:", err.request);
      return { message: "Server không phản hồi" };
    } else {
      console.error("❌ Axios error:", err.message);
      return { message: err.message };
    }
  }
};

// -------------------------
// Google login
// -------------------------
// -------------------------
// Google login
// -------------------------
export const googleLogin = async (idToken) => {
  try {
    const res = await axios.post(`${baseUrl}/auth/google`, { idToken: idToken }, {
      headers: { "Content-Type": "application/json" },
    });

    if (res.data.status === "success") {
      const { token, user } = res.data.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ Redirect theo role
      if (user.role === "admin") {
        window.location.replace("/admin");
      } else if (user.role === "teacher") {
        window.location.replace("/teacher-dashboard");
      } else {
        // mặc định học sinh
        window.location.replace("/student-dashboard");
      }
    }

    return res.data;
  } catch (err) {
    if (err.response) {
      console.error("❌ Response error from server:", err.response.data);
      return err.response.data;
    } else if (err.request) {
      console.error("❌ No response received:", err.request);
      return { message: "Server không phản hồi" };
    } else {
      console.error("❌ Axios error:", err.message);
      return { message: err.message };
    }
  }
};

// -------------------------
// Lấy profile
// -------------------------
export const getProfile = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Chưa đăng nhập");

  try {
    const res = await axios.get(`${baseUrl}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data;
  } catch (err) {
    console.error("Get profile error:", err);
    throw err;
  }
};

export const updateProfile = async (formData) => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${baseUrl}/auth/update`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData, // nếu có upload file thì để nguyên FormData
    });

    const text = await res.text(); // lấy response dạng raw để debug
    if (!res.ok) {
      console.error("❌ Update profile failed:", res.status, text);
      throw new Error(`Failed to update profile: ${res.status}`);
    }

    return JSON.parse(text);
  } catch (err) {
    console.error("❌ updateProfile exception:", err);
    throw err;
  }
};
export const checkEnrollment = async (courseId) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Chưa đăng nhập");

  try {
    console.log("🔍 checkEnrollment courseId:", courseId);

    const res = await axios.get(
      `${baseUrl}/auth/check-enrollment/${courseId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("📦 checkEnrollment API raw response:", res.data);

    return res.data;
  } catch (err) {
    if (err.response) {
      console.error("❌ Check enrollment error:", err.response.data);
      return err.response.data;
    } else if (err.request) {
      console.error("❌ No response received:", err.request);
      return { message: "Server không phản hồi" };
    } else {
      console.error("❌ Axios error:", err.message);
      return { message: err.message };
    }
  }
};

// -------------------------
// Logout
// -------------------------
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.replace("/login");
};
