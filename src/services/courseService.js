// src/services/courseService.js
import axios from "axios";
import { baseUrl } from "../utils/api";

/**
 * ================================
 * FETCH JSON HELPER (CHUẨN)
 * ================================
 */
const fetchJson = async (url, token, options = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
      ...options.headers,
    },
  });

  // ❌ KHÔNG parse JSON nếu lỗi
  if (!res.ok) {
    const text = await res.text();
    console.error("❌ API ERROR:", res.status, url, text);
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
};

const API_URL = `${baseUrl}/courses`;

/**
 * ================================
 * Lấy danh sách khóa học theo khối
 * ================================
 */
export const getCoursesByGrade = async (grade, page = 1, limit = 12, token) => {
  try {
    const url = `${API_URL}/grade/${grade}?page=${page}&limit=${limit}`;
    const data = await fetchJson(url, token);

    if (data.status === "success") {
      return {
        courses: data.data || [],
        pagination: data.pagination || { page: 1, totalPages: 1, total: 0 },
      };
    }

    return { courses: [], pagination: { page: 1, totalPages: 1, total: 0 } };
  } catch (error) {
    console.error("❌ getCoursesByGrade:", error.message);
    return { courses: [], pagination: { page: 1, totalPages: 1, total: 0 } };
  }
};

/**
 * ================================
 * Lấy danh sách tất cả khóa học
 * ================================
 */
export const getAllCoursesList = async (token) => {
  try {
    const data = await fetchJson(`${API_URL}/list`, token);

    if (data.status === "success") {
      return {
        courses: data.data || [],
        pagination: data.pagination || { total: 0, page: 1, totalPages: 1 },
      };
    }

    return { courses: [], pagination: { total: 0, page: 1, totalPages: 1 } };
  } catch (error) {
    console.error("❌ getAllCoursesList:", error.message);
    return { courses: [], pagination: { total: 0, page: 1, totalPages: 1 } };
  }
};

/**
 * ================================
 * Lấy chi tiết khóa học
 * ================================
 */
export const getCourseById = async (id, token) => {
  try {
    const data = await fetchJson(`${API_URL}/${id}`, token);
    return data.status === "success" ? data.data?.[0] || null : null;
  } catch (error) {
    console.error("❌ getCourseById:", error.message);
    return null;
  }
};

/**
 * ================================
 * Lấy chapters của course
 * ================================
 */
export const getCourseChapters = async (courseId, token) => {
  try {
    const data = await fetchJson(
      `${baseUrl}/lessons/course/${courseId}/chapters`,
      token
    );

    if (data.status === "success") {
      return data.data || [];
    }

    return [];
  } catch (error) {
    console.error("❌ getCourseChapters:", error.message);
    return [];
  }
};

/**
 * ================================
 * Lấy khóa học của giáo viên
 * ================================
 */
export const getMyCourses = async (token) => {
  try {
    const data = await fetchJson(`${API_URL}/me/mine`, token);
    return data.status === "success" ? data.data || [] : [];
  } catch (error) {
    console.error("❌ getMyCourses:", error.message);
    return [];
  }
};

/**
 * ================================
 * Lấy số học viên + tiến độ TB
 * ================================
 */
export const getCourseStudentsCount = async (courseId, token) => {
  try {
    const data = await fetchJson(
      `${API_URL}/${courseId}/students-count`,
      token
    );

    return {
      students: data.count || 0,
      progress: data.avgProgress || 0,
    };
  } catch (error) {
    console.error(
      `❌ getCourseStudentsCount course ${courseId}:`,
      error.message
    );
    return { students: 0, progress: 0 };
  }
};

/**
 * ================================
 * Tạo khóa học
 * ================================
 */
export const createCourse = async (token, courseData) => {
  try {
    const formData = new FormData();

    Object.keys(courseData).forEach((key) => {
      if (key !== "imageFile" && courseData[key] != null) {
        formData.append(key, courseData[key]);
      }
    });

    if (courseData.imageFile) {
      formData.append("imageFile", courseData.imageFile);
    }

    const res = await axios.post(`${API_URL}/create`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    console.error("❌ createCourse:", error);
    throw error.response?.data || error;
  }
};

/**
 * ================================
 * Cập nhật khóa học
 * ================================
 */
export const updateCourse = async (token, courseId, courseData) => {
  try {
    const res = await axios.put(`${API_URL}/${courseId}`, courseData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return res.data;
  } catch (error) {
    console.error("❌ updateCourse:", error);
    throw error.response?.data || error;
  }
};

/**
 * ================================
 * Xóa khóa học
 * ================================
 */
export const deleteCourse = async (token, courseId) => {
  try {
    const res = await axios.delete(`${API_URL}/${courseId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (error) {
    console.error("❌ deleteCourse:", error);
    throw error.response?.data || error;
  }
};
/**
 * ================================
 * Lấy tiến độ khóa học của học sinh
 * ================================
 */
export const getCourseProgress = async (courseId, token) => {
  try {
    console.log(`🔍 getCourseProgress: courseId=${courseId}`);
    const res = await axios.get(
      `${API_URL}/${courseId}/progress`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log("📊 getCourseProgress response:", res.data);
    return res.data?.data || { progress: 0 };
  } catch (error) {
    console.error("❌ getCourseProgress error:", error.response?.data || error.message);
    return { progress: 0 };
  }
};