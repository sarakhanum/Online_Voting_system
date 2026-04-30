import { useEffect, useMemo, useState } from "react";
import api from "../api";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiSearch } from "react-icons/fi";
import confetti from "canvas-confetti";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import "../styles/Vote.css";

export default function Vote() {
  const { t } = useTranslation();

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  const [filter, setFilter] = useState("");

  const navigate = useNavigate();
  const { electionId } = useParams();
  const username = localStorage.getItem("username");

  // 🔐 Auth check + load data
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        console.log("TOKEN:", token);

        const [candidateRes, statusRes] = await Promise.all([
          api.get(`candidates/${electionId}/`),
          api.get(`vote-status/${electionId}/`),
        ]);

        console.log("Candidates:", candidateRes.data);
        console.log("Status:", statusRes.data);

        setCandidates(candidateRes.data);

        if (statusRes.data.already_voted) {
          setAlreadyVoted(true);
          setMessage(`You already voted for ${statusRes.data.candidate}`);
        }
      } catch (err) {
        console.error("LOAD ERROR:", err.response?.data || err.message);
        toast.error(err.response?.data?.error || "Unable to load voting data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [electionId, navigate]);

  // 🔍 Filter
  const filteredCandidates = useMemo(() => {
    if (!filter) return candidates;
    return candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(filter.toLowerCase()) ||
        c.party.toLowerCase().includes(filter.toLowerCase())
    );
  }, [candidates, filter]);

  // 🎉 Confetti
  const triggerConfetti = () => {
    const duration = 2000;
    const end = Date.now() + duration;

    const interval = setInterval(() => {
      if (Date.now() > end) return clearInterval(interval);

      confetti({
        particleCount: 30,
        spread: 360,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
      });
    }, 200);
  };

  // 🗳️ Vote handler (FIXED)
  const handleVote = async (id) => {
    // ⚠️ Allow click but warn
    if (alreadyVoted) {
      toast.warn(t("duplicateVoteWarning"));
    }

    setSelectedCandidate(id);
    setIsVoting(true);

    try {
      console.log("Voting for:", id);

      const res = await api.post("vote/", { candidate: id });

      console.log("Vote response:", res.data);

      setMessage(res.data.message || t("voteSubmitted"));
      setAlreadyVoted(true);
      triggerConfetti();

      toast.success(t("voteSubmitted"));
    } catch (error) {
      console.error("Vote error:", error.response?.data || error.message);

      const response = error.response?.data;

      if (response?.blocked) {
        toast.error(response.error || "Account blocked");

        // optional: force logout
        localStorage.clear();
        navigate("/login");
      } else if (response?.already_voted) {
        toast.warn(response.error || t("duplicateVoteWarning"));
        setAlreadyVoted(true);
      } else {
        toast.error(response?.error || "Voting failed");
        setMessage(response?.error || "Voting failed");
      }
    } finally {
      setIsVoting(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // 🎬 Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="vote-container">
      <Navbar showSearch={false} onLogout={handleLogout} />

      <div className="vote-page-shell">
        {/* HEADER */}
        <div className="vote-header">
          <div>
            <p className="vote-subtitle">
              {t("welcome")}, {username}
            </p>
            <h1 className="vote-title">{t("voteNow")}</h1>
          </div>

          <div className="vote-search-wrap">
            <FiSearch className="search-icon" />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="search-input"
              placeholder={t("filterCandidates")}
            />
          </div>
        </div>

        {/* MESSAGE */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={alreadyVoted ? "success-message" : "error-message"}
            >
              {alreadyVoted && <FiCheck style={{ marginRight: 8 }} />}
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CONTENT */}
        {loading ? (
          <p className="loading-text">{t("loadCandidates")}</p>
        ) : filteredCandidates.length === 0 ? (
          <p className="loading-text">{t("noCandidates")}</p>
        ) : (
          <motion.div
            className="candidate-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredCandidates.map((candidate) => (
              <motion.div
                key={candidate.id}
                className={`candidate-card ${
                  selectedCandidate === candidate.id ? "selected" : ""
                }`}
                variants={itemVariants}
                whileHover={{ y: -6 }}
              >
                <div className="candidate-avatar">
                  {candidate.name.charAt(0).toUpperCase()}
                </div>

                <h2 className="candidate-name">{candidate.name}</h2>
                <p className="party-label">Party</p>
                <p className="party-name">{candidate.party}</p>

                <button
                  className="vote-btn"
                  onClick={() => handleVote(candidate.id)}
                  disabled={false} // ✅ allow multiple clicks for testing
                >
                  {isVoting && selectedCandidate === candidate.id
                    ? "Submitting..."
                    : alreadyVoted
                    ? t("alreadyVoted")
                    : t("voteNow")}
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}