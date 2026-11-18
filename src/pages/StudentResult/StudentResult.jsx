import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./StudentResult.css";

function StudentResult() {
  const navigate = useNavigate();
  const { assessmentId } = useParams();
  const location = useLocation();

  const result = location.state || {};

  const assessment = result.assessment || {
    title: "Assessment",
    subject: "General",
  };

  const totalQuestions = result.totalQuestions || 5;
  const answeredCount = result.answeredCount || 0;

  const score = Math.round(
    (answeredCount / totalQuestions) * 100
  );

  return (
    <div className="result-page">

      <div className="result-card">

        <div className="result-icon">
          ✓
        </div>

        <h1>Assessment Submitted!</h1>

        <p className="result-message">
          Your assessment has been successfully submitted.
        </p>

        <div className="result-assessment">
          <span>{assessment.subject}</span>
          <h2>{assessment.title}</h2>
        </div>

        <div className="result-stats">

          <div className="result-stat">
            <span>Questions</span>
            <strong>{totalQuestions}</strong>
          </div>

          <div className="result-stat">
            <span>Answered</span>
            <strong>{answeredCount}</strong>
          </div>

          <div className="result-stat">
            <span>Completion</span>
            <strong>{score}%</strong>
          </div>

        </div>

        <div className="ai-message">

          <span>🤖</span>

          <div>
            <strong>AI Evaluation</strong>

            <p>
              Your responses have been submitted for AI-based
              evaluation. Detailed results will appear once
              processing is completed.
            </p>
          </div>

        </div>

        <div className="result-actions">

          <button
            className="dashboard-button"
            onClick={() => navigate("/student/dashboard")}
          >
            Back to Dashboard
          </button>

          <button
            className="result-button"
            onClick={() =>
              navigate(`/student/result/${assessmentId}`)
            }
          >
            View Result
          </button>

        </div>

      </div>

    </div>
  );
}

export default StudentResult;