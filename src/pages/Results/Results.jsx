import { useState } from "react";
import "./Results.css";

function Results() {
  const [selectedResult, setSelectedResult] = useState(null);

  const results = [
    {
      id: "RES001",
      student: "Rahul Patil",
      assessment: "Mathematics - Algebra",
      score: "18/20",
      accuracy: "90%",
      method: "CNN",
      status: "Completed",
      confidence: "96%",
      routing: "Direct Evaluation",
      vlm: "No",
    },
    {
      id: "RES002",
      student: "Priya Sharma",
      assessment: "Science - Human Body",
      score: "12/15",
      accuracy: "80%",
      method: "VLM",
      status: "Completed",
      confidence: "72%",
      routing: "VLM Escalation",
      vlm: "Yes",
    },
    {
      id: "RES003",
      student: "Amit Joshi",
      assessment: "English - Grammar",
      score: "Pending",
      accuracy: "—",
      method: "Teacher",
      status: "Under Review",
      confidence: "48%",
      routing: "Teacher Review",
      vlm: "Yes",
    },
    {
      id: "RES004",
      student: "Neha Kulkarni",
      assessment: "Mathematics - Geometry",
      score: "16/18",
      accuracy: "89%",
      method: "CNN",
      status: "Completed",
      confidence: "94%",
      routing: "Direct Evaluation",
      vlm: "No",
    },
  ];

  return (
    <div className="page-container">

      <div className="page-header">
        <div>
          <h1>Results</h1>
          <p>View final assessment results</p>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Response ID</th>
              <th>Student</th>
              <th>Assessment</th>
              <th>Score</th>
              <th>Accuracy</th>
              <th>Evaluation Method</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {results.map((result) => (
              <tr key={result.id}>
                <td>{result.id}</td>
                <td>{result.student}</td>
                <td>{result.assessment}</td>
                <td>{result.score}</td>
                <td>{result.accuracy}</td>
                <td>{result.method}</td>
                <td>{result.status}</td>

                <td>
                  <button
                    className="view-button"
                    onClick={() => setSelectedResult(result)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedResult && (
        <div className="result-details">

          <div className="details-header">
            <div>
              <h2>Result Details</h2>
              <p>
                Detailed evaluation information for{" "}
                {selectedResult.student}
              </p>
            </div>

            <button
              className="close-button"
              onClick={() => setSelectedResult(null)}
            >
              ✕
            </button>
          </div>

          <div className="details-grid">

            <div>
              <span>Response ID</span>
              <strong>{selectedResult.id}</strong>
            </div>

            <div>
              <span>Student</span>
              <strong>{selectedResult.student}</strong>
            </div>

            <div>
              <span>Assessment</span>
              <strong>{selectedResult.assessment}</strong>
            </div>

            <div>
              <span>Score</span>
              <strong>{selectedResult.score}</strong>
            </div>

            <div>
              <span>Accuracy</span>
              <strong>{selectedResult.accuracy}</strong>
            </div>

            <div>
              <span>Confidence</span>
              <strong>{selectedResult.confidence}</strong>
            </div>

            <div>
              <span>Evaluation Method</span>
              <strong>{selectedResult.method}</strong>
            </div>

            <div>
              <span>Routing</span>
              <strong>{selectedResult.routing}</strong>
            </div>

            <div>
              <span>VLM Used</span>
              <strong>{selectedResult.vlm}</strong>
            </div>

            <div>
              <span>Status</span>
              <strong>{selectedResult.status}</strong>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Results;