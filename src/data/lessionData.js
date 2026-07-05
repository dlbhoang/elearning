const lessonsData = {
  // --- Toán ---
  l1: {
    id: "l1",
    title: "Bài 1: Đường thẳng & Góc",
    videoUrl: "https://www.youtube.com/embed/5qap5aO4i9A",
    exercises: [
      {
        type: "multiple",
        question: "Tổng các góc trong tam giác bằng bao nhiêu độ?",
        options: ["90°", "120°", "180°", "360°"],
        answer: 2, // 180°
      },
      {
        type: "boolean",
        question: "Hai đường thẳng song song thì có điểm chung.",
        answer: false,
      },
    ],
  },
  l2: {
    id: "l2",
    title: "Bài 2: Tam giác",
    videoUrl: "https://www.youtube.com/embed/jNQXAC9IVRw",
    exercises: [
      { type: "fill", question: "Tam giác có mấy cạnh?", answer: "3" },
    ],
  },
  l3: {
    id: "l3",
    title: "Bài 3: Quan hệ cạnh và góc trong tam giác",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    exercises: [
      {
        type: "multiple",
        question: "Trong tam giác, cạnh đối diện góc lớn nhất là?",
        options: ["Cạnh lớn nhất", "Cạnh nhỏ nhất", "Cạnh bằng nhau"],
        answer: 0,
      },
    ],
  },
  l4: {
    id: "l4",
    title: "Bài 4: Đường trung tuyến, phân giác và cao",
    videoUrl: "https://www.youtube.com/embed/tgbNymZ7vqY",
    exercises: [
      {
        type: "boolean",
        question: "Đường cao trong tam giác luôn đi qua trung điểm cạnh đối diện.",
        answer: false,
      },
    ],
  },
  l5: {
    id: "l5",
    title: "Bài 5: Hình bình hành",
    videoUrl: "https://www.youtube.com/embed/aqz-KE-bpKQ",
    exercises: [
      {
        type: "multiple",
        question: "Hình bình hành có mấy cạnh?",
        options: ["2", "3", "4", "5"],
        answer: 2, // "4"
      },
    ],
  },
  l6: {
    id: "l6",
    title: "Bài 6: Hình thang",
    videoUrl: "https://www.youtube.com/embed/3GwjfUFyY6M",
    exercises: [
      {
        type: "boolean",
        question: "Hình thang có hai cạnh đáy song song.",
        answer: true,
      },
    ],
  },
  l7: {
    id: "l7",
    title: "Bài 7: Hình chữ nhật, hình vuông",
    videoUrl: "https://www.youtube.com/embed/kXYiU_JCYtU",
    exercises: [
      {
        type: "multiple",
        question: "Hình vuông có mấy đường chéo bằng nhau?",
        options: ["0", "1", "2"],
        answer: 2, // 2 đường chéo bằng nhau
      },
    ],
  },
  l8: {
    id: "l8",
    title: "Bài 8: Hình thoi và đa giác đều",
    videoUrl: "https://www.youtube.com/embed/2Vv-BfVoq4g",
    exercises: [
      {
        type: "fill",
        question: "Đa giác đều có tất cả các cạnh và ... bằng nhau?",
        answer: "góc",
      },
    ],
  },
  l9: {
    id: "l9",
    title: "Bài 9: Các yếu tố của đường tròn",
    videoUrl: "https://www.youtube.com/embed/oHg5SJYRHA0",
    exercises: [
      {
        type: "multiple",
        question: "Bán kính là đoạn thẳng nối tâm với ...?",
        options: ["Cung tròn", "Chu vi", "Một điểm trên đường tròn"],
        answer: 2,
      },
    ],
  },
  l10: {
    id: "l10",
    title: "Bài 10: Góc và cung trong đường tròn",
    videoUrl: "https://www.youtube.com/embed/aqz-KE-bpKQ",
    exercises: [
      {
        type: "boolean",
        question: "Góc nội tiếp bằng nửa số đo cung chắn.",
        answer: true,
      },
    ],
  },

  // --- Văn ---
  l11: {
    id: "l11",
    title: "Bài 1: Tác giả Nam Cao",
    videoUrl: "https://www.youtube.com/embed/2Vv-BfVoq4g",
    exercises: [
      {
        type: "fill",
        question: "Nam Cao là tác giả của tác phẩm nào?",
        answer: "Chí Phèo",
      },
    ],
  },
  l12: {
    id: "l12",
    title: "Bài 2: Truyện ngắn hiện đại",
    videoUrl: "https://www.youtube.com/embed/kXYiU_JCYtU",
    exercises: [
      {
        type: "multiple",
        question: "Truyện ngắn hiện đại thường có đặc điểm nào?",
        options: ["Dài dòng", "Ngắn gọn", "Kịch tính thấp"],
        answer: 1, // "Ngắn gọn"
      },
    ],
  },
};

export default lessonsData;
