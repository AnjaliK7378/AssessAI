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

  return (
    <div className="page-container">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1>AI Evaluation</h1>
          <p>Monitor AI-based response evaluation</p>
        </div>
      </div>


      {/* Evaluation Table */}
      <div className="table-container">

        <table>

          <thead>
            <tr>
              <th>Evaluation ID</th>
              <th>Student</th>
              <th>Modality</th>
              <th>Prediction</th>
              <th>Confidence</th>
              <th>Routing</th>
              <th>VLM Used</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {evaluations.map((evaluation) => (

              <tr key={evaluation.id}>

                <td>{evaluation.id}</td>

                <td>{evaluation.student}</td>

                <td>{evaluation.modality}</td>

                <td>{evaluation.prediction}</td>

                <td>
                  <span
                    className={`confidence ${
                      parseInt(evaluation.confidence) >= 80
                        ? "high"
                        : "low"
                    }`}
                  >
                    {evaluation.confidence}
                  </span>
                </td>

                <td>{evaluation.routing}</td>

                <td>{evaluation.vlm}</td>

                <td>
                  <span
                    className={`evaluation-status ${
                      evaluation.status.toLowerCase()
                    }`}
                  >
                    {evaluation.status}
                  </span>
                </td>

                <td>
                  <button
                    className="view-button"
                    onClick={() =>
                      setSelectedEvaluation(evaluation)
                    }
                  >
                    View
                  </button>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>


      {/* Evaluation Details */}
      {selectedEvaluation && (

        <div className="evaluation-details">

          <div className="details-header">

            <div>
              <h2>Evaluation Details</h2>
              <p>{selectedEvaluation.id}</p>
            </div>

            <button
              className="close-button"
              onClick={() => setSelectedEvaluation(null)}
            >
              ×
            </button>

          </div>


          {/* Basic Information */}
          <div className="evaluation-info">

            <div>
              <span>Student</span>
              <strong>{selectedEvaluation.student}</strong>
            </div>

            <div>
              <span>Modality</span>
              <strong>{selectedEvaluation.modality}</strong>
            </div>

            <div>
              <span>Prediction</span>
              <strong>{selectedEvaluation.prediction}</strong>
            </div>

            <div>
              <span>Confidence</span>
              <strong>{selectedEvaluation.confidence}</strong>
            </div>

          </div>


          {/* AI Pipeline */}
          <div className="pipeline-section">

            <h3>AI Evaluation Pipeline</h3>

            <div className="pipeline">

              <div className="pipeline-step">
                <span className="step-number">1</span>
                <strong>Student Input</strong>
                <small>
                  {selectedEvaluation.modality} response
                </small>
              </div>

              <div className="pipeline-arrow">→</div>

              <div className="pipeline-step">
                <span className="step-number">2</span>
                <strong>CNN Model</strong>
                <small>
                  Initial prediction
                </small>
              </div>

              <div className="pipeline-arrow">→</div>

              <div className="pipeline-step">
                <span className="step-number">3</span>
                <strong>Confidence</strong>
                <small>
                  {selectedEvaluation.confidence}
                </small>
              </div>

              <div className="pipeline-arrow">→</div>

              <div className="pipeline-step">
                <span className="step-number">4</span>
                <strong>Router</strong>
                <small>
                  {selectedEvaluation.routing}
                </small>
              </div>

            </div>


            {/* VLM */}
            <div className="vlm-section">

              <h4>VLM Reasoning Layer</h4>

              {selectedEvaluation.vlm === "Yes" ? (

                <p>
                  This response was escalated for additional
                  semantic evaluation.
                </p>

              ) : (

                <p>
                  High-confidence prediction accepted without
                  VLM escalation.
                </p>

              )}

            </div>


            {/* Final Status */}
            <div className="final-evaluation">

              <span>Final Evaluation Status</span>

              <strong>
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