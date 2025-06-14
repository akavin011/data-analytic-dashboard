import React, { useState } from "react";
import axios from "axios";
import { Send } from "lucide-react";

const formatMessage = (text) => {
  const lines = text.split('\n').filter(line => line.trim());
  
  return lines.map((line, index) => {
    // Remove any remaining double asterisks
    const cleanLine = line.replace(/\*\*/g, '');
    
    // Handle main headings (###)
    if (cleanLine.startsWith('###')) {
      return (
        <h1 key={index}>
          {cleanLine.replace(/###/g, '').trim()}
        </h1>
      );
    }
    
    // Handle numbered sections
    if (/^\d+\./.test(cleanLine)) {
      const [number, ...rest] = cleanLine.split(' ');
      return (
        <div key={index} className="section-number">
          <span>{number}</span>
          <span className="category">{rest.join(' ')}</span>
        </div>
      );
    }
    
    // Handle bullet points with descriptions
    if (cleanLine.trim().startsWith('-')) {
      const content = cleanLine.substring(1).trim();
      if (content.includes(':')) {
        const [category, description] = content.split(':').map(s => s.trim());
        return (
          <div key={index} className="bullet-point">
            <span className="category">{category}</span>
            <span className="description">{description}</span>
          </div>
        );
      }
      return (
        <div key={index} className="bullet-point">
          {content}
        </div>
      );
    }
    
    // Regular text
    return (
      <p key={index}>{cleanLine}</p>
    );
  });
};

const ChatUI = () => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!question.trim()) return;

    const newMessages = [...messages, { text: question, sender: "user" }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:8001/ollama/ask", {
        question,
      });

      setMessages([...newMessages, { text: response.data.answer, sender: "bot" }]);
      setQuestion("");
    } catch (error) {
      console.error("Error:", error);
      setMessages([...newMessages, { 
        text: "Error: Could not get response from Ollama. Please ensure the Ollama server is running.", 
        sender: "bot" 
      }]);
    } finally {
      setIsLoading(false);
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
      const response = await axios.post("http://localhost:8001/ollama/upload-dataset", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("File uploaded successfully: " + response.data.filename);
      setFile(null);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file. Please ensure the Ollama server is running.");
    }
  };

  return (
    <div className="flex flex-col items-center w-full h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-3xl h-full flex flex-col bg-gray-800 rounded-lg shadow-md p-4 overflow-hidden">
        <h1 className="text-2xl font-semibold text-center mb-4">Datamatic Bot (Llama 3.2)</h1>

        {/* File Upload Section */}
        <div className="mb-4 p-4 bg-gray-700 rounded-lg">
          <input
            type="file"
            onChange={handleFileChange}
            className="mb-2 text-sm text-gray-300"
            accept=".csv,.xlsx,.xls,.json"
          />
          <button
            onClick={handleUpload}
            className="w-full bg-green-600 p-2 rounded-lg hover:bg-green-700 transition-colors"
            disabled={!file}
          >
            Upload Dataset
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`max-w-[95%] p-4 rounded-xl ${
                msg.sender === "user"
                  ? "bg-blue-500 ml-auto"
                  : "bg-gray-700"
              }`}
            >
              <div className="chat-message">
                {msg.sender === "bot" ? formatMessage(msg.text) : msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="max-w-[95%] p-4 rounded-xl bg-gray-700">
              <div className="chat-message">
                <p>Thinking...</p>
              </div>
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="flex items-center p-3 border-t border-gray-600">
          <input
            type="text"
            className="flex-1 p-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none"
            placeholder="Ask me anything..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            disabled={isLoading}
          />
          <button 
            onClick={handleSendMessage} 
            className={`ml-3 p-3 rounded-lg transition-colors ${
              isLoading 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
            disabled={isLoading}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatUI;