import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { FiMoon, FiSun, FiBell, FiLogOut, FiSearch } from "react-icons/fi";
import { toast } from "react-toastify";
import "../styles/Navbar.css";

export default function Navbar({ onSearch, showSearch = false, onLogout }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [theme, setTheme] = useState("light");

  const username = localStorage.getItem("username") || "User";

  // ✅ Load theme
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setTheme(saved);

    if (saved === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  // 🌙 Toggle theme
  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);

    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // 🌐 Language
  const changeLang = (lang) => {
    i18n.changeLanguage(lang);
    toast.success("Language changed");
  };

  // 🔔 Notification
  const notify = () => {
    toast.info("New election started");
  };

  // 🔐 Logout
  const logout = () => {
    localStorage.clear();
    navigate("/login");
    if (onLogout) onLogout();
  };

  return (
    <motion.nav
      className="app-navbar"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="navbar-left">
        <h2 className="navbar-welcome">
          {t("welcome")}, {username}
        </h2>
      </div>

      {showSearch && (
        <div className="navbar-search">
          <FiSearch />
          <input
            placeholder={t("searchElections")}
            onChange={(e) => onSearch(e.target.value)}
            aria-label={t("searchElections")}
          />
        </div>
      )}

      <div className="navbar-actions">
        <motion.button
          className="icon-btn"
          onClick={notify}
          whileTap={{ scale: 0.95 }}
          aria-label={t("notifications")}
        >
          <FiBell />
        </motion.button>

        <motion.button
          className="theme-btn"
          onClick={toggleTheme}
          whileTap={{ scale: 0.95 }}
          aria-label={t("toggleTheme")}
        >
          {theme === "dark" ? <FiMoon /> : <FiSun />}
        </motion.button>

        <select
          onChange={(e) => changeLang(e.target.value)}
          className="lang-select"
          defaultValue={i18n.language || "en"}
          aria-label={t("language")}
        >
          <option value="en">EN</option>
          <option value="hi">हिं</option>
          <option value="kn">ಕ</option>
        </select>

        <motion.button
          className="logout-btn"
          onClick={logout}
          whileTap={{ scale: 0.98 }}
          aria-label={t("logout")}
        >
          <FiLogOut /> {t("logout")}
        </motion.button>
      </div>
    </motion.nav>
  );
}
