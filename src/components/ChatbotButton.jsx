// src/components/ChatbotButton.jsx
import React from "react";
import { FaRobot } from "react-icons/fa";

const ChatbotButton = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all cursor-pointer z-50"
    >
      <FaRobot size={24} />
    </div>
  );
};

export default ChatbotButton;
