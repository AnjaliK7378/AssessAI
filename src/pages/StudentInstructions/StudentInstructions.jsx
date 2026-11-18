import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAssessment } from "../../api";
import "./StudentInstructions.css";

function StudentInstructions() {
  const navigate = useNavigate();
  const { assessmentId } = useParams();

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
  const fetchAssessment = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch assessment with authentication token
      const data = await getAssessment(assessmentId);

      if (data.status !== "active") {
        throw new Error("This assessment is not published yet.");
      }

      setAssessment(data);
    } catch (err) {
      console.error("Instruction page error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchAssessment();
}, [assessmentId]);

  const getModality = (modality) => {
    const modalities = {
      omr: "OMR / Image",
      speech: "Speech",
      sign_language: "Sign Language",
      mcq: "MCQ",
    };

    return modalities[modality] || modality;
  };

  if (loading) {
    return (
      <div className="instruction-page">
        <div className="instruction-card">
          <h2>Loading Assessment...</h2>
          <p>Please wait while we fetch the assessment details.</p>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="instruction-page">
        <div className="instruction-card">
          <h2>Assessment Not Available</h2>
          <p>{error || "Assessment could not be found."}</p>

          <button
            className="back-button"
            onClick={() => navigate("/student/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="instruction-page">
      <div className="instruction-card">

        <div className="instruction-header">
          <span className="subject-badge">
            {assessment.subject}
          </span>

          <h1>{assessment.title}</h1>

          <p>
            Assessment ID: {assessment.assessment_code}
          </p>

          <p>
            Please read the instructions carefully before starting.
          </p>
        </div>

        <div className="instruction-details">
          <div>
            <span>Questions</span>
            <strong>{assessment.total_questions}</strong>
          </div>

          <div>
            <span>Subject</span>
            <strong>{assessment.subject}</strong>
          </div>

          <div>
            <span>Response Mode</span>
            <strong>{getModality(assessment.modality)}</strong>
          </div>
        </div>

        <div className="instructions-section">
          <h2>Instructions</h2>

          <ul>
            <li>Read each question carefully.</li>
            <li>Answer all questions to the best of your ability.</li>
            <li>Use the response method specified for this assessment.</li>
            <li>Make sure your internet connection is stable.</li>
            <li>Review your answers before submitting.</li>
            <li>Once submitted, your responses cannot be modified.</li>
          </ul>
        </div>

        <div className="modality-box">
          <h3>Response Method</h3>

          <p>This assessment uses:</p>

          <strong>{getModality(assessment.modality)}</strong>
        </div>

        <div className="instruction-actions">
          <button
            className="back-button"
            onClick={() => navigate("/student/dashboard")}
          >
            ← Back
          </button>

          <button
            className="start-button"
            onClick={() =>
              navigate(`/student/test/${assessment.id}`)
            }
          >
            I Understand, Start Test →
          </button>
        </div>

      </div>
    </div>
  );
}

export default StudentInstructions;
