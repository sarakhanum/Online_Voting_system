import { useCallback, useEffect, useRef, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight, FiShield } from "react-icons/fi";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import "../styles/ElectionSelect.css";

export default function ElectionSelect() {
  const { t } = useTranslation();

  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const errorToastId = useRef("election-fetch-error");

  const isStaff = localStorage.getItem("is_staff") === "true";
  const skeletonCards = [1, 2, 3, 4];

  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
  };

  // 🔁 Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // 🚀 Fetch elections
  const fetchElections = useCallback(
    async (query = "") => {
      const token = localStorage.getItem("access_token");
      console.log("TOKEN:", token);

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const res = await api.get("elections/", {
          params: { search: query },
        });

        console.log("API RESPONSE:", res.data);

        setElections(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        const message =
          err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to load elections";

        console.error("ERROR:", err.response?.data || err.message);

        setError(message);

        toast.error(message, {
          toastId: errorToastId.current,
        });
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  // 🔄 Call API
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchElections(debouncedSearch);
  }, [debouncedSearch, fetchElections, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="election-page">

      {/* ✅ NAVBAR (contains Welcome now) */}
      <Navbar onSearch={setSearch} showSearch onLogout={handleLogout} />

      <div className="page-wrapper">
        <div className="page-header">
          <div>
            <p className="page-subtitle">
              {t("manageElections") || "Choose an active election to participate in"}
            </p>
            <h1 className="page-title">{t("selectElection")}</h1>
          </div>

          {isStaff && (
            <motion.button
              className="admin-action"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/admin")}
            >
              <FiShield /> {t("adminDashboard")}
            </motion.button>
          )}
        </div>

        <div className="page-body">
          {loading ? (
            <div className="skeleton-grid">
              {skeletonCards.map((key) => (
                <motion.div
                  key={key}
                  className="skeleton-card"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: key * 0.05 }}
                >
                  <div className="skeleton-title" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line short" />
                </motion.div>
              ))}
            </div>
          ) : error ? (
            <div className="error-box">{error}</div>
          ) : elections.length === 0 ? (
            <motion.div
              className="empty-state-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="empty-emoji">✨</span>
              <h3>{t("noActiveElections")}</h3>
              <p>{t("noActiveElections")}</p>
            </motion.div>
          ) : (
            <motion.div
              className="election-grid"
              variants={listVariants}
              initial="hidden"
              animate="visible"
            >
              {elections.map((election) => (
                <motion.div
                  key={election.id}
                  className="election-card"
                  variants={cardVariants}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => navigate(`/vote/${election.id}`)}
                >
                  <div className="card-meta">
                    <h2>{election.title}</h2>
                    <p>{election.description || t("viewCandidates")}</p>
                  </div>

                  <div className="card-link">
                    {t("viewCandidates")} <FiArrowRight />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}