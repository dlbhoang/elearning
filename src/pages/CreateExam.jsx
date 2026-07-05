import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { createExam } from "../services/examService";
import axios from "axios";

const CreateExam = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    courseId: "",
    subject: "",
    date: "",
    time: "",
    duration: 45,
    totalQuestions: 10,
    maxScore: 10,
    classroom: "",
    instructions: ""
  });

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5001/api/courses/list", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(response.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error loading courses:", error);
        Swal.fire("Lỗi", "Không thể tải danh sách khóa học", "error");
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedData = { ...formData, [name]: value };
    
    // Auto-fill subject if courseId changes
    if (name === "courseId") {
      const selectedCourse = courses.find(c => c.id.toString() === value);
      if (selectedCourse) {
        updatedData.subject = selectedCourse.subject;
      }
    }
    
    setFormData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.courseId || !formData.date || !formData.time) {
      Swal.fire("Lỗi", "Vui lòng điền tất cả các trường bắt buộc", "error");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await createExam(token, {
        title: formData.title,
        courseId: formData.courseId,
        subject: formData.subject,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        totalQuestions: formData.totalQuestions,
        maxScore: formData.maxScore,
        classroom: formData.classroom,
        instructions: formData.instructions
      });

      if (response.id) {
        Swal.fire("Thành công", "Bài thi đã được tạo", "success");
        navigate("/manage-exams");
      } else {
        Swal.fire("Lỗi", response.message || "Không thể tạo bài thi", "error");
      }
    } catch (error) {
      console.error("Error creating exam:", error);
      Swal.fire("Lỗi", error.response?.data?.error || error.message || "Có lỗi xảy ra", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-lg">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 px-6">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-10">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Tạo bài thi mới
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            name="title"
            placeholder="Tiêu đề bài thi"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-4 border rounded-xl dark:bg-gray-700 dark:text-white"
            required
          />
          
          {/* Dropdown chọn môn học */}
          <select
            name="courseId"
            value={formData.courseId}
            onChange={handleChange}
            className="w-full p-4 border rounded-xl dark:bg-gray-700 dark:text-white"
            required
          >
            <option value="">-- Chọn môn học --</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.subject} ({course.grade})
              </option>
            ))}
          </select>
          
          <input
            type="text"
            name="subject"
            placeholder="Tên môn học"
            value={formData.subject}
            onChange={handleChange}
            className="w-full p-4 border rounded-xl dark:bg-gray-700 dark:text-white bg-gray-100 cursor-not-allowed"
            disabled
          />
          
          <div className="flex gap-4">
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="flex-1 p-4 border rounded-xl dark:bg-gray-700 dark:text-white"
              required
            />
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="flex-1 p-4 border rounded-xl dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          <div className="flex gap-4">
            <input
              type="number"
              name="duration"
              placeholder="Thời lượng (phút)"
              value={formData.duration}
              onChange={handleChange}
              className="flex-1 p-4 border rounded-xl dark:bg-gray-700 dark:text-white"
              required
              min="1"
            />
            <input
              type="number"
              name="totalQuestions"
              placeholder="Số câu hỏi"
              value={formData.totalQuestions}
              onChange={handleChange}
              className="flex-1 p-4 border rounded-xl dark:bg-gray-700 dark:text-white"
              required
              min="1"
            />
          </div>
          
          <input
            type="number"
            name="maxScore"
            placeholder="Điểm tối đa"
            value={formData.maxScore}
            onChange={handleChange}
            className="w-full p-4 border rounded-xl dark:bg-gray-700 dark:text-white"
            required
            min="1"
          />
          
          <input
            type="text"
            name="classroom"
            placeholder="Lớp học (tùy chọn)"
            value={formData.classroom}
            onChange={handleChange}
            className="w-full p-4 border rounded-xl dark:bg-gray-700 dark:text-white"
          />
          
          <textarea
            name="instructions"
            placeholder="Hướng dẫn làm bài (tùy chọn)"
            value={formData.instructions}
            onChange={handleChange}
            className="w-full p-4 border rounded-xl dark:bg-gray-700 dark:text-white"
            rows="4"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Đang tạo..." : "Tạo bài thi"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateExam;
