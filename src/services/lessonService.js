// src/services/lessonService.js
import axios from "axios";
import { baseUrl } from "../utils/api";

const API_URL = `${baseUrl}/lessons`;

// -------------------------
// Chapter APIs
// -------------------------
export const createChapter = async (token, data) => {
  try {
    const res = await axios.post(`${API_URL}/chapter/create`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi tạo chapter:", error);
    throw error.response?.data || error;
  }
};

export const getChaptersByCourse = async (token, courseId) => {
  try {
    const res = await axios.get(`${API_URL}/course/${courseId}/chapters`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy chapters:", error);
    throw error.response?.data || error;
  }
};

export const updateChapter = async (token, chapterId, data) => {
  try {
    const res = await axios.put(`${API_URL}/chapter/${chapterId}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật chapter:", error);
    throw error.response?.data || error;
  }
};

export const deleteChapter = async (token, chapterId) => {
  try {
    const res = await axios.delete(`${API_URL}/chapter/${chapterId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi xóa chapter:", error);
    throw error.response?.data || error;
  }
};

// -------------------------
// Lesson APIs
// -------------------------
export const createLesson = async (token, { chapter_id, title, duration, description, videoFile, pptFile }) => {
  try {
    const formData = new FormData();
    formData.append("chapter_id", chapter_id);
    formData.append("title", title);
    if (duration) formData.append("duration", duration);
    if (description) formData.append("description", description);

    if (videoFile) formData.append("videoFile", videoFile);
    if (pptFile) formData.append("pptFile", pptFile);

    const res = await axios.post(`${API_URL}/lesson/create`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi tạo lesson:", error);
    throw error.response?.data || error;
  }
};

export const getLessonById = async (token, lessonId) => {
  try {
    const res = await axios.get(`${API_URL}/${lessonId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy lesson:", error);
    throw error.response?.data || error;
  }
};

export const getLessonsByChapter = async (token, chapterId) => {
  try {
    const res = await axios.get(`${API_URL}/chapter/${chapterId}/lessons`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy lessons:", error);
    throw error.response?.data || error;
  }
};

export const updateLesson = async (token, lessonId, data) => {
  try {
    const res = await axios.put(`${API_URL}/lesson/${lessonId}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật lesson:", error);
    throw error.response?.data || error;
  }
};

export const deleteLesson = async (token, lessonId) => {
  try {
    const res = await axios.delete(`${API_URL}/lesson/${lessonId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi xóa lesson:", error);
    throw error.response?.data || error;
  }
};

// -------------------------
// Exercise APIs
// -------------------------
export const createLessonExercise = async (token, data) => {
  try {
    const res = await axios.post(`${API_URL}/exercise/create`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi tạo exercise:", error);
    throw error.response?.data || error;
  }
};

export const getExercisesByLesson = async (token, lessonId) => {
  try {
    const res = await axios.get(`${API_URL}/${lessonId}/exercises`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy exercises:", error);
    throw error.response?.data || error;
  }
};

export const updateLessonExercise = async (token, exerciseId, data) => {
  try {
    const res = await axios.put(`${API_URL}/exercise/${exerciseId}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật exercise:", error);
    throw error.response?.data || error;
  }
};

export const deleteLessonExercise = async (token, exerciseId) => {
  try {
    const res = await axios.delete(`${API_URL}/exercise/${exerciseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi xóa exercise:", error);
    throw error.response?.data || error;
  }
};

// -------------------------
// Score APIs (student)
// -------------------------
export const createLessonScore = async (token, data) => {
  try {
    const res = await axios.post(`${API_URL}/score`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi tạo score:", error);
    throw error.response?.data || error;
  }
};

// -------------------------
// Full course content
// -------------------------
export const getCourseContent = async (token, courseId) => {
  try {
    const res = await axios.get(`${API_URL}/course/${courseId}/content`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy course content:", error);
    throw error.response?.data || error;
  }
};
// -------------------------
// Lesson Progress APIs
// -------------------------
/**
 * Cập nhật tiến độ bài học
 * @param {string} token - JWT token
 * @param {string} lessonId - ID của bài học (LE_...)
 * @param {number} courseId - ID của khóa học
 * @param {string} progressType - 'video_watched' (50%) hoặc 'exercises_completed' (100%)
 */
export const updateLessonProgress = async (token, lessonId, courseId, progressType) => {
  try {
    const res = await axios.post(
      `${API_URL}/progress/update`,
      {
        lesson_id: lessonId,
        course_id: courseId,
        progress_type: progressType,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật tiến độ:", error);
    throw error.response?.data || error;
  }
};

/**
 * Lấy tiến độ của học sinh cho một bài học
 * @param {string} token - JWT token
 * @param {string} lessonId - ID của bài học
 */
export const getLessonProgress = async (token, lessonId) => {
  try {
    const res = await axios.get(`${API_URL}/${lessonId}/progress`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy tiến độ:", error);
    throw error.response?.data || error;
  }
};