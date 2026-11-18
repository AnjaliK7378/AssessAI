
import { useState, useEffect, useCallback, useMemo } from "react";
import { getTeacherResults } from "../../api";
import "./Responses.css";

function Responses() {
  const [responses, setResponses] = useState([]);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [search, setSearch] = useState("");
  const [filterModality, setFilterModality] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResponses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getTeacherResults();
      setResponses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Responses loading error:", err);
      setError(err.message || "Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResponses();
  }, [fetchResponses]);

  // Format modality names
  const formatModality = (modality) => {
    const map = {
      mcq: "MCQ",
      omr: "OMR / Image",
      speech: "Speech / Audio",
      sign_language: "Sign Language",
    };

    return map[modality?.toLowerCase()] || modality || "Other";
  };

  // Modality icons
  const getInputIcon = (modality) => {
    const map = {
      mcq: "📝",
      omr: "🖼️",
      speech: "🎤",
      sign_language: "🤟",
    };

    return map[modality?.toLowerCase()] || "📄";
  };

  // Status formatting
  const getStatusLabel = (status) => {
    const map = {
      evaluated: "Evaluated",
      submitted: "Submitted",
      pending: "Pending",
      in_progress: "In Progress",
      under_review: "Under Review",
    };

    return map[status?.toLowerCase()] || status || "Unknown";
  };

  const getStatusClass = (status) => {
    return (status || "unknown")
      .toLowerCase()
      .replace(/_/g, "-");
  };

  // Search and filter
  const filteredResponses = useMemo(() => {
    return responses.filter((response) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        (response.student_name || "")
          .toLowerCase()
          .includes(searchText) ||
        (response.assessment_title || "")
          .toLowerCase()
          .includes(searchText) ||
        String(response.submission_id || "")
          .includes(searchText) ||
        (response.class_name || "")
          .toLowerCase()
          .includes(searchText);

      const matchesModality =
        filterModality === "all" ||
        response.modality?.toLowerCase() === filterModality;

      const matchesStatus =
        filterStatus === "all" ||
        response.status?.toLowerCase() === filterStatus;

      return matchesSearch && matchesModality && matchesStatus;
    });
  }, [responses, search, filterModality, filterStatus]);

  // Statistics
  const totalResponses = responses.length;

  const evaluatedCount = responses.filter(
    (r) => r.status?.toLowerCase() === "evaluated"
  ).length;

  const pendingCount = responses.filter(
    (r) =>
      ["pending", "submitted", "in_progress", "under_review"].includes(
        r.status?.toLowerCase()
      )
  ).length;

  const modalitiesCount = new Set(
    responses.map((r) => r.modality?.toLowerCase())
  ).size;

  if (loading) {
    return (
      <div className="responses-page">
        <div className="responses-loading">
          <div className="responses-spinner"></div>
          <h2>Loading Responses</h2>
          <p>Fetching submissions from your database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="responses-page">
      {/* Header */}
      <header className="responses-header">
        <div>
          <div className="responses-eyebrow">
            <span className="responses-live-dot"></span>
            SUBMISSION MANAGEMENT
          </div>

          <h1>Student Responses</h1>

          <p>
            Monitor, review and track student assessment submissions.
          </p>
        </div>

        <button className="responses-refresh" onClick={fetchResponses}>
          ↻ Refresh
        </button>
      </header>

      {/* Error */}
      {error && (
        <div className="responses-error">
          ⚠️ {error}
          <button onClick={fetchResponses}>Retry</button>
        </div>
      )}

      {/* Statistics */}
      <div className="responses-stats">
        <div className="response-stat-card">
          <div className="response-stat-icon blue">📥</div>
          <div>
            <h2>{totalResponses}</h2>
            <p>Total Submissions</p>
          </div>
        </div>

        <div className="response-stat-card">
          <div className="response-stat-icon green">✓</div>
          <div>
            <h2>{evaluatedCount}</h2>
            <p>Evaluated</p>
          </div>
        </div>

        <div className="response-stat-card">
          <div className="response-stat-icon orange">⏳</div>
          <div>
            <h2>{pendingCount}</h2>
            <p>Awaiting Evaluation</p>
          </div>
        </div>

        <div className="response-stat-card">
          <div className="response-stat-icon purple">🎯</div>
          <div>
            <h2>{modalitiesCount}</h2>
            <p>Response Types</p>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <section className="responses-card">
        <div className="responses-card-header">
          <div>
            <h2>Submission Records</h2>
            <p>Actual submissions retrieved from your database</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="responses-toolbar">
          <div className="responses-search">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search student, assessment, class or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={filterModality}
            onChange={(e) => setFilterModality(e.target.value)}
          >
            <option value="all">All Modalities</option>
            <option value="mcq">MCQ</option>
            <option value="omr">OMR</option>
            <option value="speech">Speech</option>
            <option value="sign_language">Sign Language</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="evaluated">Evaluated</option>
            <option value="submitted">Submitted</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="in_progress">In Progress</option>
          </select>
        </div>

        {/* Table */}
        <div className="responses-table-wrapper">
          <table className="responses-table">
            <thead>
              <tr>
                <th>Submission ID</th>
                <th>Student</th>
                <th>Assessment</th>
                <th>Modality</th>
                <th>Score</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredResponses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="responses-empty">
                    <div>📭</div>
                    <strong>No submissions found</strong>
                    <p>
                      {responses.length === 0
                        ? "Student submissions will appear here once submitted."
                        : "Try changing your search or filters."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredResponses.map((response) => (
                  <tr key={response.submission_id}>
                    <td>
                      <span className="response-id">
                        SUB-{String(response.submission_id).padStart(3, "0")}
                      </span>
                    </td>

                    <td>
                      <div className="response-student">
                        <span className="response-avatar">
                          {response.student_name?.charAt(0)?.toUpperCase() || "S"}
                        </span>

                        <div>
                          <strong>{response.student_name || "Unknown Student"}</strong>
                          <small>
                            {response.class_name || "Class not specified"}
                            {response.roll_number
                              ? ` · Roll ${response.roll_number}`
                              : ""}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="response-assessment">
                        {response.assessment_title || "Untitled Assessment"}
                      </div>
                      <small className="response-subject">
                        {response.subject || "—"}
                      </small>
                    </td>

                    <td>
                      <span className="response-modality">
                        {getInputIcon(response.modality)}
                        {formatModality(response.modality)}
                      </span>
                    </td>

                    <td>
                      {response.score !== null &&
                      response.score !== undefined
                        ? `${response.score} / ${response.total_marks}`
                        : "—"}
                    </td>

                    <td>
                      <span
                        className={`response-status ${getStatusClass(
                          response.status
                        )}`}
                      >
                        {getStatusLabel(response.status)}
                      </span>
                    </td>

                    <td>
                      <button
                        className="response-view-btn"
                        onClick={() => setSelectedResponse(response)}
                      >
                        View Details →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="responses-table-footer">
          <span>
            Showing <strong>{filteredResponses.length}</strong> of{" "}
            <strong>{totalResponses}</strong> submissions
          </span>
        </div>
      </section>

      {/* Details Panel */}
      {selectedResponse && (
        <div className="response-details-panel">
          <div className="response-details-header">
            <div>
              <span className="details-eyebrow">SUBMISSION DETAILS</span>
              <h2>
                SUB-{String(selectedResponse.submission_id).padStart(3, "0")}
              </h2>
              <p>Detailed information about this student submission</p>
            </div>

            <button
              className="response-close-btn"
              onClick={() => setSelectedResponse(null)}
            >
              ✕
            </button>
          </div>

          <div className="response-details-grid">
            <div className="response-detail-item">
              <span>Student Name</span>
              <strong>{selectedResponse.student_name}</strong>
            </div>

            <div className="response-detail-item">
              <span>Student ID</span>
              <strong>{selectedResponse.student_id}</strong>
            </div>

            <div className="response-detail-item">
              <span>Class</span>
              <strong>{selectedResponse.class_name}</strong>
            </div>

            <div className="response-detail-item">
              <span>Roll Number</span>
              <strong>{selectedResponse.roll_number || "—"}</strong>
            </div>

            <div className="response-detail-item">
              <span>Assessment</span>
              <strong>{selectedResponse.assessment_title}</strong>
            </div>

            <div className="response-detail-item">
              <span>Assessment ID</span>
              <strong>{selectedResponse.assessment_id}</strong>
            </div>

            <div className="response-detail-item">
              <span>Subject</span>
              <strong>{selectedResponse.subject || "—"}</strong>
            </div>

            <div className="response-detail-item">
              <span>Modality</span>
              <strong>
                {getInputIcon(selectedResponse.modality)}{" "}
                {formatModality(selectedResponse.modality)}
              </strong>
            </div>

            <div className="response-detail-item">
              <span>Score</span>
              <strong>
                {selectedResponse.score !== null &&
                selectedResponse.score !== undefined
                  ? `${selectedResponse.score} / ${selectedResponse.total_marks}`
                  : "Not evaluated"}
              </strong>
            </div>

            <div className="response-detail-item">
              <span>Status</span>
              <strong>
                {getStatusLabel(selectedResponse.status)}
              </strong>
            </div>

            <div className="response-detail-item">
              <span>Submitted At</span>
              <strong>
                {selectedResponse.submitted_at
                  ? new Date(selectedResponse.submitted_at).toLocaleString()
                  : "—"}
              </strong>
            </div>
          </div>

          {/* Evaluation Flow */}
          <div className="response-evaluation-box">
            <div className="evaluation-box-heading">
              <span className="evaluation-box-icon">🤖</span>
              <div>
                <h3>Assessment Processing</h3>
                <p>Submission and evaluation status</p>
              </div>
            </div>

            <div className="response-process-flow">
              <div className="process-step">
                <span>📥</span>
                <strong>Submitted</strong>
              </div>

              <div className="process-arrow">→</div>

              <div className="process-step">
                <span>{getInputIcon(selectedResponse.modality)}</span>
                <strong>{formatModality(selectedResponse.modality)}</strong>
              </div>

              <div className="process-arrow">→</div>

              <div className="process-step">
                <span>
                  {selectedResponse.status?.toLowerCase() === "evaluated"
                    ? "✅"
                    : "⏳"}
                </span>
                <strong>{getStatusLabel(selectedResponse.status)}</strong>
              </div>
            </div>

            <p className="response-processing-note">
              {selectedResponse.status?.toLowerCase() === "evaluated"
                ? "This submission has been evaluated and its result is available."
                : "This submission has been received. Evaluation details will become available when processing is completed."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Responses;
