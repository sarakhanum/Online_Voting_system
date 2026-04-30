import { useEffect, useMemo, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiPlus, FiAlertTriangle, FiLogOut, FiChevronRight } from "react-icons/fi";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import api from "../api";
import "../styles/ElectionSelect.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function AdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [stats, setStats] = useState({ total_votes: 0, elections: [] });
  const [logs, setLogs] = useState([]);
  const [results, setResults] = useState(null);
  const [selectedElectionId, setSelectedElectionId] = useState("");
  const [form, setForm] = useState({ title: "", description: "", status: "active", start_time: "", end_time: "" });
  const [candidateForm, setCandidateForm] = useState({ name: "", party: "", election: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const isStaff = localStorage.getItem("is_staff") === "true";
    if (!token || !isStaff) {
      navigate("/elections");
      return;
    }
    loadAdminData();
  }, [navigate]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [electionsRes, statsRes, logsRes] = await Promise.all([
        api.get("admin/elections/"),
        api.get("admin/total-votes/"),
        api.get("admin/suspicious-activity/"),
      ]);
      setElections(electionsRes.data);
      setStats(statsRes.data);
      setLogs(logsRes.data.logs);
      if (electionsRes.data.length > 0) {
        setSelectedElectionId(electionsRes.data[0].id);
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  const createElection = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        title: form.title,
        description: form.description,
        status: form.status,
        start_time: form.start_time ? new Date(form.start_time).toISOString() : null,
        end_time: form.end_time ? new Date(form.end_time).toISOString() : null,
      };
      await api.post("admin/create-election/", payload);
      toast.success(t("electionCreated"));
      setForm({ title: "", description: "", status: "active", start_time: "", end_time: "" });
      loadAdminData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Unable to create election.");
    }
  };

  const addCandidate = async (event) => {
    event.preventDefault();
    try {
      await api.post("admin/add-candidate/", candidateForm);
      toast.success(t("candidateAdded"));
      setCandidateForm({ name: "", party: "", election: "" });
      loadAdminData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Unable to add candidate.");
    }
  };

  const closeElection = async (electionId) => {
    try {
      await api.post("admin/close-election/", { election_id: electionId });
      toast.success(t("closeElection") + " successful");
      loadAdminData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Unable to close election.");
    }
  };

  const viewResults = async (electionId) => {
    try {
      const res = await api.get(`results/${electionId}/`);
      setResults(res.data);
      setSelectedElectionId(electionId);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Unable to load results.");
    }
  };

  const candidateList = useMemo(() => {
    return stats.elections.map((item) => item.title);
  }, [stats.elections]);

  const chartData = useMemo(() => {
    return {
      labels: stats.elections.map((item) => item.title),
      datasets: [
        {
          label: "Votes",
          data: stats.elections.map((item) => item.vote_count),
          backgroundColor: stats.elections.map((_, index) => `hsla(${index * 45}, 85%, 60%, 0.8)`),
          borderRadius: 14,
        },
      ],
    };
  }, [stats.elections]);

  const resultChartData = useMemo(() => {
    if (!results) return { labels: [], datasets: [] };
    return {
      labels: results.results.map((item) => item.name),
      datasets: [
        {
          label: "Votes",
          data: results.results.map((item) => item.total_votes),
          backgroundColor: results.results.map((_, index) => `hsla(${index * 60}, 84%, 55%, 0.8)`),
          borderRadius: 12,
        },
      ],
    };
  }, [results]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="election-page pb-20">
      <Navbar showSearch={false} pageTitle={t("adminDashboard")} onLogout={handleLogout} />

      <div className="glass-card mx-auto mt-8 max-w-6xl rounded-[28px] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-300">{t("adminDashboard")}</p>
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">{t("suspiciousActivity")}</h2>
          </div>
          <div className="rounded-3xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg shadow-slate-900/30">
            <span>{stats.total_votes} votes tracked</span>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-[24px] border border-slate-200 bg-white/90 p-5 shadow-lg dark:border-slate-700 dark:bg-slate-950/90">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Total Votes</p>
            <p className="mt-4 text-4xl font-semibold text-slate-900 dark:text-white">{stats.total_votes}</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-white/90 p-5 shadow-lg dark:border-slate-700 dark:bg-slate-950/90">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Active Elections</p>
            <p className="mt-4 text-4xl font-semibold text-slate-900 dark:text-white">{elections.length}</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-white/90 p-5 shadow-lg dark:border-slate-700 dark:bg-slate-950/90">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Alerts</p>
            <p className="mt-4 text-4xl font-semibold text-rose-500">{logs.length}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 grid max-w-6xl gap-6 lg:grid-cols-2">
        <motion.section className="glass-card rounded-[28px] border border-white/10 bg-white/80 p-6 shadow-2xl shadow-slate-950/10 dark:bg-slate-950/80">
          <h3 className="mb-5 text-2xl font-semibold text-slate-900 dark:text-white">{t("createElection")}</h3>
          <form className="space-y-4" onSubmit={createElection}>
            <input
              className="auth-input w-full"
              placeholder="Election title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              className="auth-input w-full min-h-[120px] resize-none"
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <select
                className="auth-input w-full"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
              <input
                type="datetime-local"
                className="auth-input w-full"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              />
            </div>
            <input
              type="datetime-local"
              className="auth-input w-full"
              value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
            />
            <button type="submit" className="glow-button rounded-3xl bg-indigo-600 px-5 py-3 text-white shadow-xl shadow-indigo-500/30 transition hover:bg-indigo-700">
              <FiPlus className="inline-block mr-2" /> {t("createElection")}
            </button>
          </form>
        </motion.section>

        <motion.section className="glass-card rounded-[28px] border border-white/10 bg-white/80 p-6 shadow-2xl shadow-slate-950/10 dark:bg-slate-950/80">
          <h3 className="mb-5 text-2xl font-semibold text-slate-900 dark:text-white">{t("addCandidate")}</h3>
          <form className="space-y-4" onSubmit={addCandidate}>
            <input
              className="auth-input w-full"
              placeholder="Candidate name"
              value={candidateForm.name}
              onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
            />
            <input
              className="auth-input w-full"
              placeholder="Party"
              value={candidateForm.party}
              onChange={(e) => setCandidateForm({ ...candidateForm, party: e.target.value })}
            />
            <select
              className="auth-input w-full"
              value={candidateForm.election}
              onChange={(e) => setCandidateForm({ ...candidateForm, election: e.target.value })}
            >
              <option value="">Select election</option>
              {elections.map((election) => (
                <option key={election.id} value={election.id}>{election.title}</option>
              ))}
            </select>
            <button type="submit" className="glow-button rounded-3xl bg-emerald-600 px-5 py-3 text-white shadow-xl shadow-emerald-500/30 transition hover:bg-emerald-700">
              <FiPlus className="inline-block mr-2" /> {t("addCandidate")}
            </button>
          </form>
        </motion.section>
      </div>

      <div className="mx-auto mt-8 max-w-6xl space-y-6">
        <motion.section className="glass-card rounded-[28px] border border-white/10 bg-white/80 p-6 shadow-2xl shadow-slate-950/10 dark:bg-slate-950/80">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Election metrics</h3>
              <p className="text-slate-500 dark:text-slate-400">A live overview of voting activity and suspicious behavior.</p>
            </div>
            <button
              onClick={() => viewResults(selectedElectionId)}
              disabled={!selectedElectionId}
              className="glow-button inline-flex items-center gap-2 rounded-3xl bg-slate-900 px-5 py-3 text-white shadow-xl shadow-slate-900/25 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiChevronRight /> View results
            </button>
          </div>
          <div className="mt-6">
            <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: true, position: 'top' } } }} />
          </div>
        </motion.section>

        <motion.section className="glass-card rounded-[28px] border border-white/10 bg-white/80 p-6 shadow-2xl shadow-slate-950/10 dark:bg-slate-950/80">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-4 text-2xl font-semibold text-slate-900 dark:text-white">Suspicious logs</h3>
              <div className="space-y-3">
                {logs.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400">No suspicious activity yet.</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/80">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-slate-900 dark:text-white">{log.user}</p>
                        <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                      <p className="mt-2 text-slate-600 dark:text-slate-300">{log.reason}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <h3 className="mb-4 text-2xl font-semibold text-slate-900 dark:text-white">Live results</h3>
              {results ? (
                <div>
                  <h4 className="mb-3 text-lg font-semibold text-slate-700 dark:text-slate-200">{results.election.title}</h4>
                  <Pie data={resultChartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400">{t("noResults")}</p>
              )}
            </div>
          </div>
        </motion.section>
      </div>

      <div className="mx-auto mt-8 max-w-6xl">
        <h3 className="mb-4 text-2xl font-semibold text-slate-900 dark:text-white">Election list</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {elections.map((election) => (
            <div key={election.id} className="rounded-[24px] border border-slate-200 bg-white/90 p-5 shadow-lg dark:border-slate-700 dark:bg-slate-950/85">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{election.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{election.status}</p>
                </div>
                <button
                  onClick={() => closeElection(election.id)}
                  className="rounded-3xl bg-rose-600 px-4 py-2 text-sm text-white shadow-lg shadow-rose-500/20 transition hover:bg-rose-700"
                >
                  Close
                </button>
              </div>
              <p className="mt-3 text-slate-600 dark:text-slate-300">{election.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
