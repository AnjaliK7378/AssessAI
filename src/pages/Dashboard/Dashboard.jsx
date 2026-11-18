
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getTeacherDashboard,
  getTeacherResults,
  getAssessments,
} from "../../api";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [results, setResults] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [dashboardData, resultData, assessmentData] =
        await Promise.all([
          getTeacherDashboard(),
          getTeacherResults(),
          getAssessments(),
        ]);

      setStats(dashboardData);
      setResults(Array.isArray(resultData) ? resultData : []);
      setAssessments(Array.isArray(assessmentData) ? assessmentData : []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dashboard loading error:", err);
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const formatModality = (modality) => {
    const map = {
      mcq: "MCQ",
      omr: "OMR / Image",
      speech: "Speech / Audio",
      sign_language: "Sign Language",
    };

    return map[modality?.toLowerCase()] || modality || "Other";
  };

  const getStatusLabel = (status) => {
    const map = {
      active: "Active",
      draft: "Draft",
      completed: "Completed",
      evaluated: "Evaluated",
      submitted: "Submitted",
      pending: "Pending",
      in_progress: "In Progress",
    };

    return map[status?.toLowerCase()] || status || "Unknown";
  };

  const getStatusClass = (status) =>
    (status || "unknown").toLowerCase().replace(/_/g, "-");

  // Calculate actual response modality distribution
  const modalityConfig = [
    { key: "mcq", label: "MCQ", icon: "📝", color: "#6366f1" },
    { key: "omr", label: "OMR / Image", icon: "🖼️", color: "#14b8a6" },
    { key: "speech", label: "Speech / Audio", icon: "🎤", color: "#f59e0b" },
    {
      key: "sign_language",
      label: "Sign Language",
      icon: "🤟",
      color: "#8b5cf6",
    },
  ];

  const modalityData = modalityConfig.map((item) => {
    const count = results.filter(
      (result) => result.modality?.toLowerCase() === item.key
    ).length;

    const total = results.length;

    return {
      ...item,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });

  const recentAssessments = [...assessments]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  const evaluatedCount = stats?.evaluated_submissions || 0;
  const pendingCount = stats?.pending_submissions || 0;
  const totalSubmissions = stats?.total_submissions || 0;

  const statCards = [
    {
      label: "Total Students",
      value: stats?.total_students ?? 0,
      description: "Learners participated",
      icon: "👨‍🎓",
      color: "blue",
    },
    {
      label: "Assessments",
      value: stats?.total_assessments ?? 0,
      description: "Created by you",
      icon: "📚",
      color: "purple",
    },
    {
      label: "Evaluated Responses",
      value: evaluatedCount,
      description: "Successfully evaluated",
      icon: "🤖",
      color: "green",
    },
    {
      label: "Pending Review",
      value: pendingCount,
      description: "Awaiting evaluation",
      icon: "⏳",
      color: "orange",
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <h2>Preparing your dashboard</h2>
          <p>Fetching your latest assessment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-heading">
          <div className="dashboard-eyebrow">
            <span className="live-dot"></span>
            TEACHER ANALYTICS
          </div>

          <h1>Dashboard Overview</h1>

          <p>
            Track assessments, learner performance and evaluation activity
            in one place.
          </p>

          {lastUpdated && (
            <small className="last-updated">
              Last synced: {lastUpdated.toLocaleTimeString()}
            </small>
          )}
        </div>

        <div className="dashboard-actions">
          <button
            className="refresh-btn"
            onClick={fetchDashboard}
            title="Refresh dashboard"
          >
            ↻ Refresh
          </button>

          <button
            className="primary-btn"
            onClick={() => navigate("/assessments")}
          >
            + Create Assessment
          </button>
        </div>
      </div>

      {error && (
        <div className="dashboard-error">
          <span>⚠️ {error}</span>
          <button onClick={fetchDashboard}>Retry</button>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        {statCards.map((stat) => (
          <div className="stat-card" key={stat.label}>
            <div className="stat-card-top">
              <div className={`stat-icon ${stat.color}`}>
                {stat.icon}
              </div>
              <span className="stat-card-decoration">↗</span>
            </div>

            <h2>{stat.value.toLocaleString()}</h2>
            <h3>{stat.label}</h3>
            <p>{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Performance overview */}
      <section className="dashboard-card performance-card">
        <div className="performance-left">
          <div className="performance-icon">📊</div>
          <div>
            <h2>Student Performance</h2>
            <p>Average score across evaluated submissions</p>
          </div>
        </div>

        <div className="performance-score">
          <strong>{stats?.average_score_percentage ?? 0}%</strong>
          <span>Average score</span>
        </div>

        <div className="performance-progress">
          <div
            className="performance-progress-fill"
            style={{
              width: `${Math.min(
                100,
                Math.max(0, stats?.average_score_percentage || 0)
              )}%`,
            }}
          ></div>
        </div>
      </section>

      {/* Main grid */}
      <div className="dashboard-grid">
        {/* Assessments */}
        <section className="dashboard-card assessments-card">
          <div className="card-header">
            <div>
              <h2>Recent Assessments</h2>
              <p>Your latest created assessments</p>
            </div>

            <button
              className="text-btn"
              onClick={() => navigate("/assessments")}
            >
              View All →
            </button>
          </div>

          {recentAssessments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No assessments yet</h3>
              <p>Create your first assessment to get started.</p>
              <button
                className="primary-btn"
                onClick={() => navigate("/assessments")}
              >
                Create Assessment
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Assessment</th>
                    <th>Subject</th>
                    <th>Mode</th>
                    <th>Questions</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentAssessments.map((assessment) => (
                    <tr key={assessment.id}>
                      <td>
                        <div className="assessment-name">
                          {assessment.title}
                        </div>
                        <small>{assessment.assessment_code}</small>
                      </td>

                      <td>{assessment.subject}</td>

                      <td>
                        <span className="modality-chip">
                          {formatModality(assessment.modality)}
                        </span>
                      </td>

                      <td>{assessment.total_questions ?? 0}</td>

                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            assessment.status
                          )}`}
                        >
                          {getStatusLabel(assessment.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Evaluation status */}
        <section className="dashboard-card evaluation-card">
          <div className="card-header">
            <div>
              <h2>Evaluation Overview</h2>
              <p>Submission processing status</p>
            </div>
            <div className="evaluation-header-icon">🤖</div>
          </div>

          <div className="evaluation-total">
            <strong>{totalSubmissions}</strong>
            <span>Total submissions</span>
          </div>

          <div className="evaluation-bar">
            <div
              className="evaluation-bar-evaluated"
              style={{
                width: `${
                  totalSubmissions > 0
                    ? (evaluatedCount / totalSubmissions) * 100
                    : 0
                }%`,
              }}
            ></div>
          </div>

          <div className="evaluation-legend">
            <div>
              <span className="legend-dot evaluated-dot"></span>
              <span>Evaluated</span>
              <strong>{evaluatedCount}</strong>
            </div>
            <div>
              <span className="legend-dot pending-dot"></span>
              <span>Pending</span>
              <strong>{pendingCount}</strong>
            </div>
          </div>

          <div className="evaluation-note">
            Evaluation status is based on actual submissions in your database.
          </div>
        </section>
      </div>

      {/* Modality overview */}
      <div className="dashboard-grid bottom-grid">
        <section className="dashboard-card modality-card">
          <div className="card-header">
            <div>
              <h2>Response Modalities</h2>
              <p>Distribution of actual submitted assessments</p>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="empty-modality">
              No submissions available yet.
            </div>
          ) : (
            <div className="modality-list">
              {modalityData.map((item) => (
                <div className="modality-item" key={item.key}>
                  <div className="modality-header">
                    <div className="modality-label">
                      <span>{item.icon}</span>
                      {item.label}
                    </div>

                    <strong>
                      {item.count}
                      <small> ({item.percentage}%)</small>
                    </strong>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${item.percentage}%`,
                        background: item.color,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="modality-footer">
            <span>Total submissions</span>
            <strong>{results.length}</strong>
          </div>
        </section>

        {/* Teacher review */}
        <section className="dashboard-card review-card">
          <div className="card-header">
            <div>
              <h2>Pending Attention</h2>
              <p>Submissions requiring further processing</p>
            </div>

            <span className="review-count">{pendingCount}</span>
          </div>

          <div className="review-message">
            <div className="review-icon">🧭</div>
            <div>
              <h3>
                {pendingCount > 0
                  ? `${pendingCount} submissions pending`
                  : "All caught up!"}
              </h3>
              <p>
                {pendingCount > 0
                  ? "These submissions are awaiting evaluation or further review."
                  : "There are no pending submissions in your assessment records."}
              </p>
            </div>
          </div>

          <button
            className="secondary-btn"
            onClick={() => navigate("/evaluation")}
          >
            Open Evaluation Queue →
          </button>
        </section>
      </div>

      {/* Recent activity */}
      <section className="dashboard-card activity-card">
        <div className="card-header">
          <div>
            <h2>Recent Student Activity</h2>
            <p>Latest submissions from your learners</p>
          </div>

          <button
            className="text-btn"
            onClick={() => navigate("/results")}
          >
            View Results →
          </button>
        </div>

        {results.length === 0 ? (
          <div className="empty-state compact">
            <p>No student submissions have been received yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Assessment</th>
                  <th>Mode</th>
                  <th>Score</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {results.slice(0, 5).map((result) => (
                  <tr key={result.submission_id}>
                    <td>
                      <div className="student-table-name">
                        <span className="student-avatar">
                          {result.student_name?.charAt(0)?.toUpperCase() || "S"}
                        </span>
                        <div>
                          <strong>{result.student_name}</strong>
                          <small>{result.class_name}</small>
                        </div>
                      </div>
                    </td>

                    <td>{result.assessment_title}</td>
                    <td>{formatModality(result.modality)}</td>

                    <td>
                      {result.score !== null && result.score !== undefined
                        ? `${result.score} / ${result.total_marks}`
                        : "Awaiting score"}
                    </td>

                    <td>
                      <span
                        className={`status-badge ${getStatusClass(result.status)}`}
                      >
                        {getStatusLabel(result.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="dashboard-footer-note">
        <span>✦</span>
        AssessAI · Intelligent, inclusive, multimodal learner assessment
      </div>
    </div>
  );
}

export default Dashboard;
