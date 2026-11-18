
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAssessments } from "../../api";
import "./StudentDashboard.css";

function StudentDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch assessments from FastAPI
  const fetchAssessments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAssessments();

      setAssessments(data);
    } catch (err) {
      console.error("Error fetching assessments:", err);
      setError(err.message || "Unable to load assessments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  // Convert backend modality into student-friendly text
  const formatModality = (modality) => {
    const modalityMap = {
      omr: "OMR / Image",
      speech: "Speech",
      sign_language: "Sign Language",
      mcq: "MCQ",
    };

    return modalityMap[modality?.toLowerCase()] || modality;
  };

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
            {user.full_name?.charAt(0).toUpperCase() || "S"}
          </div>

          <div>
            <strong>{user.full_name || "Student"}</strong>
            <span>{user.class_name || "Class not assigned"}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="student-content">

        {/* Welcome */}
        <section className="student-welcome">
          <h2>Welcome, {user.full_name?.split(" ")[0] || "Student"}! 👋</h2>
          <p>
            Complete your assigned assessments below.
          </p>
        </section>

        {/* Summary */}
        <section className="student-summary">

          <div className="summary-card">
            <span>Available Tests</span>
            <strong>{assessments.length}</strong>
          </div>

          <div className="summary-card">
            <span>Completed Tests</span>
            <strong>0</strong>
          </div>

          <div className="summary-card">
            <span>Average Score</span>
            <strong>--</strong>
          </div>

        </section>

        {/* Available Assessments */}
        <section className="student-assessments">

          <div className="section-heading">
            <div>
              <h2>Available Assessments</h2>
              <p>Select a test to begin.</p>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <p>Loading available assessments...</p>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="error-message">
              <p>{error}</p>

              <button onClick={fetchAssessments}>
                Retry
              </button>
            </div>
          )}

          {/* Assessment Cards */}
          {!loading && !error && assessments.length > 0 && (
            <div className="student-assessment-grid">

              {assessments.map((assessment) => (

                <div
                  className="student-assessment-card"
                  key={assessment.id}
                >

                  <div className="assessment-card-header">

                    <span className="subject-badge">
                      {assessment.subject}
                    </span>

                    <span className="available-badge">
                      Available
                    </span>

                  </div>

                  <h3>{assessment.title}</h3>

                  <p className="assessment-id">
                    ID: {assessment.assessment_code}
                  </p>

                  <div className="assessment-details">

                    <div>
                      <span>Questions</span>
                      <strong>{assessment.total_questions}</strong>
                    </div>

                    <div>
                      <span>Class</span>
                      <strong>{assessment.class_name}</strong>
                    </div>

                    <div>
                      <span>Mode</span>
                      <strong>
                        {formatModality(assessment.modality)}
                      </strong>
                    </div>

                  </div>

                  <button
                    className="start-assessment-button"
                    onClick={() =>
                      navigate(
                        `/student/instructions/${assessment.id}`
                      )
                    }
                  >
                    Start Assessment →
                  </button>

                </div>

              ))}

            </div>
          )}

          {/* No Assessments */}
          {!loading && !error && assessments.length === 0 && (
            <div className="no-assessments">
              <h3>No Assessments Available</h3>

              <p>
                Your teacher has not published any assessments yet.
                Please check again later.
              </p>
            </div>
          )}

        </section>

      </main>

    </div>
  );
}

export default StudentDashboard;
