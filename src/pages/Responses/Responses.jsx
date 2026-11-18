import { useState } from "react";
import "./Responses.css";

function Responses() {
  const [selectedResponse, setSelectedResponse] = useState(null);

  const responses = [
    {
      id: "RES001",
      student: "Rahul Patil",
      assessment: "Mathematics - Algebra",
      modality: "OMR",
      input: "answer_sheet.jpg",
      status: "Evaluated",
    },
    {
      id: "RES002",
      student: "Priya Sharma",
      assessment: "Science - Human Body",
      modality: "Speech",
      input: "response_audio.wav",
      status: "Pending",
    },
    {
      id: "RES003",
      student: "Amit Joshi",
      assessment: "English - Grammar",
      modality: "Sign Language",
      input: "response_video.mp4",
      status: "Under Review",
    },
    {
      id: "RES004",
      student: "Neha Kulkarni",
      assessment: "Mathematics - Geometry",
      modality: "OMR",
      input: "geometry_answers.jpg",
      status: "Evaluated",
    },
  ];

  const getInputIcon = (modality) => {
    if (modality === "OMR") return "📷";
    if (modality === "Speech") return "🎤";
    if (modality === "Sign Language") return "🎥";

    return "📄";
  };

  return (
    <div className="page-container">

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Responses</h1>
          <p>View and manage student submissions</p>
        </div>
      </div>


      {/* Response Table */}
      <div className="table-container">

        <table>

          <thead>
            <tr>
              <th>Response ID</th>
              <th>Student</th>
              <th>Assessment</th>
              <th>Modality</th>
              <th>Input</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>


          <tbody>

            {responses.map((response) => (

              <tr key={response.id}>

                <td>{response.id}</td>

                <td>{response.student}</td>

                <td>{response.assessment}</td>

                <td>
                  <span className="modality-badge">
                    {getInputIcon(response.modality)}{" "}
                    {response.modality}
                  </span>
                </td>

                <td>{response.input}</td>

                <td>
                  <span
                    className={`response-status ${response.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {response.status}
                  </span>
                </td>

                <td>
                  <button
                    className="view-button"
                    onClick={() => setSelectedResponse(response)}
                  >
                    View
                  </button>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>


      {/* Response Details */}
      {selectedResponse && (

        <div className="response-details">

          <div className="details-header">

            <div>
              <h2>Response Details</h2>
              <p>{selectedResponse.id}</p>
            </div>

            <button
              className="close-button"
              onClick={() => setSelectedResponse(null)}
            >
              ×
            </button>

          </div>


          <div className="details-grid">

            <div>
              <span>Student</span>
              <strong>{selectedResponse.student}</strong>
            </div>

            <div>
              <span>Assessment</span>
              <strong>{selectedResponse.assessment}</strong>
            </div>

            <div>
              <span>Modality</span>
              <strong>
                {getInputIcon(selectedResponse.modality)}{" "}
                {selectedResponse.modality}
              </strong>
            </div>

            <div>
              <span>Submitted Input</span>
              <strong>{selectedResponse.input}</strong>
            </div>

            <div>
              <span>Status</span>
              <strong>{selectedResponse.status}</strong>
            </div>

          </div>


          {/* Future Model Area */}
          <div className="model-placeholder">

            <h3>AI Evaluation</h3>

            <p>
              AI model output will appear here after model integration.
            </p>

            <div className="model-flow">
              <span>Student Input</span>
              <b>→</b>
              <span>AI Model</span>
              <b>→</b>
              <span>Confidence</span>
              <b>→</b>
              <span>Evaluation</span>
            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Responses;