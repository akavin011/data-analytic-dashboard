import React, { useState } from "react";
import axios from "axios";
import { Send, Upload } from "lucide-react";

const ChatUI = () => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);

  const handleSendMessage = async () => {
    if (!question.trim()) return;

    const newMessages = [...messages, { text: question, sender: "user" }];
    setMessages(newMessages);

    try {
      const response = await axios.post("http://localhost:8001/ai21/ask", {
        question,
      });

      setMessages([...newMessages, { text: response.data.answer, sender: "bot" }]);
      setQuestion("");
    } catch (error) {
      console.error("Error:", error);
      setMessages([...newMessages, { text: "Error getting response", sender: "bot" }]);
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:8002/ai21/upload-dataset", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("File uploaded successfully: " + response.data.filename);
      setFile(null);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file.");
    }
  };

  return (
    <div className="flex flex-col items-center w-full h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-3xl h-full flex flex-col bg-gray-800 rounded-lg shadow-md p-4 overflow-hidden">
        <h1 className="text-2xl font-semibold text-center mb-4">Datamatic Bot</h1>

        {/* Chat Window */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`max-w-[80%] p-3 rounded-xl ${
                msg.sender === "user" ? "bg-blue-500 self-end" : "bg-gray-700 self-start"
              }`}
            >
              {msg.text.split(/(\*\*.*?\*\*)/).map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  // Remove the ** and apply bold styling
                  return <strong key={i}>{part.slice(2, -2)}</strong>;
                }
                return <span key={i}>{part}</span>;
              })}
            </div>
          ))}
        </div>

        {/* Input Box */}
        <div className="flex items-center p-3 border-t border-gray-600">
          <input
            type="text"
            className="flex-1 p-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none"
            placeholder="Ask me anything..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <button onClick={handleSendMessage} className="ml-3 bg-blue-500 p-3 rounded-lg">
            <Send size={20} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default ChatUI;