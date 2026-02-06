import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import config from "../config";
import "../index.css";

export default function LandingPage() {
  const { currentUser, loginWithGoogle, logout } = useAuth();
  const [subjectPrefix, setSubjectPrefix] = useState("");
  const [courseNumber, setCourseNumber] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [crn, setCrn] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [errorMessage, setErrorMessage] = useState("");

  const [requests, setRequests] = useState([]);
  const [editId, setEditId] = useState(null);

  React.useEffect(() => {
    if (currentUser) {
      fetchRequests();
    } else {
      setRequests([]);
    }
  }, [currentUser]);

  const fetchRequests = async () => {
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`${config.apiUrl}/api/alerts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (err) {
      console.error("Failed to fetch requests", err);
    }
  };

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Failed to login", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    setStatus(null);
    setErrorMessage("");

    // Combine for backend
    // const subject = `${subjectPrefix} ${courseNumber}`;

    try {
      const token = await currentUser.getIdToken();

      let url = `${config.apiUrl}/api/alerts`;
      let method = "POST";

      if (editId) {
        url = `${config.apiUrl}/api/alerts/${editId}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: subjectPrefix,
          course_number: courseNumber,
          crn: crn,
          whatsappNumber: whatsapp,
        }),
      });

      if (response.ok) {
        setStatus("success");
        resetForm();
        fetchRequests(); // Refresh list
      } else {
        const data = await response.json();
        setErrorMessage(data.error || "Failed to register alert.");
        setStatus("error");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Network error. Please try again.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (req) => {
    setSubjectPrefix(req.subject);
    setCourseNumber(req.course_number);
    setCrn(req.crn);
    setWhatsapp(req.whatsappNumber);
    setEditId(req._id);
    setStatus(null);
    setErrorMessage("");
  };

  const resetForm = () => {
    setSubjectPrefix("");
    setCourseNumber("");
    setCrn("");
    setWhatsapp("");
    setEditId(null);
    // Don't clear status immediately so user sees success message
    setTimeout(() => setStatus(null), 3000);
  };

  const toggleStop = async (req) => {
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`${config.apiUrl}/api/alerts/${req._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stopped: !req.stopped }),
      });

      if (response.ok) {
        fetchRequests();
      }
    } catch (err) {
      console.error("Failed to toggle stop", err);
    }
  };

  return (
    <div className="landing-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          {/* Logo Placeholder */}
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
              MISR UNIVERSITY
              <br />
              <span style={{ fontSize: "0.8rem", fontWeight: "normal" }}>
                FOR SCIENCE & TECHNOLOGY
              </span>
            </div>
          </Link>
        </div>
        <div>
          {currentUser && (
            <button
              onClick={logout}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "1px solid white",
                color: "white",
                padding: "5px 15px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* Hero Content */}
      <div className="hero-section">
        <div className="glass-card">
          <header
            className="header"
            style={{ textAlign: "left", marginTop: "4rem" }}
          >
            <h1
              className="title"
              style={{ fontSize: "4rem", marginBottom: "1rem" }}
            >
              Capacity Finder
            </h1>
            <p
              style={{
                marginBottom: "3rem",
                color: "#4B5563",
                lineHeight: "1.6",
                fontSize: "1.2rem",
              }}
            >
              Welcome to the Alert System. Register your subject below and we
              will notify you instantly when a seat becomes available.
            </p>

            <div
              className="about-us"
              style={{
                marginTop: "3rem",
                borderTop: "1px solid #e5e7eb",
                paddingTop: "1.5rem",
              }}
            >
              <p
                style={{
                  color: "#6B7280",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span style={{ fontSize: "1.2rem" }}></span>
                We hope you find this tool useful! <br />
                Engineered by Engineering Students at Misr University.
              </p>
            </div>
          </header>

          {!currentUser ? (
            <div className="auth-container" style={{ textAlign: "left" }}>
              <button
                onClick={handleLogin}
                className="submit-btn"
                style={{
                  background: "white",
                  color: "#333",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  width: "auto",
                  padding: "10px 20px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  border: "1px solid #ccc",
                }}
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  width="18"
                  alt="Google"
                />
                Sign in to Register
              </button>
            </div>
          ) : (
            <div style={{ width: "100%" }}>
              <form
                onSubmit={handleSubmit}
                className="alert-form"
                style={{ marginBottom: "2rem" }}
              >
                <h3 style={{ marginBottom: "1rem", color: "#4B5563" }}>
                  {editId ? "Update Alert" : "New Alert"}
                </h3>
                <div className="input-group">
                  <label>Subject Code</label>
                  <div style={{ display: "flex", gap: "5px" }}>
                    <input
                      type="text"
                      placeholder="Subject e.g. CSE3"
                      value={subjectPrefix}
                      onChange={(e) =>
                        setSubjectPrefix(
                          e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9]/g, ""),
                        )
                      }
                      required
                      style={{ flex: 1, minWidth: "170px" }}
                    />
                    <input
                      type="text"
                      placeholder="Course No. e.g. 03"
                      value={courseNumber}
                      onChange={(e) =>
                        setCourseNumber(e.target.value.replace(/[^0-9]/g, ""))
                      }
                      required
                      style={{ flex: 1, minWidth: "170px" }}
                    />
                    <input
                      type="text"
                      placeholder="CRN e.g. 12345"
                      value={crn}
                      onChange={(e) =>
                        setCrn(e.target.value.replace(/[^0-9]/g, ""))
                      }
                      required
                      style={{ flex: 1, minWidth: "170px" }}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="whatsapp">WhatsApp Number</label>
                  <input
                    type="tel"
                    id="whatsapp"
                    placeholder="+201xxx xxx xxxx"
                    value={whatsapp}
                    onChange={(e) =>
                      setWhatsapp(e.target.value.replace(/[^0-9+]/g, ""))
                    }
                    required
                  />
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={loading}
                  >
                    {loading
                      ? "Processing..."
                      : editId
                        ? "Update Request"
                        : "Notify Me"}
                  </button>
                  {editId && (
                    <button
                      type="button"
                      className="submit-btn"
                      style={{ background: "#6B7280" }}
                      onClick={resetForm}
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {status === "success" && (
                  <div className="status-msg success">
                    {editId
                      ? "✅ Update successful!"
                      : "✅ You're on the list! We'll text you when a spot opens."}
                  </div>
                )}
                {status === "error" && (
                  <div className="status-msg error">
                    ❌{" "}
                    {errorMessage || "Something went wrong. Please try again."}
                  </div>
                )}
              </form>

              {/* Requests List */}
              {requests.length > 0 && (
                <div
                  style={{
                    marginTop: "2rem",
                    borderTop: "1px solid #e5e7eb",
                    paddingTop: "1rem",
                  }}
                >
                  <h3 style={{ marginBottom: "1rem", color: "#4B5563" }}>
                    Your Active Alerts
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    {requests.map((req) => (
                      <div
                        key={req._id}
                        style={{
                          background: req.stopped ? "#f3f4f6" : "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          padding: "1rem",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          opacity: req.stopped ? 0.7 : 1,
                        }}
                      >
                        <div>
                          <div
                            style={{ fontWeight: "bold", fontSize: "1.1rem" }}
                          >
                            {req.subject} {req.course_number}{" "}
                            <span
                              style={{ fontSize: "0.9rem", color: "#6B7280" }}
                            >
                              (CRN: {req.crn})
                            </span>
                          </div>
                          <div style={{ fontSize: "0.9rem", color: "#6B7280" }}>
                            {req.whatsappNumber}
                          </div>
                          {req.stopped && (
                            <div
                              style={{
                                color: "#EF4444",
                                fontSize: "0.8rem",
                                fontWeight: "bold",
                              }}
                            >
                              ⚠ STOPPED
                            </div>
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "5px",
                          }}
                        >
                          <button
                            onClick={() => handleEdit(req)}
                            style={{
                              background: "#3B82F6",
                              color: "white",
                              border: "none",
                              padding: "5px 10px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "0.9rem",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toggleStop(req)}
                            style={{
                              background: req.stopped ? "#10B981" : "#EF4444",
                              color: "white",
                              border: "none",
                              padding: "5px 10px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "0.9rem",
                            }}
                          >
                            {req.stopped ? "Resume" : "Stop"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
