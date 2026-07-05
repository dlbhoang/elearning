import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiBookOpen,
  FiCalendar,
  FiClock,
  FiUsers,
  FiHelpCircle,
  FiPlay,
} from "react-icons/fi";
import Footer from "../components/Footer";
import QuestionModal from "../components/teacher/QuestionModal";
import ExamModal from "../components/teacher/ExamModal";
import ExamPreview from "../components/teacher/ExamPreview";
import {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam,
  addQuestionToExam,
  deleteQuestionFromExam,
  updateQuestion,
} from "../services/examService.js";

const ManageExams = () => {
  const [exams, setExams] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewExam, setPreviewExam] = useState(null);
  const [editingExam, setEditingExam] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    date: "",
    time: "",
    duration: "",
    totalQuestions: "",
    teacher: "",
    classroom: "",
    type: "",
    difficulty: "Trung bình",
    status: "upcoming",
    questions: [],
  });

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [currentExam, setCurrentExam] = useState(null);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [questionForm, setQuestionForm] = useState({
    question: "",
    type: "single",
    options: [
      { id: "A", text: "" },
      { id: "B", text: "" },
      { id: "C", text: "" },
      { id: "D", text: "" },
    ],
    correctAnswer: "",
    explanation: "",
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const data = await getAllExams(token);
      setExams(data || []);
    } catch (error) {
      Swal.fire("Lỗi", "Không thể tải danh sách bài thi", "error");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingExam(null);
    setFormData({
      title: "",
      description: "",
      subject: "",
      date: "",
      time: "",
      duration: "",
      totalQuestions: "",
      teacher: "",
      classroom: "",
      type: "",
      difficulty: "Trung bình",
      status: "upcoming",
      questions: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (exam) => {
    setEditingExam(exam);
    setFormData(exam);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Xoá bài thi?",
      text: "Hành động này không thể hoàn tác",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Xoá",
      cancelButtonText: "Huỷ",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await deleteExam(token, id);
      Swal.fire("Thành công", "Đã xoá bài thi", "success");
      fetchExams();
    } catch (error) {
      Swal.fire("Lỗi", error.message || "Không thể xoá bài thi", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      if (editingExam) {
        // Sửa bài thi
        await updateExam(token, editingExam.id, formData);
        Swal.fire("Thành công", "Cập nhật bài thi thành công", "success");
      } else {
        // Tạo bài thi mới
        await createExam(token, formData);
        Swal.fire("Thành công", "Tạo bài thi thành công", "success");
      }
      setIsModalOpen(false);
      fetchExams();
    } catch (error) {
      Swal.fire("Lỗi", error.message || "Không thể lưu bài thi", "error");
    }
  };

  const openQuestionsModal = async (exam) => {
    try {
      if (!exam || !exam.id) {
        Swal.fire("Lỗi", "Không tìm thấy bài thi!", "error");
        return;
      }

      const token = localStorage.getItem("token");
      // Fetch exam chi tiết để lấy đầy đủ questions
      const detailedExamResponse = await getExamById(token, exam.id);
      // Kiểm tra format response - có thể là { status: "success", data: {...} } hoặc trực tiếp là object
      const detailedExam = detailedExamResponse?.data || detailedExamResponse;
      
      if (!detailedExam || !detailedExam.id) {
        Swal.fire("Lỗi", "Không thể load chi tiết bài thi", "error");
        return;
      }
      
      setCurrentExam(detailedExam);
      setIsQuestionModalOpen(true);
    } catch (error) {
      console.error("Lỗi khi load exam:", error);
      Swal.fire("Lỗi", "Không thể load chi tiết bài thi", "error");
    }
  };

  const handleAddQuestion = async () => {
    if (!questionForm.question.trim()) {
      Swal.fire("Lỗi", "Vui lòng nhập câu hỏi!", "error");
      return;
    }

    // Kiểm tra currentExam và examId
    if (!currentExam || !currentExam.id) {
      Swal.fire("Lỗi", "Không tìm thấy bài thi. Vui lòng thử lại!", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const examId = currentExam.id;
      
      if (editingQuestionId) {
        // Update câu hỏi
        await updateQuestion(token, examId, editingQuestionId, questionForm);
        Swal.fire("Thành công", "Cập nhật câu hỏi thành công!", "success");
        setEditingQuestionId(null);
      } else {
        // Thêm câu hỏi mới
        await addQuestionToExam(token, examId, questionForm);
        Swal.fire("Thành công", "Thêm câu hỏi thành công!", "success");
      }

      // Cập nhật exam hiện tại
      const updatedExamResponse = await getExamById(token, examId);
      // Kiểm tra format response
      const updatedExam = updatedExamResponse?.data || updatedExamResponse;
      setCurrentExam(updatedExam);

      // Reset form
      setQuestionForm({
        question: "",
        type: "single",
        options: [
          { id: "A", text: "" },
          { id: "B", text: "" },
          { id: "C", text: "" },
          { id: "D", text: "" },
        ],
        correctAnswer: "",
        explanation: "",
      });
      setEditingQuestionId(null);
    } catch (error) {
      Swal.fire("Lỗi", error.message || "Không thể lưu câu hỏi", "error");
    }
  };

  const handleDeleteQuestion = async (qid) => {
    // Kiểm tra currentExam và examId
    if (!currentExam || !currentExam.id) {
      Swal.fire("Lỗi", "Không tìm thấy bài thi. Vui lòng thử lại!", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const examId = currentExam.id;
      await deleteQuestionFromExam(token, examId, qid);
      Swal.fire("Thành công", "Đã xoá câu hỏi", "success");

      // Cập nhật exam hiện tại
      const updatedExamResponse = await getExamById(token, examId);
      // Kiểm tra format response
      const updatedExam = updatedExamResponse?.data || updatedExamResponse;
      setCurrentExam(updatedExam);
      setEditingQuestionId(null);
    } catch (error) {
      Swal.fire("Lỗi", error.message || "Không thể xoá câu hỏi", "error");
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestionId(question.id);
    // Parse options nếu là string
    let optionsData = question.options;
    if (typeof optionsData === 'string') {
      try {
        optionsData = JSON.parse(optionsData);
      } catch (e) {
        optionsData = question.options;
      }
    }
    // Convert object to array format nếu cần
    const optionsArray = Array.isArray(optionsData)
      ? optionsData
      : Object.entries(optionsData || {}).map(([id, text]) => ({ id, text }));
    
    // Parse correctAnswer nếu là string
    let correctAnswerData = question.correctAnswer;
    if (typeof correctAnswerData === 'string') {
      try {
        correctAnswerData = JSON.parse(correctAnswerData);
      } catch (e) {
        // Nếu không parse được, giữ nguyên
        correctAnswerData = question.correctAnswer;
      }
    }
    
    setQuestionForm({
      question: question.question,
      type: question.type || "single",
      options: optionsArray.length > 0 ? optionsArray : [
        { id: "A", text: "" },
        { id: "B", text: "" },
        { id: "C", text: "" },
        { id: "D", text: "" },
      ],
      correctAnswer: correctAnswerData || "",
      explanation: question.explanation || "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 lg:pt-24">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Quản lý Bài thi
          </h1>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary/90 transition"
          >
            <FiPlus /> Thêm bài thi
          </button>
        </motion.div>

        {/* Exams Table */}
        <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                <th className="p-4">Tiêu đề</th>
                <th className="p-4">Môn học</th>
                <th className="p-4">Ngày</th>
                <th className="p-4">Giờ</th>
                <th className="p-4">Giáo viên</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-center">Câu hỏi</th>
                <th className="p-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr
                  key={exam.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="p-4 font-medium">{exam.title}</td>
                  <td className="p-4 flex items-center gap-1">
                    <FiBookOpen /> {exam.subject}
                  </td>
                  <td className="p-4 flex items-center gap-1">
                    <FiCalendar />{" "}
                    {exam.date
                      ? new Date(exam.date).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td className="p-4 flex items-center gap-1">
                    <FiClock /> {exam.time || "-"}
                  </td>
                  <td className="p-4 flex items-center gap-1">
                    <FiUsers /> {exam.teacher || "-"}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        exam.status === "upcoming"
                          ? "bg-blue-100 text-blue-600"
                          : exam.status === "completed"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {exam.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => openQuestionsModal(exam)}
                      className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
                    >
                      <FiHelpCircle /> {exam.questions?.length || 0}
                    </button>
                  </td>
                  <td className="p-4 flex gap-2 justify-center">
                    <button
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem("token");
                          const fullExam = await getExamById(token, exam.id);
                          setPreviewExam(fullExam);
                          setIsPreviewOpen(true);
                        } catch (error) {
                          Swal.fire("Lỗi", "Không thể tải bài thi", "error");
                        }
                      }}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 title='Thi thử'"
                      title="Thi thử"
                    >
                      <FiPlay />
                    </button>
                    <button
                      onClick={() => openEditModal(exam)}
                      className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDelete(exam.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
              {exams.length === 0 && (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-8 text-gray-500"
                  >
                    Chưa có bài thi nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal thêm/sửa bài thi */}
        <ExamModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
        />

        {/* Modal quản lý câu hỏi */}
        <QuestionModal
          isOpen={isQuestionModalOpen}
          exam={currentExam}
          questionForm={questionForm}
          setQuestionForm={setQuestionForm}
          handleAddQuestion={handleAddQuestion}
          handleDeleteQuestion={handleDeleteQuestion}
          handleEditQuestion={handleEditQuestion}
          editingQuestionId={editingQuestionId}
          onClose={() => {
            setIsQuestionModalOpen(false);
            setEditingQuestionId(null);
            setQuestionForm({
              question: "",
              type: "single",
              options: [
                { id: "A", text: "" },
                { id: "B", text: "" },
                { id: "C", text: "" },
                { id: "D", text: "" },
              ],
              correctAnswer: "",
              explanation: "",
            });
          }}
        />

        {/* Modal preview bài thi */}
        {isPreviewOpen && previewExam && (
          <ExamPreview 
            exam={previewExam} 
            onClose={() => setIsPreviewOpen(false)} 
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ManageExams;
