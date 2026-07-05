export const coursesData = [
  {
    id: 1,
    title: "Ôn tập Toán hình học 10",
    subject: "Toán",
    grade: "Lớp 10",
    teacher: "Thầy Nguyễn Văn A",
    duration: "20 giờ",
    students: 120,
    rating: 4.5,
    price: 500000,
    progress: 60,
    isEnrolled: true,
    description: "Khóa học giúp học sinh nắm vững kiến thức hình học lớp 10, luyện tập bài tập và chuẩn bị cho kiểm tra."
  },
  {
    id: 2,
    title: "Ngữ Văn hiện đại lớp 10",
    subject: "Văn",
    grade: "Lớp 10",
    teacher: "Cô Mai Hương",
    duration: "15 giờ",
    students: 80,
    rating: 4.2,
    price: 450000,
    progress: 30,
    isEnrolled: true,
    description: "Khóa học tập trung vào văn học hiện đại, giúp học sinh phân tích tác phẩm và viết bài nghị luận."
  },
  {
    id: 3,
    title: "Tiếng Anh giao tiếp lớp 10",
    subject: "Anh",
    grade: "Lớp 10",
    teacher: "Cô Trần Thị B",
    duration: "25 giờ",
    students: 200,
    rating: 4.8,
    price: 600000,
    progress: 0,
    isEnrolled: false,
    description: "Khóa học tiếng Anh giúp học sinh luyện nghe nói, từ vựng và cấu trúc câu cơ bản."
  }
];

export const chaptersData = {
  1: [
  {
    id: "ch1",
    title: "Chương 1: Hình học cơ bản",
    lessons: [
      { id: "l1", title: "Bài 1: Đường thẳng & Góc", duration: "30 phút" },
      { id: "l2", title: "Bài 2: Tam giác", duration: "45 phút" },
      { id: "l3", title: "Bài 3: Quan hệ cạnh và góc trong tam giác", duration: "40 phút" },
      { id: "l4", title: "Bài 4: Đường trung tuyến, phân giác và cao", duration: "50 phút" }
    ]
  },
  {
    id: "ch2",
    title: "Chương 2: Tứ giác và đa giác",
    lessons: [
      { id: "l5", title: "Bài 5: Hình bình hành", duration: "40 phút" },
      { id: "l6", title: "Bài 6: Hình thang", duration: "35 phút" },
      { id: "l7", title: "Bài 7: Hình chữ nhật, hình vuông", duration: "45 phút" },
      { id: "l8", title: "Bài 8: Hình thoi và đa giác đều", duration: "50 phút" }
    ]
  },
  {
    id: "ch3",
    title: "Chương 3: Đường tròn",
    lessons: [
      { id: "l9", title: "Bài 9: Các yếu tố của đường tròn", duration: "30 phút" },
      { id: "l10", title: "Bài 10: Góc và cung trong đường tròn", duration: "40 phút" }
    ]
  }
],
  2: [
    {
      id: "ch1",
      title: "Chương 1: Văn bản hiện đại",
      lessons: [
        { id: "l5", title: "Bài 1: Tác giả Nam Cao", duration: "50 phút" },
        { id: "l6", title: "Bài 2: Truyện ngắn hiện đại", duration: "40 phút" }
      ]
    }
  ]
};

