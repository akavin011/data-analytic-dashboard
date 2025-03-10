import { useState } from "react";
import axios from "axios";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, sender: "user" }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/chat", { message: input });
      setMessages([...newMessages, { text: res.data.reply, sender: "bot" }]);
    } catch (err) {
      setMessages([...newMessages, { text: "Error fetching response!", sender: "bot" }]);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-white text-black">
      <div className="p-4 bg-gray-100 text-center text-lg font-semibold border-b">Data Matic Bot</div>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg w-fit max-w-xs ${msg.sender === "user" ? "bg-blue-500 text-white ml-auto" : "bg-gray-300 text-black"}`}
          >
            {msg.text}
          </div>
        ))}
        {loading && <div className="text-gray-500">Thinking...</div>}
      </div>
      <div className="p-4 flex bg-gray-100 border-t">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 bg-white border border-gray-300 rounded-l-lg focus:outline-none"
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="bg-blue-600 px-4 py-2 text-white rounded-r-lg">
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
