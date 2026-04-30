import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ToastContainer } from "react-toastify";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ElectionSelect from "./pages/ElectionSelect";
import Vote from "./pages/Vote";
import AdminDashboard from "./pages/AdminDashboard";
import AIChat from "./pages/AIChat";

import "react-toastify/dist/ReactToastify.css";


// 🔐 PROTECTED ROUTE
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


function AppContent() {
  const location = useLocation();

  const showChatbot =
    location.pathname === "/elections" ||
    location.pathname.startsWith("/vote/");

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -10 }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={{ duration: 0.45 }}
          style={{ minHeight: "100vh" }}
        >
          <Routes>

          <Route path="/" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* 🔐 PROTECTED */}
          <Route
            path="/elections"
            element={
              <ProtectedRoute>
                <ElectionSelect />
              </ProtectedRoute>
            }
          />

          <Route
            path="/vote/:electionId"
            element={
              <ProtectedRoute>
                <Vote />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

        </Routes>
      </motion.div>
      </AnimatePresence>

      {showChatbot && <AIChat />}

      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </>
  );
}

export default function App() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    setAppReady(true);
  }, []);

  if (!appReady) {
    return (
      <div className="app-loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}