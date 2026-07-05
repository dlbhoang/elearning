import React, { useState, useEffect } from "react";
import { FiPlayCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import ExamCard from "./ExamCard";
import ResultDialog from "./ResultDialog";
import { getLessonsByChapter, getLessonProgress } from "../services/lessonService";

const ChapterList = ({ chapters, exams, enrollmentStatus, enrolled }) => {
  const navigate = useNavigate();
  const [openResultId, setOpenResultId] = useState(null);
  const [lessonsByChapter, setLessonsByChapter] = useState({});
  const [lessonProgress, setLessonProgress] = useState({}); // Track progress for each lesson
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  const fetchLessons = async (chapterId) => {
    try {
      setLoading((prev) => ({ ...prev, [chapterId]: true }));
      setErrors((prev) => ({ ...prev, [chapterId]: null }));
      const token = localStorage.getItem("token");
      const data = await getLessonsByChapter(token, chapterId);

      if (data.status === "success") {
        console.log(`✅ Lấy lessons của chapter ${chapterId}:`, data.data);
        setLessonsByChapter((prev) => ({
          ...prev,
          [chapterId]: data.data,
        }));

        // Fetch progress for each lesson
        data.data.forEach(async (lesson) => {
          try {
            const progressData = await getLessonProgress(token, lesson.id);
            console.log(`📊 Progress raw data cho lesson ${lesson.id}:`, progressData);
            // lessonService returns res.data, which has { status, data: {...} } structure
            const progressInfo = progressData?.data || {};
            setLessonProgress((prev) => ({
              ...prev,
              [lesson.id]: progressInfo,
            }));
            console.log(`📊 Progress parsed cho lesson ${lesson.id}:`, progressInfo);
          } catch (progressErr) {
            console.warn(`⚠️ Không lấy được progress cho lesson ${lesson.id}:`, progressErr);
          }
        });
      } else {
        console.warn(`⚠️ Không lấy được lessons của chapter ${chapterId}:`, data);
        setErrors((prev) => ({ ...prev, [chapterId]: data.message || "Không thể lấy dữ liệu" }));
      }
    } catch (error) {
      console.error(`❌ Lỗi fetch lessons cho chapter ${chapterId}:`, error);
      setErrors((prev) => ({ ...prev, [chapterId]: error.message || "Lỗi khi tải bài học" }));
    } finally {
      setLoading((prev) => ({ ...prev, [chapterId]: false }));
    }
  };

  useEffect(() => {
    console.log("📚 Chapters:", chapters);
    chapters.forEach((ch) => {
      fetchLessons(ch.id);
    });
    
    // Auto-refresh progress mỗi 5 giây
    const progressInterval = setInterval(() => {
      chapters.forEach((ch) => {
        fetchLessons(ch.id);
      });
    }, 5000);
    
    return () => clearInterval(progressInterval);
  }, [chapters]);

  // ✅ Sử dụng 'enrolled' hoặc 'enrollmentStatus'
  const canAccess = enrolled || enrollmentStatus === "paid";
  const isPending = enrollmentStatus === "pending";
  const isBlocked = enrollmentStatus === "failed" || enrollmentStatus === "refunded";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Nội dung khóa học
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {chapters.length} chương • {Object.values(lessonsByChapter).flat().length} bài học
        </div>
      </div>

      {chapters.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Chưa có nội dung cho khóa học này.
          </p>
        </div>
      )}

      {chapters.map((chapter, index) => (
        <React.Fragment key={chapter.id}>
          <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-bold">
                  {index + 1}
                </span>
                {chapter.title}
              </h3>
              {lessonsByChapter[chapter.id] && lessonsByChapter[chapter.id].length > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {lessonsByChapter[chapter.id].length} bài học
                </span>
              )}
            </div>

            <ul className="space-y-3">
              {loading[chapter.id] ? (
                <li className="flex items-center gap-3 p-3 text-gray-400">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
                  <span className="text-sm">Đang tải bài học...</span>
                </li>
              ) : errors[chapter.id] ? (
                <li className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    ❌ {errors[chapter.id]}
                  </p>
                </li>
              ) : lessonsByChapter[chapter.id]?.length > 0 ? (
                lessonsByChapter[chapter.id].map((lesson, lessonIndex) => (
                  <li
                    key={lesson.id}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 border
                      ${
                        canAccess
                          ? "bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600 cursor-pointer hover:shadow-md hover:scale-[1.02]"
                          : "bg-gray-100 dark:bg-gray-700/30 cursor-not-allowed opacity-60 border-gray-200 dark:border-gray-700 relative"
                      }`}
                    onClick={() => {
                      if (canAccess) {
                        navigate(`/lesson/${lesson.id}`);
                      } else if (isPending) {
                        alert("⚠️ Bạn đã đăng ký khóa học, đang chờ thanh toán.");
                      } else if (isBlocked) {
                        alert("⚠️ Bạn chưa đăng ký hoặc giao dịch thất bại.");
                      }
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        canAccess ? 'bg-primary/10 text-primary' : 'bg-gray-300 dark:bg-gray-600 text-gray-500'
                      }`}>
                        {lessonProgress[lesson.id]?.exercises_completed ? (
                          <span className="text-lg">✅</span>
                        ) : lessonProgress[lesson.id]?.video_watched ? (
                          <span className="text-lg">👁️</span>
                        ) : (
                          <FiPlayCircle className={canAccess ? 'text-primary' : 'text-gray-400'} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">{lesson.title}</span>
                          {lessonProgress[lesson.id]?.exercises_completed && (
                            <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full font-medium">
                              ✅ Hoàn thành
                            </span>
                          )}
                          {lessonProgress[lesson.id]?.video_watched && !lessonProgress[lesson.id]?.exercises_completed && (
                            <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full font-medium">
                              👁️ Xem video
                            </span>
                          )}
                          {isPending && !lessonProgress[lesson.id] && (
                            <span className="px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full font-medium">
                              Đang chờ
                            </span>
                          )}
                        </div>
                        {lesson.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                            {lesson.description}
                          </p>
                        )}
                        {lessonProgress[lesson.id] && (
                          <div className="mt-1 text-xs text-gray-500">
                            📊 Tiến độ: {
                              lessonProgress[lesson.id].exercises_completed 
                                ? "100" 
                                : lessonProgress[lesson.id].video_watched 
                                ? "50" 
                                : "0"
                            }%
                          </div>
                        )}
                      </div>
                    </div>
                    {lesson.duration && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full whitespace-nowrap ml-3">
                        ⏱ {lesson.duration}
                      </span>
                    )}
                  </li>
                ))
              ) : (
                <li className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-2xl">📖</span>
                    <span>Chưa có bài học nào trong chương này.</span>
                  </div>
                </li>
              )}
            </ul>
          </div>

          {exams[index] && (
            <div className="mb-6">
              <ExamCard exam={exams[index]} setOpenResultId={setOpenResultId} />
            </div>
          )}
        </React.Fragment>
      ))}

      {openResultId && (
        <ResultDialog
          exams={exams}
          openResultId={openResultId}
          setOpenResultId={setOpenResultId}
        />
      )}
    </div>
  );
};

export default ChapterList;
