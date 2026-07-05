import axios from "axios";

const GEMINI_API_KEY = "AIzaSyDzIXISIp7aAK4yBYfeecWkvrtBJSqaIr4";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

export const generateExplanation = async (question, options, correctAnswer, questionType) => {
  try {
    const optionsText = options
      .filter(opt => opt.text)
      .map(opt => `${opt.id}. ${opt.text}`)
      .join("\n");

    const prompt = `Bạn là một giáo viên giỏi. Hãy viết giải thích ngắn gọn (2-3 câu) cho câu hỏi sau để học sinh hiểu rõ:

Câu hỏi: ${question}
Loại câu hỏi: ${questionType === 'single' ? 'Trắc nghiệm 1 đáp án' : questionType === 'multiple' ? 'Trắc nghiệm nhiều đáp án' : 'Đúng/Sai'}
Các đáp án:
${optionsText}
Đáp án đúng: ${correctAnswer}

Giải thích (chỉ viết phần giải thích, không cần nhắc lại câu hỏi):`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }
    );

    const explanation =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return explanation.trim();
  } catch (error) {
    console.error("Error generating explanation:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
    });
    
    // If 404, it's likely invalid API key
    if (error.response?.status === 404) {
      throw new Error("API Key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại API Key.");
    }
    
    throw new Error("Không thể sinh giải thích. Vui lòng thử lại.");
  }
};
