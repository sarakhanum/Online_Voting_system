import { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUser, FiLock, FiArrowRight } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import "../styles/Auth.css";

export default function Signup() {
  const { t } = useTranslation();
  const [data, setData] = useState({ username: "", password: "" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (data.password !== confirmPassword) {
      setError(t("passwordsMismatch"));
      return;
    }

    setLoading(true);

    try {
      await api.post("register/", data);
      setSuccess(t("createAccount") + " successfully! Redirecting...");
      await new Promise((resolve) => setTimeout(resolve, 1400));
      navigate("/login");
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.error || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
         // ✅ force all text black
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
          {t("createAccount")}
        </motion.h2>

        <form onSubmit={handleSignup}>
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

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "rgba(76, 175, 80, 0.1)",
                border: "1px solid #4caf50",
                borderRadius: "8px",
                color: "#4caf50",
                padding: "12px",
                marginBottom: "15px",
                fontSize: "14px",
              }}
            >
              {success}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            style={{ position: "relative", marginBottom: "12px" }}
          >
            <FiUser
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
              placeholder={t("chooseUsername")}
              value={data.username}
              onChange={(e) => setData({ ...data, username: e.target.value })}
              className="auth-input"
              style={{ paddingLeft: "40px", color: "black" }} // ✅ input text black
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
              placeholder={t("createPassword")}
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              className="auth-input"
              style={{ paddingLeft: "40px", color: "black" }} // ✅ input text black
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
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
              placeholder={t("confirmPasswordPlaceholder")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="auth-input"
              style={{ paddingLeft: "40px", color: "black" }} // ✅ input text black
            />
          </motion.div>

          <motion.button
            type="submit"
            className="auth-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            disabled={loading}
            style={{
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              color: "black" // ✅ button text black
            }}
          >
            {loading ? `${t("createAccount")}...` : (
              <>
                {t("createAccount")} <FiArrowRight />
              </>
            )}
          </motion.button>
        </form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
           // ✅ bottom text black
        >
          {t("alreadyHaveAccount")}{" "}
          <Link to="/login" style={{ textDecoration: "none", color: "black" }}>
            {t("login")}
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}