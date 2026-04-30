import { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import "../styles/Auth.css";

export default function Login() {
  const { t } = useTranslation();
  const [data, setData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("login/", data);

      localStorage.setItem("user_id", res.data.user_id);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);
      localStorage.setItem("is_staff", res.data.is_staff ? "true" : "false");

      await new Promise((resolve) => setTimeout(resolve, 300));
      navigate("/elections");
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: [0, -5, 0] }}
        transition={{ opacity: { duration: 0.5 }, y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 } }}
        whileHover={{ y: -4, scale: 1.02 }}
      >
        <motion.h1
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          
        >
          🗳️
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          
        >
          {t("welcomeBack")}
        </motion.h2>

        <form onSubmit={handleLogin}>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "rgba(244, 67, 54, 0.1)",
                border: "1px solid #f44336",
                borderRadius: "8px",
                color: "#f44336",
                padding: "12px",
                marginBottom: "15px",
                fontSize: "14px",
              }}
            >
              {error}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            style={{ position: "relative", marginBottom: "12px" }}
          >
            <FiMail
              style={{
                position: "absolute",
                left: "12px",
                top: "14px",
                color: "#667eea",
                fontSize: "18px",
              }}
            />
            <input
              type="text"
              placeholder={t("username")}
              value={data.username}
              onChange={(e) => setData({ ...data, username: e.target.value })}
              className="auth-input"
              style={{ paddingLeft: "40px" }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            style={{ position: "relative", marginBottom: "20px" }}
          >
            <FiLock
              style={{
                position: "absolute",
                left: "12px",
                top: "14px",
                color: "#667eea",
                fontSize: "18px",
              }}
            />
            <input
              type="password"
              placeholder={t("password")}
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              className="auth-input"
              style={{ paddingLeft: "40px" }}
            />
          </motion.div>

          <motion.button
            type="submit"
            className="auth-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            disabled={loading}
            style={{
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            {loading ? `${t("login")}...` : (
              <>
                {t("login")} <FiArrowRight />
              </>
            )}
          </motion.button>
        </form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          
        >
          {t("dontHaveAccount")}{" "}
          <Link to="/" style={{ textDecoration: "none" }}>
            {t("signup")}
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}