
import { useState } from "react";
import "./Evaluation.css";

function Evaluation() {
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);

  const evaluations = [
    {
      id: "EVAL001",
      student: "Rahul Patil",
      modality: "OMR",
      prediction: "Option A",
      confidence: "96%",
      routing: "Direct Evaluation",
      vlm: "No",
      status: "Completed",
    },
    {
      id: "EVAL002",
      student: "Priya Sharma",
      modality: "Speech",
      prediction: "Partially Correct",
      confidence: "72%",
      routing: "VLM Escalation",
      vlm: "Yes",
      status: "Completed",
    },
    {
      id: "EVAL003",
      student: "Amit Joshi",
      modality: "Sign Language",
      prediction: "Uncertain",
      confidence: "48%",
      routing: "Teacher Review",
      vlm: "Yes",
      status: "Pending",
    },
    {
      id: "EVAL004",
      student: "Neha Kulkarni",
      modality: "OMR",
      prediction: "Option C",
      confidence: "94%",
      routing: "Direct Evaluation",
      vlm: "No",
      status: "Completed",
    },
  ];

  const totalEvaluations = evaluations.length;
  const directCount = evaluations.filter(
    (e) => e.routing === "Direct Evaluation"
  ).length;
  const vlmCount = evaluations.filter(
    (e) => e.routing === "VLM Escalation"
  ).length;
  const teacherCount = evaluations.filter(
    (e) => e.routing === "Teacher Review"
  ).length;

  const getConfidence = (confidence) => parseInt(confidence);

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 80) return "High Confidence";
    if (confidence >= 60) return "Moderate Confidence";
    return "Low Confidence";
  };

  const getRouteClass = (routing) => {
    if (routing === "Direct Evaluation") return "direct";
    if (routing === "VLM Escalation") return "vlm";
    return "teacher";
  };

  const getModalityIcon = (modality) => {
    if (modality === "OMR") return "📄";
    if (modality === "Speech") return "🎤";
    if (modality === "Sign Language") return "🤟";
    return "📝";
  };

  const getRouteIcon = (routing) => {
    if (routing === "Direct Evaluation") return "⚡";
    if (routing === "VLM Escalation") return "🧠";
    return "👨‍🏫";
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return "#16a34a";
    if (confidence >= 60) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="evaluation-page">
      {/* HEADER */}
      <div className="evaluation-header">
        <div>
          <div className="evaluation-heading-tag">
            <span className="heading-dot"></span>
            AI INTELLIGENCE CENTER
          </div>
          <h1>AI Evaluation</h1>
          <p>
            Monitor predictions, confidence levels and AI decision pathways.
          </p>
        </div>

        <div className="header-ai-badge">
          <span className="ai-badge-icon">✦</span>
          <div>
            <strong>AssessAI Engine</strong>
            <span>Evaluation Monitoring</span>
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="evaluation-stats">
        <div className="eval-stat-card stat-blue">
          <div className="eval-stat-top">
            <div className="eval-stat-icon">🧠</div>
            <span className="stat-label">OVERVIEW</span>
          </div>
          <h2>{totalEvaluations}</h2>
          <p>Total Evaluations</p>
          <div className="stat-bottom">
            <span className="stat-indicator blue-indicator"></span>
            Responses analyzed
          </div>
        </div>

        <div className="eval-stat-card stat-green">
          <div className="eval-stat-top">
            <div className="eval-stat-icon">⚡</div>
            <span className="stat-label">FAST TRACK</span>
          </div>
          <h2>{directCount}</h2>
          <p>Direct Evaluations</p>
          <div className="stat-bottom">
            <span className="stat-indicator green-indicator"></span>
            High-confidence route
          </div>
        </div>

        <div className="eval-stat-card stat-orange">
          <div className="eval-stat-top">
            <div className="eval-stat-icon">🧠</div>
            <span className="stat-label">AI VERIFICATION</span>
          </div>
          <h2>{vlmCount}</h2>
          <p>VLM Escalations</p>
          <div className="stat-bottom">
            <span className="stat-indicator orange-indicator"></span>
            Semantic verification
          </div>
        </div>

        <div className="eval-stat-card stat-purple">
          <div className="eval-stat-top">
            <div className="eval-stat-icon">👨‍🏫</div>
            <span className="stat-label">HUMAN IN LOOP</span>
          </div>
          <h2>{teacherCount}</h2>
          <p>Teacher Reviews</p>
          <div className="stat-bottom">
            <span className="stat-indicator purple-indicator"></span>
            Manual verification
          </div>
        </div>
      </div>

      {/* AI WORKFLOW */}
      <section className="ai-workflow-section">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">SYSTEM ARCHITECTURE</span>
            <h2>How AI Evaluation Works</h2>
            <p>From student submission to the final evaluation decision.</p>
          </div>
          <span className="workflow-live-badge">
            <span></span> Workflow
          </span>
        </div>

        <div className="workflow-container">
          <div className="workflow-step input-step">
            <div className="workflow-icon">📥</div>
            <span className="workflow-number">STEP 01</span>
            <h3>Student Input</h3>
            <p>Image, audio or sign language response</p>
          </div>

          <div className="workflow-connector">
            <span>→</span>
          </div>

          <div className="workflow-step model-step">
            <div className="workflow-icon">🤖</div>
            <span className="workflow-number">STEP 02</span>
            <h3>AI Model</h3>
            <p>Analyzes the submitted response</p>
          </div>

          <div className="workflow-connector">
            <span>→</span>
          </div>

          <div className="workflow-step confidence-step">
            <div className="workflow-icon">📊</div>
            <span className="workflow-number">STEP 03</span>
            <h3>Confidence</h3>
            <p>Measures prediction reliability</p>
          </div>

          <div className="workflow-connector">
            <span>→</span>
          </div>

          <div className="workflow-step router-step">
            <div className="workflow-icon">🔀</div>
            <span className="workflow-number">STEP 04</span>
            <h3>Confidence Router</h3>
            <p>Chooses the evaluation pathway</p>
          </div>
        </div>

        <div className="workflow-outcomes">
          <div className="outcome-card outcome-direct">
            <div className="outcome-icon">⚡</div>
            <div>
              <h4>Direct Evaluation</h4>
              <p>High confidence → prediction accepted</p>
            </div>
            <span className="outcome-arrow">→</span>
          </div>

          <div className="outcome-card outcome-vlm">
            <div className="outcome-icon">🧠</div>
            <div>
              <h4>VLM Escalation</h4>
              <p>Additional semantic reasoning</p>
            </div>
            <span className="outcome-arrow">→</span>
          </div>

          <div className="outcome-card outcome-teacher">
            <div className="outcome-icon">👨‍🏫</div>
            <div>
              <h4>Teacher Review</h4>
              <p>Human verification when uncertain</p>
            </div>
            <span className="outcome-arrow">→</span>
          </div>
        </div>
      </section>

      {/* EVALUATION RECORDS */}
      <section className="evaluation-records-section">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">MODEL OUTPUTS</span>
            <h2>Evaluation Records</h2>
            <p>Explore individual AI predictions and decision routes.</p>
          </div>

          <div className="records-count">
            {evaluations.length} Records
          </div>
        </div>

        <div className="evaluation-cards-grid">
          {evaluations.map((evaluation) => {
            const confidence = getConfidence(evaluation.confidence);
            const routeClass = getRouteClass(evaluation.routing);
            const confidenceColor = getConfidenceColor(confidence);

            return (
              <div className="evaluation-card" key={evaluation.id}>
                <div className="evaluation-card-header">
                  <div className={`modality-icon ${evaluation.modality.toLowerCase().replace(" ", "-")}`}>
                    {getModalityIcon(evaluation.modality)}
                  </div>

                  <div className="evaluation-card-heading">
                    <span className="evaluation-id">{evaluation.id}</span>
                    <h3>{evaluation.student}</h3>
                  </div>

                  <span className={`evaluation-status-badge ${evaluation.status.toLowerCase()}`}>
                    {evaluation.status}
                  </span>
                </div>

                <div className="evaluation-modality-row">
                  <span className="modality-label">INPUT TYPE</span>
                  <span className="modality-value">
                    {getModalityIcon(evaluation.modality)} {evaluation.modality}
                  </span>
                </div>

                <div className="prediction-box">
                  <span className="prediction-label">AI PREDICTION</span>
                  <h2>{evaluation.prediction}</h2>
                </div>

                {/* CONFIDENCE METER */}
                <div className="confidence-section">
                  <div className="confidence-top">
                    <div>
                      <span className="confidence-title">Model Confidence</span>
                      <small>{getConfidenceLabel(confidence)}</small>
                    </div>
                    <strong style={{ color: confidenceColor }}>
                      {evaluation.confidence}
                    </strong>
                  </div>

                  <div className="confidence-track">
                    <div
                      className="confidence-fill"
                      style={{
                        width: `${confidence}%`,
                        background: confidenceColor,
                      }}
                    ></div>
                  </div>

                  <div className="confidence-scale">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* ROUTING */}
                <div className={`routing-box ${routeClass}`}>
                  <div className="routing-icon">
                    {getRouteIcon(evaluation.routing)}
                  </div>
                  <div className="routing-text">
                    <span>DECISION ROUTE</span>
                    <strong>{evaluation.routing}</strong>
                  </div>
                </div>

                <div className="evaluation-card-footer">
                  <div className="vlm-indicator">
                    <span className={`vlm-dot ${evaluation.vlm === "Yes" ? "vlm-active" : "vlm-inactive"}`}></span>
                    VLM {evaluation.vlm === "Yes" ? "Used" : "Not Used"}
                  </div>

                  <button
                    className="evaluation-view-button"
                    onClick={() => setSelectedEvaluation(evaluation)}
                  >
                    View Details <span>↗</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* DETAIL PANEL */}
      {selectedEvaluation && (
        <div className="evaluation-detail-overlay" onClick={() => setSelectedEvaluation(null)}>
          <div
            className="evaluation-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="detail-modal-header">
              <div>
                <span className="section-eyebrow">EVALUATION INSIGHTS</span>
                <h2>Evaluation Details</h2>
                <p>{selectedEvaluation.id} · {selectedEvaluation.student}</p>
              </div>

              <button
                className="detail-close-button"
                onClick={() => setSelectedEvaluation(null)}
              >
                ×
              </button>
            </div>

            {/* DETAIL SUMMARY */}
            <div className="detail-summary-grid">
              <div className="detail-summary-item">
                <span>Student</span>
                <strong>{selectedEvaluation.student}</strong>
              </div>
              <div className="detail-summary-item">
                <span>Response Type</span>
                <strong>{getModalityIcon(selectedEvaluation.modality)} {selectedEvaluation.modality}</strong>
              </div>
              <div className="detail-summary-item">
                <span>Prediction</span>
                <strong>{selectedEvaluation.prediction}</strong>
              </div>
              <div className="detail-summary-item">
                <span>Confidence Score</span>
                <strong>{selectedEvaluation.confidence}</strong>
              </div>
            </div>

            {/* JOURNEY */}
            <div className="detail-journey">
              <h3>Evaluation Journey</h3>
              <p>How this response moved through the AI system</p>

              <div className="journey-list">
                <div className="journey-item completed-step">
                  <div className="journey-marker">✓</div>
                  <div className="journey-content">
                    <strong>Student Response Received</strong>
                    <span>{selectedEvaluation.modality} input received by system</span>
                  </div>
                </div>

                <div className="journey-item completed-step">
                  <div className="journey-marker">✓</div>
                  <div className="journey-content">
                    <strong>AI Model Prediction</strong>
                    <span>Prediction generated: {selectedEvaluation.prediction}</span>
                  </div>
                </div>

                <div className="journey-item completed-step">
                  <div className="journey-marker">✓</div>
                  <div className="journey-content">
                    <strong>Confidence Analysis</strong>
                    <span>Model confidence: {selectedEvaluation.confidence}</span>
                  </div>
                </div>

                <div className="journey-item active-step">
                  <div className="journey-marker">4</div>
                  <div className="journey-content">
                    <strong>Routing Decision</strong>
                    <span>{selectedEvaluation.routing}</span>
                  </div>
                </div>

                <div className={`journey-item ${selectedEvaluation.status === "Completed" ? "completed-step" : "pending-step"}`}>
                  <div className="journey-marker">
                    {selectedEvaluation.status === "Completed" ? "✓" : "5"}
                  </div>
                  <div className="journey-content">
                    <strong>Final Evaluation</strong>
                    <span>
                      {selectedEvaluation.status === "Completed"
                        ? "Evaluation process completed"
                        : "Awaiting additional review"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* DECISION EXPLANATION */}
            <div className={`detail-decision-box ${getRouteClass(selectedEvaluation.routing)}`}>
              <div className="decision-icon">
                {getRouteIcon(selectedEvaluation.routing)}
              </div>
              <div>
                <h4>{selectedEvaluation.routing}</h4>
                <p>
                  {selectedEvaluation.routing === "Direct Evaluation"
                    ? "The model produced a high-confidence prediction. The result was accepted directly without additional verification."
                    : selectedEvaluation.routing === "VLM Escalation"
                    ? "The response was forwarded for additional semantic analysis to improve evaluation reliability."
                    : "The model was uncertain about the response. Human verification is required before finalizing the result."}
                </p>
              </div>
            </div>

            {/* FINAL STATUS */}
            <div className="detail-final-status">
              <span>FINAL STATUS</span>
              <strong className={selectedEvaluation.status.toLowerCase()}>
                {selectedEvaluation.status === "Completed" ? "✓ " : "◷ "}
                {selectedEvaluation.status}
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Evaluation;
