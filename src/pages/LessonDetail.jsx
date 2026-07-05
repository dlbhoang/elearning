// src/pages/LessonDetail.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { FiPlayCircle, FiCheckCircle, FiXCircle } from "react-icons/fi";
import ExerciseQuestion from "../components/lesson/ExerciseQuestion";
import ProgressBar from "../components/ProgressBar";
import { getLessonById, getExercisesByLesson, updateLessonProgress, getLessonProgress, createLessonScore } from "../services/lessonService";

const LessonDetail = () => {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState(null);
  const [savedProgress, setSavedProgress] = useState(null);

  const [videoEnded, setVideoEnded] = useState(false);
  const [videoWatchedTracked, setVideoWatchedTracked] = useState(false);
  const [videoTime, setVideoTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(600);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [shownTimedQuestions, setShownTimedQuestions] = useState(new Set()); // Track các câu hỏi đã hiển thị
  
  const playerRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  const videoElementRef = useRef(null);
  const intervalRef = useRef(null);

  // Fetch lesson từ API (qua service)
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await getLessonById(token, lessonId);
        if (res.status === "success") {
          const lessonData = res.data;
          setLesson(lessonData);
          setCourseId(lessonData.course_id);

          // Fetch exercises riêng
          try {
            const exercisesRes = await getExercisesByLesson(token, lessonId);
            if (exercisesRes.status === "success") {
              const exercises = Array.isArray(exercisesRes.data) ? exercisesRes.data : exercisesRes.data ? [exercisesRes.data] : [];
              lessonData.exercises = exercises;
              setLesson({ ...lessonData, exercises });
              
              // Khởi tạo answers array
              setAnswers(
                exercises?.length > 0
                  ? Array(exercises.length).fill(null)
                  : []
              );
            }
          } catch (exerciseErr) {
            console.error("Lỗi fetch exercises:", exerciseErr);
            lessonData.exercises = [];
          }

          // Fetch saved progress
          try {
            const progressRes = await getLessonProgress(token, lessonId);
            if (progressRes.status === "success") {
              const progress = progressRes.data;
              setSavedProgress(progress);
              console.log("✅ Tiến độ đã lưu:", progress);
              
              // Nếu đã xem video, set videoEnded = true
              if (progress.video_watched) {
                setVideoEnded(true);
                setVideoWatchedTracked(true);
              }
              
              // Nếu đã hoàn thành, set submitted = true
              if (progress.exercises_completed) {
                setSubmitted(true);
                setScore(10); // Perfect score vì đã hoàn thành
              }
            }
          } catch (progressErr) {
            console.warn("Lỗi fetch progress (có thể table chưa tồn tại):", progressErr);
          }
        } else {
          setLesson({
            title: "Bài học không tồn tại",
            media_url: "",
            media_type: "",
            exercises: [],
          });
        }
      } catch (err) {
        console.error("❌ Lỗi fetch lesson:", err);
        setLesson(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
    
    // Load YouTube API
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }

    // Reset states khi lesson thay đổi
    setShownTimedQuestions(new Set());
    setVideoTime(0);
    setIsPaused(false);
  }, [lessonId]);

  // Track video time and auto-show/pause on timed questions
  useEffect(() => {
    if (!lesson || lesson.media_type !== "video" || !lesson.media_url) return;

    // Sử dụng ref để track shown questions tránh stale closure
    const shownQuestionsRef = { current: new Set(shownTimedQuestions) };
    const isYouTube = lesson.media_url.includes("youtube");

    const trackVideoTime = setInterval(() => {
      try {
        let currentTime = 0;

        if (isYouTube) {
          // Lấy thời gian từ YouTube Player
          if (youtubePlayerRef.current && typeof youtubePlayerRef.current.getCurrentTime === 'function') {
            currentTime = youtubePlayerRef.current.getCurrentTime();
          } else {
            return;
          }
        } else {
          // Lấy thời gian từ HTML5 video element
          const videoElement = videoElementRef.current;
          if (videoElement && !isNaN(videoElement.currentTime)) {
            currentTime = videoElement.currentTime;
          } else {
            return;
          }
        }
        
        // Kiểm tra xem time có hợp lệ không
        if (isNaN(currentTime) || currentTime < 0) {
          return;
        }
        
        const roundedTime = Math.floor(currentTime);
        
        // Luôn cập nhật videoTime để câu hỏi có thể hiển thị
        setVideoTime(prev => {
          if (prev !== roundedTime && roundedTime > 0) {
            console.log(`🎬 Video time: ${roundedTime}s`);
          }
          return roundedTime;
        });

        // Kiểm tra xem có câu hỏi timed nào cần pause không
        const timedExercises = lesson?.exercises?.filter(ex => (ex.timestamp || 0) > 0) || [];
        
        if (timedExercises.length > 0 && roundedTime > 0) {
          // Tìm câu hỏi có timestamp đã đến (roundedTime >= timestamp) và chưa pause
          const nextTimedQuestion = timedExercises.find(ex => {
            const exTimestamp = Math.floor(ex.timestamp || 0);
            const isAtTimestamp = roundedTime >= exTimestamp;
            const notPausedYet = !shownQuestionsRef.current.has(ex.id);
            return isAtTimestamp && notPausedYet;
          });

          if (nextTimedQuestion && !isPaused) {
            console.log(`⏸️ Pausing video for question ${nextTimedQuestion.id} at ${nextTimedQuestion.timestamp}s (current: ${roundedTime}s)`);
            // Pause video khi đến câu hỏi timed
            if (isYouTube) {
              if (youtubePlayerRef.current && typeof youtubePlayerRef.current.pauseVideo === 'function') {
                youtubePlayerRef.current.pauseVideo();
                setIsPaused(true);
                shownQuestionsRef.current.add(nextTimedQuestion.id);
                setShownTimedQuestions(prev => new Set([...prev, nextTimedQuestion.id]));
              }
            } else {
              const videoElement = videoElementRef.current;
              if (videoElement) {
                videoElement.pause();
                setIsPaused(true);
                shownQuestionsRef.current.add(nextTimedQuestion.id);
                setShownTimedQuestions(prev => new Set([...prev, nextTimedQuestion.id]));
              }
            }
          }
        }
      } catch (err) {
        console.warn("Lỗi khi track video time:", err);
      }
    }, 1000); // Kiểm tra mỗi 1 giây

    return () => clearInterval(trackVideoTime);
  }, [lesson, isPaused]);

  const handleOptionChange = (qIdx, value) => {
    if (submitted) return;
    const newAns = [...answers];
    newAns[qIdx] = value;
    setAnswers(newAns);
  };

  // Handle video completion - auto mark as done if no exercises
  const handleVideoComplete = async () => {
    if (!courseId) return;
    
    try {
      const token = localStorage.getItem("token");
      const hasExercises = lesson?.exercises && lesson.exercises.length > 0;
      
      // Nếu không có bài tập, xem hết video = hoàn thành 100%
      const progressType = 'exercises_completed';
      
      await updateLessonProgress(token, lessonId, courseId, progressType);
      setVideoWatchedTracked(true);
      console.log("✅ Auto-marked: đã hoàn thành bài học (video ended, no exercises)");
      
      // Update saved progress state
      setSavedProgress(prev => ({
        ...prev,
        video_watched: true,
        exercises_completed: true,
        progress_percentage: 100
      }));
    } catch (err) {
      console.error("❌ Lỗi auto-mark completion:", err);
    }
  };

  // Filter exercises - show by timestamp
  const getVisibleExercises = () => {
    if (!lesson?.exercises) return [];
    
    // Luôn hiển thị exercises có timestamp = 0 (immediate exercises)
    const immediateExercises = lesson.exercises.filter((ex) => (ex.timestamp || 0) === 0);
    
    // Hiển thị timed exercises khi video đã đến timestamp đó
    const timedExercises = lesson.exercises.filter((ex) => {
      const exTimestamp = ex.timestamp || 0;
      if (exTimestamp <= 0) return false;
      
      // Hiển thị nếu videoTime >= timestamp (đã vượt qua hoặc đang ở timestamp)
      const shouldShow = videoTime >= exTimestamp;
      return shouldShow;
    });
    
    // Kết hợp cả hai loại và sắp xếp theo timestamp
    const allVisible = [...immediateExercises, ...timedExercises];
    const sorted = allVisible.sort((a, b) => {
      const tsA = a.timestamp || 0;
      const tsB = b.timestamp || 0;
      return tsA - tsB;
    });
    
    return sorted;
  };

  const visibleExercises = getVisibleExercises();
  
  // Check if there are any timed questions
  const hasTimedQuestions = lesson?.exercises?.some((ex) => (ex.timestamp || 0) > 0);
  
  // Always show exercises section if there are any exercises
  const shouldShowExercises = lesson?.exercises?.length > 0;

  // Initialize YouTube player when lesson loads
  useEffect(() => {
    if (!lesson || lesson.media_type !== "video" || !lesson.media_url) return;

    const initPlayer = () => {
      if (window.YT && window.YT.Player) {
        createYouTubePlayer(lesson.media_url);
      } else {
        // Wait for API to load
        setTimeout(() => initPlayer(), 100);
      }
    };

    initPlayer();
  }, [lesson]);

  // Extract YouTube video ID and create player
  const createYouTubePlayer = (url) => {
    try {
      const videoId = extractYouTubeID(url);
      if (!videoId) {
        console.log("❌ Could not extract YouTube ID, skipping player init");
        return;
      }

      if (!window.YT || !window.YT.Player) {
        console.log("❌ YouTube API not available yet");
        return;
      }

      console.log(`🎬 Creating YouTube player with ID: ${videoId}`);
      youtubePlayerRef.current = new window.YT.Player(playerRef.current, {
        height: "100%",
        width: "100%",
        videoId: videoId,
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    } catch (err) {
      console.warn("❌ Could not create YouTube player:", err);
    }
  };

  const onPlayerReady = (event) => {
    youtubePlayerRef.current = event.target;
    const duration = event.target.getDuration();
    setVideoDuration(Math.ceil(duration) || 600);
  };

  const onPlayerStateChange = (event) => {
    console.log("🎬 YouTube Player State:", event.data, "0=ended, 1=playing, 2=paused");
    // 0 = ended, 1 = playing, 2 = paused
    if (event.data === 0) {
      console.log("🎬 Video ended detected!");
      setVideoEnded(true);
      
      // Nếu bài học chỉ có video (không có bài tập), tự động mark as completed
      const hasExercises = lesson?.exercises && lesson.exercises.length > 0;
      console.log(`📊 Has exercises: ${hasExercises}, courseId: ${courseId}, videoWatchedTracked: ${videoWatchedTracked}`);
      
      if (!hasExercises && courseId && !videoWatchedTracked) {
        console.log("✅ Calling handleVideoComplete...");
        handleVideoComplete();
      }
    }
  };

  // Extract YouTube video ID from various URL formats
  const extractYouTubeID = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^?]+)/,
    ];
    for (let pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        console.log(`🎬 YouTube ID extracted: ${match[1]} from URL: ${url}`);
        return match[1];
      }
    }
    console.log(`⚠️ No YouTube ID found in URL: ${url}`);
    return null;
  };

  const handleSubmit = async () => {
    if (!lesson?.exercises?.length) return;

    let correct = 0;
    lesson.exercises.forEach((ex, idx) => {
      if (ex.type === "multiple_choice" && answers[idx] === ex.answer) correct++;
      else if (
        ex.type === "fill_blank" &&
        typeof answers[idx] === "string" &&
        answers[idx].trim().toLowerCase() === String(ex.answer).toLowerCase()
      )
        correct++;
      else if (ex.type === "essay" && answers[idx] !== null) {
        // For essay, we give credit if answer is provided (teacher will grade manually)
        correct++;
      }
      else if (ex.type === "matching" && answers[idx] !== null) {
        // For matching, check if student's mapping matches correct answer
        const studentMapping = answers[idx]; // { index: answer }
        const correctAnswers = Array.isArray(ex.answer) ? ex.answer : [];
        const leftItems = Array.isArray(ex.options) ? ex.options : [];
        
        // Count correct matches
        let matchCount = 0;
        for (let i = 0; i < leftItems.length; i++) {
          if (studentMapping[i] === correctAnswers[i]) {
            matchCount++;
          }
        }
        
        // Give points proportionally for matching (each correct pair is 1 point)
        if (matchCount > 0) {
          correct += matchCount / leftItems.length;
        }
      }
    });

    const totalScore = (correct / lesson.exercises.length) * 10;
    setScore(totalScore);
    setSubmitted(true);
    
    // Resume video after answering (if paused for timed question)
    if (isPaused) {
      const isYouTube = lesson?.media_url?.includes("youtube");
      if (isYouTube) {
        if (youtubePlayerRef.current && typeof youtubePlayerRef.current.playVideo === 'function') {
          youtubePlayerRef.current.playVideo();
          setIsPaused(false);
        }
      } else {
        const videoElement = videoElementRef.current;
        if (videoElement) {
          videoElement.play();
          setIsPaused(false);
        }
      }
    }

    // Tính toán details cho từng exercise
    const details = lesson.exercises.map((ex, idx) => {
      let score = 0;
      const answer = answers[idx];
      
      if (ex.type === "multiple_choice" && answer === ex.answer) {
        score = 10 / lesson.exercises.length;
      } else if (ex.type === "fill_blank" && answer && answer.trim().toLowerCase() === String(ex.answer).toLowerCase()) {
        score = 10 / lesson.exercises.length;
      } else if (ex.type === "essay" && answer) {
        // Essay cần giáo viên chấm, tạm thời không cho điểm
        score = 0;
      } else if (ex.type === "matching" && answer) {
        const correctAnswers = Array.isArray(ex.answer) ? ex.answer : [];
        const leftItems = Array.isArray(ex.options) ? ex.options : [];
        let matchCount = 0;
        for (let i = 0; i < leftItems.length; i++) {
          if (answer[i] === correctAnswers[i]) {
            matchCount++;
          }
        }
        score = (matchCount / leftItems.length) * (10 / lesson.exercises.length);
      }
      
      return {
        lesson_exercise_id: ex.id,
        student_answer: typeof answer === 'object' ? JSON.stringify(answer) : answer,
        score: Math.round(score * 100) / 100
      };
    });

    // Kiểm tra xem có bài essay cần giáo viên chấm không
    const hasEssay = lesson.exercises.some(ex => ex.type === "essay");

    // Gọi API để lưu điểm
    try {
      const token = localStorage.getItem("token");
      const scoreData = {
        lesson_id: lessonId,
        total_score: Math.round(totalScore * 100) / 100,
        comment: null,
        details: details,
        exercises: lesson.exercises // Gửi kèm để backend kiểm tra essay
      };

      const scoreResult = await createLessonScore(token, scoreData);
      console.log("✅ Đã lưu điểm:", scoreResult);

      // Nếu có essay và cần giáo viên chấm
      if (hasEssay && scoreResult.data?.needsGrading) {
        Swal.fire({
          title: "✅ Đã nộp bài!",
          text: "Bài tập của bạn đã được gửi và đang chờ giáo viên chấm điểm. Bạn sẽ nhận được thông báo khi có kết quả.",
          icon: "info",
        });
      } else {
        Swal.fire({
          title: totalScore >= 5 ? "🎉 Chúc mừng!" : "😢 Thử lại nhé!",
          text: `Bạn đạt ${totalScore.toFixed(1)}/10 điểm`,
          icon: totalScore >= 5 ? "success" : "error",
        });
      }
    } catch (err) {
      console.error("❌ Lỗi lưu điểm:", err);
      Swal.fire({
        title: "Lỗi",
        text: "Không thể lưu điểm. Vui lòng thử lại.",
        icon: "error",
      });
    }

    // Cập nhật progress: hoàn thành bài tập = 100%
    if (courseId && totalScore >= 5) {
      try {
        const token = localStorage.getItem("token");
        await updateLessonProgress(token, lessonId, courseId, 'exercises_completed');
        console.log("✅ Cập nhật: đã hoàn thành bài tập");
        
        // Update saved progress thay vì reload
        setSavedProgress(prev => ({
          ...prev,
          exercises_completed: true,
          progress_percentage: 100,
          video_watched: true
        }));
      } catch (err) {
        console.error("❌ Lỗi cập nhật tiến độ bài tập:", err);
      }
    }
  };

  // Animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg">
        Đang tải bài học...
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg">
        Không tìm thấy bài học
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20 px-6 lg:px-20">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
        {/* Tiêu đề */}
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          {lesson.title}
        </h1>

        {/* Video / PPT */}
        <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
          {lesson.media_type === "video" ? (
            <>
              {lesson.media_url.includes("youtube") ? (
                <div ref={playerRef} className="w-full aspect-video"></div>
              ) : (
                <video
                  ref={videoElementRef}
                  src={lesson.media_url}
                  controls
                  className="w-full aspect-video"
                  onTimeUpdate={(e) => {
                    // Update videoTime khi video phát
                    const currentTime = Math.floor(e.target.currentTime);
                    setVideoTime(currentTime);
                  }}
                  onPlay={() => setIsPaused(false)}
                  onPause={() => setIsPaused(true)}
                  onEnded={() => {
                    setVideoEnded(true);
                    // Nếu bài học chỉ có video (không có bài tập), tự động mark as completed
                    const hasExercises = lesson?.exercises && lesson.exercises.length > 0;
                    if (!hasExercises && courseId && !videoWatchedTracked) {
                      handleVideoComplete();
                    }
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              )}
              
              {/* Hiển thị thông tin về timed questions nếu có */}
              {hasTimedQuestions && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 border-t border-blue-200 dark:border-blue-700">
                  <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
                    ℹ️ Video sẽ tự động dừng tại các mốc thời gian: {lesson.exercises
                      .filter(ex => (ex.timestamp || 0) > 0)
                      .map(ex => `${ex.timestamp}s`)
                      .join(', ')} để hiển thị câu hỏi
                  </p>
                </div>
              )}
            </>
          ) : lesson.media_type === "ppt" ? (
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                lesson.media_url
              )}`}
              title="Bài giảng PPT"
              className="w-full aspect-[4/3]"
            ></iframe>
          ) : (
            <p className="text-center text-gray-500">Không có nội dung media</p>
          )}
        </div>

        {/* Thông báo đã xem video */}
        {videoEnded && savedProgress?.video_watched && (
          <div className="flex justify-center mb-4">
            <div className="px-6 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-2xl font-semibold">
              <FiCheckCircle className="inline-block mr-2" />
              ✅ Bạn đã xem video (50%)
            </div>
          </div>
        )}

        {/* Thông báo hoàn thành bài học (nếu chỉ có video) */}
        {videoEnded && savedProgress?.exercises_completed && !lesson?.exercises?.length && (
          <div className="flex justify-center mb-4">
            <div className="px-6 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-2xl font-semibold">
              <FiCheckCircle className="inline-block mr-2" />
              ✅ Bạn đã hoàn thành bài học (100%)
            </div>
          </div>
        )}

        {/* Bài tập - hiển thị theo timestamp */}
        {shouldShowExercises && (
          <motion.div
            className="mt-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                {isPaused ? "⏸️ Câu hỏi (Video đã dừng)" : "Bài tập củng cố"}
              </h2>
              {isPaused && (
                <button
                  onClick={() => {
                    const isYouTube = lesson?.media_url?.includes("youtube");
                    if (isYouTube) {
                      if (youtubePlayerRef.current && typeof youtubePlayerRef.current.playVideo === 'function') {
                        youtubePlayerRef.current.playVideo();
                        setIsPaused(false);
                      }
                    } else {
                      const videoElement = videoElementRef.current;
                      if (videoElement) {
                        videoElement.play();
                        setIsPaused(false);
                      }
                    }
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium"
                >
                  ▶️ Tiếp tục phát video
                </button>
              )}
            </div>

            {!lesson.exercises?.length ? (
              <p className="text-center text-gray-500 italic">
                Hiện không có bài tập nào cho bài học này
              </p>
            ) : (
              <>
                {/* Thông báo về timed questions chưa hiển thị */}
                {visibleExercises.length < lesson.exercises.length && !submitted && hasTimedQuestions && (
                  <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500 rounded-lg">
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      ⏱️ Còn {lesson.exercises.length - visibleExercises.length} câu hỏi sẽ hiển thị khi video chạy đến các mốc thời gian tương ứng
                    </p>
                  </div>
                )}

                {/* Tiến độ */}
                <ProgressBar
                  current={answers.filter((a) => a !== null).length}
                  total={visibleExercises.length || lesson.exercises.length}
                />

                {/* Danh sách câu hỏi */}
                {visibleExercises.length > 0 ? (
                  visibleExercises.map((ex, idx) => {
                    // Find original index in full exercises list
                    const originalIdx = lesson.exercises.findIndex((e) => e.id === ex.id);
                    return (
                      <motion.div key={idx} variants={itemVariants}>
                        <ExerciseQuestion
                          ex={ex}
                          idx={idx}
                          answer={answers[originalIdx]}
                          submitted={submitted}
                          handleOptionChange={(qIdx, value) => 
                            handleOptionChange(originalIdx, value)
                          }
                        />
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 italic mb-4">
                      {hasTimedQuestions 
                        ? "Xem video để các câu hỏi hiển thị tự động theo mốc thời gian"
                        : "Hiện chưa có câu hỏi nào để hiển thị"
                      }
                    </p>
                    {hasTimedQuestions && (
                      <div className="text-sm text-gray-400">
                        Video sẽ tự động dừng khi đến các mốc: {lesson.exercises
                          .filter(ex => (ex.timestamp || 0) > 0)
                          .map(ex => `${ex.timestamp}s`)
                          .join(', ')}
                      </div>
                    )}
                  </div>
                )}

                {/* Submit */}
                {!submitted && visibleExercises.length > 0 && (
                  <motion.div
                    variants={itemVariants}
                    className="flex justify-center"
                  >
                    <button
                      className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-semibold shadow-lg hover:scale-105 transform transition"
                      onClick={handleSubmit}
                    >
                      Nộp bài
                    </button>
                  </motion.div>
                )}

                {/* Kết quả */}
                {submitted && (
                  <motion.div
                    variants={itemVariants}
                    className="mt-8 p-6 rounded-2xl bg-gray-100 dark:bg-gray-700 text-center shadow-lg"
                  >
                    {savedProgress?.exercises_completed ? (
                      <>
                        <FiCheckCircle className="mx-auto text-green-500 text-5xl mb-3" />
                        <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          ✅ Bạn đã hoàn thành bài học
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Bạn có thể quay lại học các bài khác hoặc xem lại bài học này
                        </p>
                      </>
                    ) : (
                      <>
                        {score >= 5 ? (
                          <FiCheckCircle className="mx-auto text-green-500 text-5xl mb-3" />
                        ) : (
                          <FiXCircle className="mx-auto text-red-500 text-5xl mb-3" />
                        )}
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          Điểm của bạn: {score}/10
                        </p>
                      </>
                    )}
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LessonDetail;
