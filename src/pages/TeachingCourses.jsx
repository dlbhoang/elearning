import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FiBookOpen, FiClock, FiPlus, FiX } from "react-icons/fi";
import Swal from "sweetalert2";
import { getMyCourses, createCourse, updateCourse, deleteCourse } from "../services/courseService";

const TeachingCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const token = localStorage.getItem("token");

  const grades = ["10", "11", "12"];

  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    grade: "10",
    subject: "Toán",
    teacher: "",
    duration: "0 giờ",
    price: 0,
    imageFile: null,
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!token || user?.role !== "teacher") navigate("/login");
    else {
      fetchCourses();
      setNewCourse((prev) => ({ ...prev, teacher: user?.name || "" }));
    }
  }, [navigate]);

  const fetchCourses = async () => {
    try {
      const data = await getMyCourses(token);
      if (Array.isArray(data)) {
        setCourses(data);
      } else if (data.status === "success") {
        setCourses(data.data);
      } else {
        Swal.fire("Lỗi", data.message || "Không thể lấy khoá học", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Lỗi", err.response?.data?.message || "Không thể lấy khoá học", "error");
    }
  };

  const validateCourse = () => {
    if (!newCourse.title.trim()) {
      Swal.fire("Lỗi", "Tên khoá học không được để trống", "error");
      return false;
    }
    if (!newCourse.subject.trim()) {
      Swal.fire("Lỗi", "Môn học không được để trống", "error");
      return false;
    }
    if (!/^\d+\s*giờ$/.test(newCourse.duration)) {
      Swal.fire("Lỗi", "Duration phải có định dạng: 'xx giờ'", "error");
      return false;
    }
    if (newCourse.price <= 0) {
      Swal.fire("Lỗi", "Giá phải lớn hơn 0", "error");
      return false;
    }
    return true;
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!validateCourse()) return;

    try {
      const courseData = {
        title: newCourse.title,
        description: newCourse.description,
        subject: newCourse.subject,
        grade: newCourse.grade,
        duration: newCourse.duration,
        price: newCourse.price,
        imageFile: newCourse.imageFile,
      };

      const data = editingCourse
        ? await updateCourse(token, editingCourse.id, courseData)
        : await createCourse(token, courseData);

      if (data.status === "success") {
        Swal.fire("Thành công", data.message || "Lưu khoá học thành công", "success");
        setShowForm(false);
        setEditingCourse(null);
        setNewCourse({
          title: "",
          description: "",
          grade: "10",
          subject: "Toán",
          teacher: JSON.parse(localStorage.getItem("user"))?.name || "",
          duration: "0 giờ",
          price: 0,
          imageFile: null,
        });
        fetchCourses();
      } else {
        Swal.fire("Lỗi", data.message || "Lỗi khi lưu khoá học", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Lỗi", err.response?.data?.message || "Lỗi server khi lưu khoá học", "error");
    }
  };

  const handleDeleteCourse = async (id) => {
    const confirm = await Swal.fire({
      title: "Xác nhận",
      text: "Bạn có chắc chắn muốn xoá khoá học này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xoá",
      cancelButtonText: "Hủy",
    });

    if (confirm.isConfirmed) {
      try {
        const data = await deleteCourse(token, id);
        if (data.status === "success") {
          Swal.fire("Đã xoá!", "Khoá học đã được xoá.", "success");
          fetchCourses();
        } else if (data.status === "error" && data.message?.includes("foreign key")) {
          Swal.fire(
            "Không thể xoá",
            "Khoá học này đã có dữ liệu liên quan (học viên, thanh toán). Vui lòng xóa dữ liệu liên quan trước.",
            "error"
          );
        } else {
          Swal.fire("Lỗi", data.message || "Không thể xoá khoá học", "error");
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Lỗi", err.response?.data?.message || "Không thể xoá khoá học", "error");
      }
    }
  };


  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setNewCourse({
      title: course.title,
      description: course.description,
      grade: course.grade || "10",
      subject: course.subject || "Toán",
      teacher: course.teacher || JSON.parse(localStorage.getItem("user"))?.name || "",
      duration: course.duration || "0 giờ",
      price: course.price || 0,
      imageFile: null,
    });
    setShowForm(true);
  };

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-28 pb-10 px-2 sm:px-6">
        <div className="max-w-6xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-3xl font-extrabold text-blue-700 dark:text-white flex items-center gap-2">
              <FiBookOpen /> Khoá học đang dạy
            </h1>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full font-semibold shadow hover:bg-blue-700 transition"
              onClick={() => setShowForm(true)}
            >
              <FiPlus /> Tạo khoá học mới
            </button>
          </div>

          {/* Form thêm/sửa khoá học */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCourse(null);
                  }}
                >
                  <FiX />
                </button>
                <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-200 mb-6 flex items-center gap-2">
                  {editingCourse ? "Sửa khoá học" : "Tạo khoá học mới"}
                </h2>
                <form onSubmit={handleSaveCourse} className="flex flex-col gap-4">
                  <input
                    type="text"
                    placeholder="Tên khoá học"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                    className="px-4 py-2 rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-800"
                    required
                  />
                  <textarea
                    placeholder="Mô tả khoá học"
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                    className="px-4 py-2 rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-800"
                  />
                  <input
                    type="text"
                    placeholder="Môn học"
                    value={newCourse.subject}
                    onChange={(e) => setNewCourse({ ...newCourse, subject: e.target.value })}
                    className="px-4 py-2 rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-800"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Thời lượng (ví dụ: 40 giờ)"
                    value={newCourse.duration}
                    onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                    className="px-4 py-2 rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-800"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Giá (VNĐ)"
                    value={newCourse.price}
                    onChange={(e) => setNewCourse({ ...newCourse, price: parseInt(e.target.value) })}
                    className="px-4 py-2 rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-800"
                    required
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewCourse({ ...newCourse, imageFile: e.target.files[0] })}
                    className="px-4 py-2 rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-800"
                  />
                  <select
                    value={newCourse.grade}
                    onChange={(e) => setNewCourse({ ...newCourse, grade: e.target.value })}
                    className="px-4 py-2 rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-800"
                    required
                  >
                    {grades.map((g) => (
                      <option key={g} value={g}>
                        Lớp {g}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full"
                      onClick={() => setShowForm(false)}
                    >
                      Đóng
                    </button>
                    <button type="submit" className="px-5 py-2 bg-green-600 text-white rounded-full">
                      Lưu
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Danh sách khoá học */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div key={course.id} className="bg-blue-50 dark:bg-gray-800 rounded-xl shadow-md p-5 flex flex-col">
                <img
                  src={course.image || "https://i.imgur.com/mUjv7sX.jpg"}
                  alt={course.title}
                  className="w-full h-32 object-cover rounded-lg shadow mb-4"
                />
                <h2 className="text-lg font-bold text-blue-700 dark:text-blue-300 mb-1">{course.title}</h2>
                <div className="text-gray-600 dark:text-gray-300 text-sm mb-2">{course.description}</div>
                <div className="text-gray-600 dark:text-gray-300 text-sm mb-2">Lớp: {course.grade}</div>
                <div className="text-gray-600 dark:text-gray-300 text-sm mb-2">Môn: {course.subject}</div>
                <div className="text-gray-600 dark:text-gray-300 text-sm mb-2">Giá: {course.price.toLocaleString()} VNĐ</div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex items-center gap-1 text-green-600 font-semibold">
                    <FiClock /> Đang mở
                  </span>
                </div>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => handleEditCourse(course)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded-full flex-1"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded-full flex-1"
                  >
                    Xoá
                  </button>

                  <button
    onClick={() => navigate(`/manage-chapters/${course.id}`)}
    className="px-3 py-1 bg-blue-600 text-white rounded-full flex-1"
  >
    Quản lý Chapter
  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default TeachingCourses;
