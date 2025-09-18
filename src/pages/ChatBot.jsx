import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! 🌸 I’m your AI StreakBuddy. How are you feeling today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token"); // JWT token
      const res = await fetch("http://localhost:5000/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      if (data.success) {
        const cleanReply = data.reply.replace(/\*/g, "");
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: cleanReply },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "⚠️ Oops, I couldn’t get a response right now.",
          },
        ]);
      }
    } catch (err) {
      console.error("Frontend Chatbot error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Something went wrong. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => e.key === "Enter" && sendMessage();
  useEffect(
    () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
    [messages]
  );
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {open && (
        <div className="w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2">
            <span className="font-medium">❤️‍🔥 Hey, I’m your StreakBuddy!</span>
            <button onClick={() => setOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 min-h-0 p-3 overflow-y-auto flex flex-col gap-3 bg-gradient-to-br from-blue-100 via-purple-100 to-green-100">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`max-w-[75%] p-2 break-words whitespace-pre-wrap text-sm rounded-2xl shadow-md ${
                    msg.role === "user"
                      ? "self-end bg-gradient-to-tr from-purple-400 to-purple-500 text-white"
                      : "self-start bg-gradient-to-tr from-blue-200 to-green-200 text-gray-800"
                  }`}
                >
                  {msg.content}
                </motion.div>
              ))}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="self-start flex items-center gap-2 text-gray-500"
                >
                  <span>StreakBuddy is typing</span>
                  <span className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300"></span>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-2 flex gap-2 border-t border-gray-200 bg-white">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 rounded-full p-2 bg-white border border-gray-300 outline-none placeholder-gray-500 focus:ring-2 focus:ring-purple-300 transition shadow-sm text-sm"
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 rounded-full bg-gray-900 text-white font-medium shadow-md hover:bg-gray-800 transition text-sm"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      {!open && (
        <div className="relative group">
          <button
            onClick={() => setOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg flex items-center gap-2"
          >
            <MessageCircle size={24} />
          </button>
          <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
            Hey, your StreakBuddy is here 💜
          </span>
        </div>
      )}

      <style>
        {`
          @keyframes bounce {0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); }}
          .animate-bounce { animation: bounce 0.6s infinite; }
          .delay-150 { animation-delay: 0.15s; }
          .delay-300 { animation-delay: 0.3s; }
        `}
      </style>
    </div>
  );
}

export default Chatbot;
