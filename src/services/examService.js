import axios from "axios";
import { baseUrl } from "../utils/api";

// Use shared baseUrl (can be overridden by VITE_API_URL)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || baseUrl.replace(/\/+$/, '');

// Create new exam
export const createExam = async (token, examData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/exams`, examData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating exam:", error);
    throw error;
  }
};

// Get all exams for logged-in student (from their enrolled courses)
export const getStudentExams = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/exams/student/my-exams`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching student exams:", error);
    throw error;
  }
};

// Get all exams
export const getAllExams = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/exams`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching exams:", error);
    throw error;
  }
};

// Get exam by ID
export const getExamById = async (token, examId) => {
  try {
    if (!examId) {
      throw new Error("Exam ID is required");
    }
    const response = await axios.get(`${API_BASE_URL}/exams/${examId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Xử lý cả hai format: { status: "success", data: {...} } hoặc trực tiếp là object
    if (response.data?.status === "success" && response.data?.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching exam:", error);
    throw error;
  }
};

// Update exam
export const updateExam = async (token, examId, examData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/exams/${examId}`, examData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating exam:", error);
    throw error;
  }
};

// Delete exam
export const deleteExam = async (token, examId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/exams/${examId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting exam:", error);
    throw error;
  }
};

// Get exams by course
export const getExamsByCourse = async (token, courseId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/exams/course/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching exams by course:", error);
    throw error;
  }
};

// Add question to exam
export const addQuestionToExam = async (token, examId, questionData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/exams/${examId}/questions`, questionData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding question:", error);
    throw error;
  }
};

// Delete question from exam
export const deleteQuestionFromExam = async (token, examId, questionId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/exams/${examId}/questions/${questionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting question:", error);
    throw error;
  }
};

// Update question
export const updateQuestion = async (token, examId, questionId, questionData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/exams/${examId}/questions/${questionId}`, questionData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating question:", error);
    throw error;
  }
};

// Get students enrolled in teacher's courses
export const getTeacherStudents = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/enrollments/students`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
};
