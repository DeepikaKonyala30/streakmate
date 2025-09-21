import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, X, Bot } from "lucide-react";

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! 🌸 I’m your AI StreakBuddy. How are you feeling today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      if (data.success) {
        const cleanReply = data.reply.replace(/\*/g, "");
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: cleanReply, timestamp: new Date() },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "⚠️ Oops, I couldn’t get a response right now.",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Something went wrong. Please try again later.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <span className="font-medium">❤️‍🔥 StreakBuddy</span>
              </div>
              <button onClick={() => setOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 min-h-0 p-3 overflow-y-auto flex flex-col gap-3 bg-gradient-to-br from-blue-100 via-purple-100 to-green-100">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-[75%] p-3 break-words whitespace-pre-wrap text-sm rounded-2xl shadow-md ${
                    msg.role === "user"
                      ? "self-end bg-gradient-to-tr from-purple-400 to-purple-500 text-white"
                      : "self-start bg-gray-100 text-gray-800"
                  }`}
                >
                  {msg.content}
                </motion.div>
              ))}

              {/* Loading dots */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="self-start bg-gray-100 px-3 py-2 rounded-2xl flex gap-1"
                >
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300"></span>
                </motion.div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-2 flex gap-2 border-t border-gray-200 bg-white">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={1}
                className="flex-1 resize-none rounded-full px-3 py-2 bg-white border border-gray-300 outline-none placeholder-gray-500 focus:ring-2 focus:ring-purple-300 transition shadow-sm text-sm"
                disabled={loading}
              />
              <motion.button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      {!open && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative group"
        >
          <button
            onClick={() => setOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg flex items-center gap-2"
          >
            <MessageCircle size={24} />
          </button>
          <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
            Hey, your StreakBuddy is here 🤗
          </span>
        </motion.div>
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
