import { useState } from "react";
import api from "../api";
import { motion, AnimatePresence } from "framer-motion";
import { FiMessageCircle, FiX, FiSend } from "react-icons/fi";

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    {
      sender: "bot",
      text: "Hi 👋 I'm your Voting Assistant. Ask me about elections, candidates, or voting rules."
    }
  ]);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = { sender: "user", text: message };
    setChat((prev) => [...prev, userMessage]);
    setMessage("");
    setIsSending(true);

    try {
      const res = await api.post("ai-chat/", { message });

      const botReply = { sender: "bot", text: res.data.reply };
      setChat((prev) => [...prev, botReply]);
    } catch (error) {
      console.error(error);
      setChat((prev) => [
        ...prev,
        { sender: "bot", text: "Something went wrong. Please try again." }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Icon */}
      <motion.div
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "28px",
          cursor: "pointer",
          boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
          zIndex: 1000
        }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 360 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FiMessageCircle />
        </motion.div>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              bottom: "90px",
              right: "20px",
              width: "100%",
              maxWidth: "400px",
              height: "500px",
              background: "white",
              borderRadius: "20px",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              zIndex: 1000
            }}
          >
            {/* Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                padding: "20px 15px",
                fontWeight: "bold",
                fontSize: "18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span>🤖 Voting Assistant</span>
              <motion.button
                onClick={() => setIsOpen(false)}
                whileHover={{ rotate: 90 }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "white",
                  fontSize: "24px",
                  cursor: "pointer",
                  padding: "0",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <FiX />
              </motion.button>
            </div>

            {/* Messages */}
            <motion.div
              style={{
                flex: 1,
                padding: "15px",
                overflowY: "auto",
                background: "linear-gradient(to bottom, #f9f9f9, #ffffff)",
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              }}
            >
              <AnimatePresence>
                {chat.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      display: "flex",
                      justifyContent: msg.sender === "user" ? "flex-end" : "flex-start"
                    }}
                  >
                    <motion.span
                      whileHover={{ scale: 1.02 }}
                      style={{
                        display: "inline-block",
                        padding: "10px 14px",
                        borderRadius: "18px",
                        background: msg.sender === "user"
                          ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                          : "#e5e5ea",
                        color: msg.sender === "user" ? "white" : "black",
                        maxWidth: "80%",
                        wordWrap: "break-word",
                        fontSize: "14px",
                        boxShadow: msg.sender === "user"
                          ? "0 2px 8px rgba(102, 126, 234, 0.3)"
                          : "0 2px 4px rgba(0, 0, 0, 0.1)"
                      }}
                    >
                      {msg.text}
                    </motion.span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Input */}
            <div
              style={{
                display: "flex",
                padding: "12px",
                borderTop: "1px solid #e0e0e0",
                background: "white",
                gap: "8px"
              }}
            >
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontFamily: "Poppins, sans-serif",
                  outline: "none",
                  transition: "all 0.3s"
                }}
              />
              <motion.button
                onClick={handleSend}
                disabled={isSending}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  color: "white",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: isSending ? "not-allowed" : "pointer",
                  opacity: isSending ? 0.7 : 1,
                  fontSize: "18px"
                }}
              >
                {isSending ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ⚙️
                  </motion.div>
                ) : (
                  <FiSend />
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
