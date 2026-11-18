import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";

function StudentDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch real dashboard data from backend
  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      const response = await fetch(
        "http://127.0.0.1:8000/student/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "Unable to load student dashboard."
        );
      }

      const data = await response.json();

      setDashboard(data);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Convert modality into student-friendly text
  const formatModality = (modality) => {
    const modalityMap = {
      omr: "OMR / Image",
      speech: "Speech",
      sign_language: "Sign Language",
      mcq: "MCQ",
    };

    return modalityMap[modality?.toLowerCase()] || modality;
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "--";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Calculate score percentage
  const getScorePercentage = (score, totalMarks) => {
    if (score == null || !totalMarks) return "--";

    return `${Math.round((score / totalMarks) * 100)}%`;
  };

  // Loading screen
  if (loading) {
    return (
      <div className="student-dashboard">
        <div className="student-content">
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="student-dashboard">
        <div className="student-content">
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchDashboard}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  const availableAssessments = dashboard?.available_assessments || [];
  const inProgressAssessments = dashboard?.in_progress_assessments || [];
  const recentResults = dashboard?.recent_results || [];

  return (
    <div className="student-dashboard">
      {/* Header */}
      <header className="student-topbar">
        <div>
          <h1>AssessAI</h1>
          <p>Learner Assessment System</p>
        </div>

        <div className="student-profile">
          <div className="student-avatar">
            {(dashboard?.student_name || user.full_name || "S")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <strong>{dashboard?.student_name || user.full_name || "Student"}</strong>
            <span>{dashboard?.class_name || user.class_name || "Class not assigned"}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="student-content">

        {/* Welcome */}
        <section className="student-welcome">
          <h2>
            Welcome, {(dashboard?.student_name || user.full_name || "Student")
              .split(" ")[0]}! 👋
          </h2>

          <p>Track your progress and complete your assigned assessments.</p>
        </section>

        {/* Summary Cards */}
        <section className="student-summary">

          <div className="summary-card">
            <span>Available Tests</span>
            <strong>{dashboard?.available_tests ?? 0}</strong>
          </div>

          <div className="summary-card">
            <span>Completed Tests</span>
            <strong>{dashboard?.completed_tests ?? 0}</strong>
          </div>

          <div className="summary-card">
            <span>In Progress</span>
            <strong>{dashboard?.in_progress_tests ?? 0}</strong>
          </div>

          <div className="summary-card">
            <span>Average Score</span>
            <strong>{dashboard?.average_score ?? 0}%</strong>
          </div>

        </section>

        {/* In Progress Assessments */}
        <section className="student-assessments">
          <div className="section-heading">
            <div>
              <h2>Continue Assessment</h2>
              <p>Resume assessments that you have already started.</p>
            </div>
          </div>

          {inProgressAssessments.length > 0 ? (
            <div className="student-assessment-grid">
              {inProgressAssessments.map((assessment) => (
                <div
                  className="student-assessment-card"
                  key={assessment.assessment_id}
                >
                  <div className="assessment-card-header">
                    <span className="subject-badge">{assessment.subject}</span>
                    <span className="available-badge">In Progress</span>
                  </div>

                  <h3>{assessment.title}</h3>

                  <p className="assessment-id">
                    Attempt ID: {assessment.attempt_id}
                  </p>

                  <div className="assessment-details">
                    <div>
                      <span>Status</span>
                      <strong>In Progress</strong>
                    </div>

                    <div>
                      <span>Deadline</span>
                      <strong>
                        {assessment.expires_at
                          ? new Date(assessment.expires_at).toLocaleTimeString(
                              "en-IN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "--"}
                      </strong>
                    </div>
                  </div>

                  <button
                    className="start-assessment-button"
                    onClick={() =>
                      navigate(
                        `/student/instructions/${assessment.assessment_id}`
                      )
                    }
                  >
                    Resume Assessment →
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-assessments">
              <p>You have no assessments in progress.</p>
            </div>
          )}
        </section>

        {/* Available Assessments */}
        <section className="student-assessments">
          <div className="section-heading">
            <div>
              <h2>Available Assessments</h2>
              <p>Select a test to begin.</p>
            </div>
          </div>

          {availableAssessments.length > 0 ? (
            <div className="student-assessment-grid">
              {availableAssessments.map((assessment) => (
                <div
                  className="student-assessment-card"
                  key={assessment.assessment_id}
                >
                  <div className="assessment-card-header">
                    <span className="subject-badge">{assessment.subject}</span>
                    <span className="available-badge">Available</span>
                  </div>

                  <h3>{assessment.title}</h3>

                  <p className="assessment-id">
                    Assessment ID: {assessment.assessment_id}
                  </p>

                  <div className="assessment-details">
                    <div>
                      <span>Questions</span>
                      <strong>{assessment.total_questions}</strong>
                    </div>

                    <div>
                      <span>Mode</span>
                      <strong>{formatModality(assessment.modality)}</strong>
                    </div>

                    <div>
                      <span>Class</span>
                      <strong>{dashboard?.class_name}</strong>
                    </div>
                  </div>

                  <button
                    className="start-assessment-button"
                    onClick={() =>
                      navigate(
                        `/student/instructions/${assessment.assessment_id}`
                      )
                    }
                  >
                    Start Assessment →
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-assessments">
              <h3>No New Assessments</h3>
              <p>
                You have no new assessments available at the moment.
              </p>
            </div>
          )}
        </section>

        {/* Recent Results */}
        <section className="student-assessments">
          <div className="section-heading">
            <div>
              <h2>Recent Results</h2>
              <p>Your recently submitted assessments.</p>
            </div>
          </div>

          {recentResults.length > 0 ? (
            <div className="student-assessment-grid">
              {recentResults.map((result, index) => (
                <div
                  className="student-assessment-card"
                  key={`${result.assessment_id}-${index}`}
                >
                  <div className="assessment-card-header">
                    <span className="subject-badge">{result.subject}</span>
                    <span className="available-badge">{result.status}</span>
                  </div>

                  <h3>{result.title}</h3>

                  <div className="assessment-details">
                    <div>
                      <span>Score</span>
                      <strong>
                        {result.score != null
                          ? `${result.score} / ${result.total_marks}`
                          : "Pending"}
                      </strong>
                    </div>

                    <div>
                      <span>Percentage</span>
                      <strong>
                        {getScorePercentage(result.score, result.total_marks)}
                      </strong>
                    </div>

                    <div>
                      <span>Submitted</span>
                      <strong>{formatDate(result.submitted_at)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-assessments">
              <p>You haven't submitted any assessments yet.</p>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default StudentDashboard;