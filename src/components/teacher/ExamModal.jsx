// src/components/ExamModal.jsx
import React, { useEffect, useState } from "react";
import { getAllCoursesList } from "../../services/courseService";

export default function ExamModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  handleSubmit,
}) {
  const [teacherCourses, setTeacherCourses] = useState([]);
  useEffect(() => {
    const fetchCourses = async () => {
      if (isOpen) {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user?.name) {
          const token = localStorage.getItem("token");
          const { courses } = await getAllCoursesList(token);
          // Lọc các khóa học mà giáo viên này dạy (theo ID)
          const filteredCourses = courses.filter(
            (course) => {
              // course.teacher có thể là object hoặc id, tùy API trả về
              if (typeof course.teacher === 'object' && course.teacher.id) {
                return course.teacher.id === user.id;
              }
              return course.teacher === user.id;
            }
          );
          setTeacherCourses(filteredCourses);
          // Nếu chỉ có 1 khóa học, tự động chọn
          if (filteredCourses.length === 1) {
            setFormData((prev) => ({
              ...prev,
              teacher: user.name,
              subject: filteredCourses[0].subject,
              courseId: filteredCourses[0].id,
            }));
          } else {
            setFormData((prev) => ({
              ...prev,
              teacher: user.name,
              subject: prev.subject || "",
              courseId: prev.courseId || "",
            }));
          }
        }
      }
    };
    fetchCourses();
    // eslint-disable-next-line
  }, [isOpen, setFormData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-xl shadow-xl">
        <h2 className="text-xl font-bold mb-4">Thêm / Sửa Bài thi</h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[70vh] overflow-y-auto"
        >
          <input
            type="text"
            placeholder="Tiêu đề"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full p-2 border rounded-lg dark:bg-gray-700"
            required
          />

          {/* Chọn khóa học */}
          <select
            value={formData.courseId || ""}
            onChange={e => {
              const selected = teacherCourses.find(c => c.id === Number(e.target.value));
              setFormData(prev => ({
                ...prev,
                courseId: e.target.value,
                subject: selected ? selected.subject : prev.subject
              }));
            }}
            className="w-full p-2 border rounded-lg dark:bg-gray-700"
            required
          >
            <option value="">-- Chọn khóa học --</option>
            {teacherCourses.map(course => (
              <option key={course.id} value={course.id}>
                {course.title} ({course.subject})
              </option>
            ))}
          </select>

          {/* Môn học tự động điền, disable không cho sửa */}
          <input
            type="text"
            placeholder="Môn học"
            value={formData.subject}
            readOnly
            className="w-full p-2 border rounded-lg bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
          />

          {/* Giáo viên tự động điền, disable không cho sửa */}
          <input
            type="text"
            placeholder="Giáo viên"
            value={formData.teacher}
            readOnly
            className="w-full p-2 border rounded-lg bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
          />

          <input
            type="date"
            value={formData.date}
            onChange={(e) =>
              setFormData({ ...formData, date: e.target.value })
            }
            className="w-full p-2 border rounded-lg dark:bg-gray-700"
          />

          <input
            type="time"
            value={formData.time}
            onChange={(e) =>
              setFormData({ ...formData, time: e.target.value })
            }
            className="w-full p-2 border rounded-lg dark:bg-gray-700"
          />

          <button
            type="submit"
            className="w-full px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90"
          >
            Lưu
          </button>
        </form>

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
