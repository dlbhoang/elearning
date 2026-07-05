// services/enrollmentService.js
import axios from "axios";
import { baseUrl } from "../utils/api";

const API_URL = `${baseUrl}/enrollments`;

/**
 * Enroll vào khóa học
 */
export const enrollCourse = async (token, courseId) => {
  try {
    const res = await axios.post(
      API_URL,
      { course_id: courseId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi enroll course:", error);
    throw error.response?.data || error;
  }
};

/**
 * Lấy danh sách khóa học đã enroll
 * Note: Endpoint này có thể chưa được implement trên server
 */
export const getUserCourses = async (token) => {
  try {
    const res = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy enrolled courses:", error);
    throw error.response?.data || error;
  }
};
