import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiClock, FiAlertTriangle, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import { getExamById } from '../services/examService';
import ResultModal from '../components/ResultModal';

const ExamTaking = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [showResultModal, setShowResultModal] = useState(false);
  const [score, setScore] = useState(null);

  const [examInfo, setExamInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const intervalRef = useRef(null);
  const [examStarted, setExamStarted] = useState(false);

  // Lấy dữ liệu bài thi từ API
  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Vui lòng đăng nhập');
          return;
        }

        console.log('📋 Đang lấy bài thi:', examId);
        const response = await getExamById(token, examId);
        console.log('✅ Response từ API:', response);

        // Xử lý cả 2 format response
        const examData = response.data || response;
        console.log('✅ Exam data sau parse:', examData);
        console.log('📝 Questions:', examData?.questions);

        if (examData?.questions && examData.questions.length > 0) {
          // Parse JSON nếu cần
          const parsedQuestions = examData.questions.map(q => {
            try {
              const parsed = { ...q };
              
              // Parse options: nếu string thì parse, nếu đã là object thì giữ nguyên
              if (typeof parsed.options === 'string') {
                try {
                  parsed.options = JSON.parse(parsed.options);
                } catch (e) {
                  console.warn(`⚠️ Options không phải JSON hợp lệ:`, parsed.options);
                }
              }
              
              // Parse correct_answer: 
              // - Nếu là array (matching) thì parse
              // - Nếu là string đơn (single/multiple) thì giữ nguyên
              if (typeof parsed.correct_answer === 'string') {
                if (parsed.correct_answer.startsWith('[')) {
                  // Là JSON array
                  try {
                    parsed.correct_answer = JSON.parse(parsed.correct_answer);
                  } catch (e) {
                    console.warn(`⚠️ correct_answer không phải JSON hợp lệ:`, parsed.correct_answer);
                  }
                }
                // Còn lại giữ nguyên string (single/multiple choice)
              }
              
              return parsed;
            } catch (parseErr) {
              console.error('❌ Lỗi parse question:', q, parseErr);
              return q;
            }
          });
          
          console.log('✅ Parsed questions:', parsedQuestions);
          setExamInfo(examData);
          setQuestions(parsedQuestions);
          setTimeLeft((examData.duration || 45) * 60);
          setCurrentQuestion(0);
          setAnswers({});
          setExamStarted(false);
          setShowConfirmSubmit(false);
        } else {
          console.error('❌ Không có questions:', { examData, hasQuestions: !!examData?.questions, length: examData?.questions?.length });
          setError('Không tìm thấy câu hỏi cho bài thi này');
        }
      } catch (err) {
        console.error('❌ Lỗi lấy bài thi:', err);
        // Lấy thông báo lỗi từ response nếu có
        const errorMessage = err.response?.data?.message || err.message || 'Không thể lấy bài thi';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId]);

  // Timer
  useEffect(() => {
    if (examStarted && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [examStarted, isPaused, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
  };

  const handleStartExam = () => setExamStarted(true);
  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };
  const handleNextQuestion = () => { if(currentQuestion < questions.length-1) setCurrentQuestion(prev => prev+1) };
  const handlePrevQuestion = () => { if(currentQuestion > 0) setCurrentQuestion(prev => prev-1) };
  const handleGoToQuestion = (index) => setCurrentQuestion(index);
  const handleSubmitExam = () => setShowConfirmSubmit(true);

  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach(q => {
      const correctAnswer = q.correct_answer; // Luôn dùng snake_case từ server
      if(answers[q.id] === correctAnswer) correctCount++;
    });
    const maxScore = examInfo.max_score || examInfo.maxScore || 100;
    return questions.length > 0 ? (correctCount / questions.length) * maxScore : 0;
  };

  const confirmSubmit = () => {
    const calculatedScore = calculateScore();
    setScore(calculatedScore);
    setShowConfirmSubmit(false);
    setShowResultModal(true);
  };

  const handleResultModalClose = () => {
    setShowResultModal(false);
    navigate(-1, { state: { submitted: true, score } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Đang tải bài thi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    // Kiểm tra xem có phải lỗi enrollment không
    const isEnrollmentError = error.includes('chưa đăng ký') || error.includes('chưa thanh toán') || error.includes('403');
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {isEnrollmentError ? 'Bạn chưa đăng ký khóa học này' : 'Lỗi'}
          </h2>
          <p className="text-red-600 dark:text-red-400 text-lg mb-6">
            {isEnrollmentError 
              ? 'Để làm bài thi, bạn cần đăng ký và thanh toán khóa học trước.'
              : error
            }
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Quay lại
            </button>
            {isEnrollmentError && (
              <button 
                onClick={() => navigate('/courses')}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Xem khóa học
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!examInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 dark:text-gray-400">
        Đang tải hoặc không có dữ liệu bài thi...
      </div>
    );
  }
  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
        <div className="max-w-3xl w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-10">
          <h1 className="text-4xl font-extrabold mb-6 text-gray-900 dark:text-white text-center">{examInfo.title}</h1>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-6 text-gray-700 dark:text-gray-300">
            <div className="space-y-2">
              <p className="text-lg"><span className="font-semibold">Giáo viên:</span> {examInfo.teacher}</p>
              <p className="text-lg"><span className="font-semibold">Lớp:</span> {examInfo.classroom}</p>
            </div>
            <div className="space-y-2 text-right sm:text-left">
              <p className="text-lg"><span className="font-semibold">Thời gian làm bài:</span> {examInfo.duration} phút</p>
              <p className="text-lg"><span className="font-semibold">Số câu hỏi:</span> {examInfo.total_questions || examInfo.totalQuestions || questions.length}</p>
              <p className="text-lg"><span className="font-semibold">Điểm tối đa:</span> {examInfo.max_score || examInfo.maxScore || 100}</p>
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200 border-b-2 border-primary w-max pb-1">Hướng dẫn làm bài</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              {Array.isArray(examInfo.instructions) 
                ? examInfo.instructions.map((item, i) => <li key={i} className="hover:text-primary transition-colors cursor-default">{item}</li>)
                : examInfo.instructions && <li className="hover:text-primary transition-colors cursor-default">{examInfo.instructions}</li>
              }
            </ul>
          </div>

          <button onClick={handleStartExam} className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-xl hover:bg-primary/90 transition">Bắt đầu làm bài</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 lg:pt-24 px-4">
      <div className="max-w-6xl mx-auto p-10 bg-white dark:bg-gray-800 rounded-3xl shadow-xl">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">{examInfo.title}</h2>
          <div className={`flex items-center gap-3 px-5 py-2 rounded-3xl font-mono font-semibold text-lg select-none
            ${timeLeft<300?'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-400 animate-pulse':timeLeft<600?'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-400':'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400'}`}>
            <FiClock className="animate-spin-slow" size={24}/>
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Question Card */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity:0, x:50 }}
          animate={{ opacity:1, x:0 }}
          exit={{ opacity:0, x:-50 }}
          transition={{ duration:0.3 }}
          className="mb-12 bg-gray-100 dark:bg-gray-700 rounded-3xl p-8 shadow-inner"
        >
          <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Câu {currentQuestion+1}/{questions.length} — {questions[currentQuestion]?.type==='single'?'Chọn một đáp án':questions[currentQuestion]?.type==='matching'?'Nối các cặp':'Chọn nhiều đáp án'}
          </h3>
          <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200 mb-8">{questions[currentQuestion].question}</p>
          
          {/* Single/Multiple Choice */}
          {(questions[currentQuestion].type === 'single' || questions[currentQuestion].type === 'multiple') && (
            <div className="space-y-5">
              {Array.isArray(questions[currentQuestion].options) ? (
                // Format: Array of objects
                questions[currentQuestion].options.map(opt=>(
                  <label key={opt.id} className={`flex items-center gap-5 p-5 rounded-xl cursor-pointer select-none transition
                    ${answers[questions[currentQuestion].id]===opt.id?'border-4 border-primary bg-primary/30 text-primary dark:text-primary-light':'border border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-primary/10 dark:hover:bg-primary/20'}`}>
                    <input
                      type="radio"
                      name={`q${questions[currentQuestion].id}`}
                      value={opt.id}
                      checked={answers[questions[currentQuestion].id]===opt.id}
                      onChange={()=>handleAnswerSelect(questions[currentQuestion].id,opt.id)}
                      className="w-6 h-6 accent-primary"
                    />
                    <span className="font-semibold text-xl">{opt.id}.</span>
                    <span className="text-lg">{opt.text}</span>
                  </label>
                ))
              ) : (
                // Format: Object {a: "text", b: "text", ...}
                Object.entries(questions[currentQuestion].options || {}).map(([key, value])=>(
                  <label key={key} className={`flex items-center gap-5 p-5 rounded-xl cursor-pointer select-none transition
                    ${answers[questions[currentQuestion].id]===key?'border-4 border-primary bg-primary/30 text-primary dark:text-primary-light':'border border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-primary/10 dark:hover:bg-primary/20'}`}>
                    <input
                      type="radio"
                      name={`q${questions[currentQuestion].id}`}
                      value={key}
                      checked={answers[questions[currentQuestion].id]===key}
                      onChange={()=>handleAnswerSelect(questions[currentQuestion].id,key)}
                      className="w-6 h-6 accent-primary"
                    />
                    <span className="font-semibold text-xl">{key.toUpperCase()}.</span>
                    <span className="text-lg">{value}</span>
                  </label>
                ))
              )}
            </div>
          )}

          {/* Matching Type */}
          {questions[currentQuestion].type === 'matching' && (
            <div className="grid grid-cols-2 gap-6">
              {/* Bên trái */}
              <div>
                <h4 className="font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">Bên trái</h4>
                <div className="space-y-3">
                  {Array.isArray(questions[currentQuestion].options) && questions[currentQuestion].options.map((item, idx) => (
                    <div key={idx} className="p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600">
                      {item && typeof item === 'string' && item.startsWith('data:image') ? (
                        <img src={item} alt={`Left ${idx}`} className="h-20 w-full object-cover rounded" />
                      ) : (
                        <span className="text-gray-900 dark:text-gray-100">{item}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bên phải */}
              <div>
                <h4 className="font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">Bên phải</h4>
                <div className="space-y-3">
                  {Array.isArray(questions[currentQuestion].correct_answer) && 
                    questions[currentQuestion].correct_answer.map((item, idx) => (
                    <div key={idx} className="p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600">
                      {item && typeof item === 'string' && item.startsWith('data:image') ? (
                        <img src={item} alt={`Right ${idx}`} className="h-20 w-full object-cover rounded" />
                      ) : (
                        <span className="text-gray-900 dark:text-gray-100">{item}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between items-center mb-12">
          <button disabled={currentQuestion===0} onClick={handlePrevQuestion} className="flex items-center gap-3 px-7 py-4 rounded-2xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
            <FiChevronLeft size={24}/> Câu trước
          </button>
          <button disabled={currentQuestion===questions.length-1} onClick={handleNextQuestion} className="flex items-center gap-3 px-7 py-4 rounded-2xl bg-primary text-white disabled:opacity-40 hover:bg-primary/90 transition">
            Câu tiếp <FiChevronRight size={24}/>
          </button>
        </div>

        {/* Sidebar */}
        <div>
          <h4 className="mb-6 font-semibold text-gray-900 dark:text-white text-xl">Danh sách câu hỏi</h4>
          <div className="grid grid-cols-8 gap-4">
            {questions.map((q,i)=>(
              <motion.button key={q.id} onClick={()=>handleGoToQuestion(i)} whileHover={{scale:1.1}} whileTap={{scale:0.95}}
                className={`p-4 rounded-xl font-semibold text-center
                  ${i===currentQuestion?'bg-primary text-white shadow-lg':answers[q.id]?'bg-green-300 text-green-900 dark:bg-green-900 dark:text-green-400 hover:bg-green-400 dark:hover:bg-green-800':'bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-600'}`}
                title={`Câu ${i+1} ${answers[q.id]?'(Đã trả lời)':'(Chưa trả lời)'}`}
              >{i+1}</motion.button>
            ))}
          </div>
        </div>

        {/* Submit button */}
        <div className="mt-14 text-center">
          <button onClick={handleSubmitExam} className="inline-block px-14 py-5 rounded-full bg-primary text-white font-bold text-xl shadow-lg hover:bg-primary/90 transition">Nộp bài</button>
        </div>

        {/* Confirm Submit Modal */}
        <AnimatePresence>
          {showConfirmSubmit && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-5">
              <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.8, opacity:0}} className="bg-white dark:bg-gray-800 rounded-3xl p-10 max-w-lg w-full shadow-xl text-center">
                <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiAlertTriangle className="text-4xl text-yellow-600"/>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-5">Xác nhận nộp bài</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-8">Bạn có chắc chắn muốn nộp bài thi? Hành động này không thể hoàn tác.</p>
                <div className="flex gap-6">
                  <button onClick={()=>setShowConfirmSubmit(false)} className="flex-1 px-6 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition">Hủy</button>
                  <button onClick={confirmSubmit} className="flex-1 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition">Nộp bài</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Modal */}
        {showResultModal && <ResultModal score={score} onClose={handleResultModalClose} autoClose={10} />}

      </div>
    </div>
  );
};

export default ExamTaking;