export const examData = [
  {
    id: 1,
    title: "Kiểm tra 15 phút - Toán học",
    subject: "Toán",
    type: "15 phút",
    date: "2024-01-15",
    time: "08:00",
    duration: 15,
    status: "completed",
    totalQuestions: 10,
    maxScore: 10,
    description: "Hàm số bậc nhất và bậc hai",
    teacher: "Thầy Nguyễn Văn A",
    classroom: "Lớp 10A1",
    isCompleted: true,
    score: 8,
    difficulty: "Trung bình",
    courseId: 1,
    questions: [
      { q: "Câu 1: 2 + 2 = ?", correct: true },
      { q: "Câu 2: 3 * 3 = ?", correct: false },
      { q: "Câu 3: 5 - 1 = ?", correct: true },
      { q: "Câu 4: 10 / 2 = ?", correct: true },
      { q: "Câu 5: 7 + 2 = ?", correct: false },
      { q: "Câu 6: 9 - 3 = ?", correct: true },
      { q: "Câu 7: 6 * 2 = ?", correct: true },
      { q: "Câu 8: 8 / 4 = ?", correct: true },
      { q: "Câu 9: 5 + 5 = ?", correct: false },
      { q: "Câu 10: 1 + 1 = ?", correct: true }
    ],
    comment: ""
  },
  {
    id: 2,
    title: "Kiểm tra 1 tiết - Vật lý",
    subject: "Vật lý",
    type: "1 tiết",
    date: "2024-02-10",
    time: "09:30",
    duration: 45,
    status: "completed",
    totalQuestions: 20,
    maxScore: 10,
    description: "Định luật Newton và ứng dụng",
    teacher: "Cô Trần Thị B",
    classroom: "Lớp 10A2",
    isCompleted: true,
    score: 7,
    difficulty: "Khó",
    courseId: 4,
    questions: [
      { q: "Câu 1: Lực bằng khối lượng * gia tốc?", correct: true },
      { q: "Câu 2: Vật rơi tự do không chịu tác dụng lực?", correct: false },
      { q: "Câu 3: Định luật III Newton?", correct: true },
      { q: "Câu 4: Vận tốc không đổi khi có lực?", correct: false },
      { q: "Câu 5: Lực ma sát luôn hướng ngược?", correct: true },
      { q: "Câu 6: Trọng lực là lực hấp dẫn?", correct: true },
      { q: "Câu 7: Công thức W = F * s?", correct: true },
      { q: "Câu 8: Năng lượng không bảo toàn?", correct: false },
      { q: "Câu 9: Quán tính là gì?", correct: true },
      { q: "Câu 10: Lực hướng tâm?", correct: true },
      { q: "Câu 11: Gia tốc trọng trường?", correct: true },
      { q: "Câu 12: Vật nặng rơi nhanh hơn nhẹ?", correct: false },
      { q: "Câu 13: Đơn vị lực là N?", correct: true },
      { q: "Câu 14: Lực ma sát động bằng 0?", correct: false },
      { q: "Câu 15: Công thức F = m * a?", correct: true },
      { q: "Câu 16: Định luật I Newton?", correct: true },
      { q: "Câu 17: Vật đứng yên luôn chịu lực?", correct: true },
      { q: "Câu 18: Lực đàn hồi hướng ngược biến dạng?", correct: true },
      { q: "Câu 19: Lực hấp dẫn biến đổi theo khối lượng?", correct: true },
      { q: "Câu 20: Vật nặng có trọng lực lớn hơn?", correct: true }
    ],
    comment: ""
  },
  {
    id: 3,
    title: "Kiểm tra giữa kỳ - Ngữ văn",
    subject: "Ngữ văn",
    type: "Giữa kỳ",
    date: "2024-03-05",
    time: "13:00",
    duration: 90,
    status: "upcoming",
    totalQuestions: 5,
    maxScore: 10,
    description: "Tác phẩm văn học hiện đại",
    teacher: "Cô Lê Thị C",
    classroom: "Lớp 10A3",
    isCompleted: false,
    score: null,
    difficulty: "Dễ",
    courseId: 2,
    comment: ""
  },
  {
    id: 4,
    title: "Kiểm tra cuối kỳ - Lịch sử",
    subject: "Lịch sử",
    type: "Cuối kỳ",
    date: "2024-05-25",
    time: "14:00",
    duration: 60,
    status: "upcoming",
    totalQuestions: 25,
    maxScore: 10,
    description: "Chiến tranh thế giới thứ hai",
    teacher: "Thầy Phạm Văn D",
    classroom: "Lớp 10A4",
    isCompleted: false,
    score: null,
    difficulty: "Trung bình",
    courseId: null,
    comment: ""
  },
  {
    id: 5,
    title: "Kiểm tra 15 phút - Hóa học",
    subject: "Hóa",
    type: "15 phút",
    date: "2024-01-20",
    time: "15:30",
    duration: 15,
    status: "upcoming",
    totalQuestions: 15,
    maxScore: 10,
    description: "Cấu trúc nguyên tử và bảng tuần hoàn",
    teacher: "Cô Phạm Thị D",
    classroom: "Lớp 10A1",
    isCompleted: false,
    score: null,
    difficulty: "Trung bình",
    courseId: 6,
    comment: ""
  },
  {
    id: 6,
    title: "Kiểm tra 1 tiết - Sinh học",
    subject: "Sinh học",
    type: "1 tiết",
    date: "2024-04-12",
    time: "10:15",
    duration: 45,
    status: "completed",
    totalQuestions: 18,
    maxScore: 10,
    description: "Sinh học tế bào",
    teacher: "Thầy Trần Quốc E",
    classroom: "Lớp 10A5",
    isCompleted: true,
    score: 9,
    difficulty: "Dễ",
    courseId: 5,
    questions: [
      { q: "Câu 1: Tế bào là gì?", correct: true },
      { q: "Câu 2: Nguyên sinh chất gồm?", correct: true },
      { q: "Câu 3: Nhân tế bào chứa?", correct: true },
      { q: "Câu 4: Ty thể là nơi?", correct: true },
      { q: "Câu 5: Lục lạp có chức năng?", correct: true },
      { q: "Câu 6: Màng sinh chất có?", correct: true },
      { q: "Câu 7: Ribosome sản xuất?", correct: true },
      { q: "Câu 8: Tế bào động vật khác thực vật?", correct: false },
      { q: "Câu 9: Lysosome có vai trò?", correct: true },
      { q: "Câu 10: Hạt nhân điều khiển?", correct: true },
      { q: "Câu 11: Màng nhân có?", correct: true },
      { q: "Câu 12: Nguyên sinh chất là?", correct: true },
      { q: "Câu 13: Golgi có chức năng?", correct: true },
      { q: "Câu 14: Trung thể là gì?", correct: true },
      { q: "Câu 15: Tế bào nhân sơ có?", correct: false },
      { q: "Câu 16: Cấu trúc màng tế bào?", correct: true },
      { q: "Câu 17: Tế bào thực vật có thành?", correct: true },
      { q: "Câu 18: Chức năng nhân tế bào?", correct: true }
    ],
    comment: ""
  }
];
