
import { useState, useEffect, useMemo } from "react";
import { getTeacherResults } from "../../api";
import "./Results.css";

function Results() {
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [search, setSearch] = useState("");
  const [modalityFilter, setModalityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getTeacherResults();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Results loading error:", err);
      setError(err.message || "Unable to load student results.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // ------------------------------------------
  // HELPERS
  // ------------------------------------------

  const formatModality = (modality) => {
    const map = {
      mcq: "MCQ",
      omr: "OMR / Image",
      speech: "Speech / Audio",
      audio: "Speech / Audio",
      verbal: "Speech / Audio",
      sign_language: "Sign Language",
      video: "Video",
    };

    return map[modality?.toLowerCase()] || modality || "Other";
  };

  const getModalityClass = (modality) => {
    const value = modality?.toLowerCase();

    if (value === "mcq") return "mcq";
    if (value === "omr") return "omr";
    if (["speech", "audio", "verbal"].includes(value)) return "speech";
    if (["sign_language", "video"].includes(value)) return "sign";

    return "other";
  };

  const getStatusLabel = (status) => {
    const map = {
      evaluated: "Evaluated",
      submitted: "Submitted",
      pending: "Pending",
      processing: "Processing",
      under_review: "Under Review",
      teacher_review: "Teacher Review",
      in_progress: "In Progress",
      failed: "Failed",
    };

    return map[status?.toLowerCase()] || status || "Unknown";
  };

  const getStatusClass = (status) => {
    const value = status?.toLowerCase();

    if (value === "evaluated") return "evaluated";
    if (["pending", "submitted", "processing"].includes(value))
      return "pending";
    if (["under_review", "teacher_review"].includes(value))
      return "review";
    if (value === "failed") return "failed";
    if (value === "in_progress") return "progress";

    return "unknown";
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "—";

    return parsed.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPercentage = (score, total) => {
    if (
      score === null ||
      score === undefined ||
      total === null ||
      total === undefined ||
      Number(total) <= 0
    ) {
      return null;
    }

    return Math.min(100, Math.max(0, (Number(score) / Number(total)) * 100));
  };

  // ------------------------------------------
  // REAL SUMMARY STATISTICS
  // ------------------------------------------

  const evaluatedResults = results.filter(
    (result) =>
      result.status?.toLowerCase() === "evaluated" &&
      result.score !== null &&
      result.score !== undefined &&
      Number(result.total_marks) > 0
  );

  const pendingResults = results.filter(
    (result) => result.status?.toLowerCase() !== "evaluated"
  );

  const averagePercentage =
    evaluatedResults.length > 0
      ? Math.round(
          evaluatedResults.reduce((sum, result) => {
            return (
              sum +
              (Number(result.score) / Number(result.total_marks)) * 100
            );
          }, 0) / evaluatedResults.length
        )
      : 0;

  const uniqueStudents = new Set(
    results.map((result) => result.student_id)
  ).size;

  // ------------------------------------------
  // FILTERS
  // ------------------------------------------

  const filteredResults = useMemo(() => {
    return results.filter((result) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        !searchText ||
        result.student_name?.toLowerCase().includes(searchText) ||
        result.assessment_title?.toLowerCase().includes(searchText) ||
        result.subject?.toLowerCase().includes(searchText) ||
        String(result.roll_number || "").toLowerCase().includes(searchText);

      const matchesModality =
        modalityFilter === "all" ||
        result.modality?.toLowerCase() === modalityFilter;

      const matchesStatus =
        statusFilter === "all" ||
        result.status?.toLowerCase() === statusFilter;

      return matchesSearch && matchesModality && matchesStatus;
    });
  }, [results, search, modalityFilter, statusFilter]);

  // ------------------------------------------
  // LOADING
  // ------------------------------------------

  if (loading) {
    return (
      <div className="results-page">
        <div className="results-loading">
          <div className="results-spinner"></div>
          <h2>Loading student results</h2>
          <p>Fetching real assessment data...</p>
        </div>
      </div>
    );
  }

  // ------------------------------------------
  // PAGE
  // ------------------------------------------

  return (
    <div className="results-page">
      {/* HEADER */}
      <div className="results-header">
        <div className="results-header-content">
          <div className="results-eyebrow">
            <span className="results-live-dot"></span>
            ASSESSAI · PERFORMANCE CENTER
          </div>

          <h1>Student Results</h1>

          <p>
            Monitor submissions, track learner scores and review
            multimodal assessment outcomes.
          </p>
        </div>

        <button className="results-refresh-btn" onClick={fetchResults}>
          ↻ Refresh Results
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="results-error">
          <span>⚠️ {error}</span>
          <button onClick={fetchResults}>Retry</button>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="results-stats-grid">
        <div className="results-stat-card">
          <div className="results-stat-icon indigo">📋</div>
          <div className="results-stat-info">
            <span>Total Submissions</span>
            <h2>{results.length}</h2>
            <small>All received responses</small>
          </div>
        </div>

        <div className="results-stat-card">
          <div className="results-stat-icon teal">✓</div>
          <div className="results-stat-info">
            <span>Evaluated</span>
            <h2>{evaluatedResults.length}</h2>
            <small>Results available</small>
          </div>
        </div>

        <div className="results-stat-card">
          <div className="results-stat-icon amber">⏳</div>
          <div className="results-stat-info">
            <span>Pending</span>
            <h2>{pendingResults.length}</h2>
            <small>Awaiting evaluation</small>
          </div>
        </div>

        <div className="results-stat-card">
          <div className="results-stat-icon violet">👨‍🎓</div>
          <div className="results-stat-info">
            <span>Participating Students</span>
            <h2>{uniqueStudents}</h2>
            <small>Unique learners</small>
          </div>
        </div>
      </div>

      {/* AVERAGE SCORE */}
      <div className="results-average-card">
        <div className="results-average-left">
          <div className="results-average-icon">📈</div>
          <div>
            <h3>Overall Performance</h3>
            <p>Average percentage across evaluated submissions</p>
          </div>
        </div>

        <div className="results-average-value">
          <strong>{averagePercentage}%</strong>
          <span>Average score</span>
        </div>

        <div className="results-average-bar">
          <div
            className="results-average-fill"
            style={{ width: `${averagePercentage}%` }}
          ></div>
        </div>
      </div>

      {/* RESULTS TABLE */}
      <div className="results-main-card">
        <div className="results-table-header">
          <div>
            <h2>Assessment Records</h2>
            <p>Student-wise submissions and evaluation results</p>
          </div>

          <div className="results-record-count">
            {filteredResults.length} records
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="results-toolbar">
          <div className="results-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search student, assessment, subject or roll no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={modalityFilter}
            onChange={(e) => setModalityFilter(e.target.value)}
          >
            <option value="all">All Modalities</option>
            <option value="mcq">MCQ</option>
            <option value="omr">OMR / Image</option>
            <option value="speech">Speech / Audio</option>
            <option value="audio">Audio</option>
            <option value="sign_language">Sign Language</option>
            <option value="video">Video</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="evaluated">Evaluated</option>
            <option value="submitted">Submitted</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="under_review">Under Review</option>
            <option value="teacher_review">Teacher Review</option>
          </select>
        </div>

        {/* TABLE */}
        {filteredResults.length === 0 ? (
          <div className="results-empty">
            <div className="results-empty-icon">🔎</div>
            <h3>No results found</h3>
            <p>
              {results.length === 0
                ? "Student submissions will appear here once learners complete assessments."
                : "Try adjusting your search or filters."}
            </p>
          </div>
        ) : (
          <div className="results-table-wrapper">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Assessment</th>
                  <th>Modality</th>
                  <th>Score</th>
                  <th>Performance</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredResults.map((result) => {
                  const percentage = getPercentage(
                    result.score,
                    result.total_marks
                  );

                  return (
                    <tr key={result.submission_id}>
                      <td>
                        <div className="results-student-cell">
                          <div className="results-avatar">
                            {result.student_name?.charAt(0)?.toUpperCase() || "S"}
                          </div>

                          <div className="results-student-info">
                            <strong>{result.student_name}</strong>
                            <small>
                              {result.class_name || "Class N/A"}
                              {result.roll_number
                                ? ` · Roll ${result.roll_number}`
                                : ""}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="results-assessment-cell">
                          <strong>{result.assessment_title}</strong>
                          <small>{result.subject || "Subject N/A"}</small>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`results-modality-badge ${getModalityClass(
                            result.modality
                          )}`}
                        >
                          {formatModality(result.modality)}
                        </span>
                      </td>

                      <td>
                        <strong className="results-score">
                          {result.score !== null && result.score !== undefined
                            ? `${result.score} / ${result.total_marks}`
                            : "—"}
                        </strong>
                      </td>

                      <td>
                        {percentage !== null ? (
                          <div className="results-performance-cell">
                            <strong>{Math.round(percentage)}%</strong>
                            <div className="results-mini-bar">
                              <div
                                style={{ width: `${percentage}%` }}
                                className={
                                  percentage >= 75
                                    ? "high"
                                    : percentage >= 40
                                    ? "medium"
                                    : "low"
                                }
                              ></div>
                            </div>
                          </div>
                        ) : (
                          <span className="results-muted">Not evaluated</span>
                        )}
                      </td>

                      <td>
                        <span
                          className={`results-status ${getStatusClass(
                            result.status
                          )}`}
                        >
                          {getStatusLabel(result.status)}
                        </span>
                      </td>

                      <td>
                        <span className="results-date">
                          {formatDate(result.submitted_at)}
                        </span>
                      </td>

                      <td>
                        <button
                          className="results-view-btn"
                          onClick={() => setSelectedResult(result)}
                        >
                          View ↗
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RESULT DETAILS */}
      {selectedResult && (
        <div className="results-details-card">
          <div className="results-details-header">
            <div className="results-details-title">
              <div className="results-details-icon">📑</div>
              <div>
                <h2>Submission Details</h2>
                <p>
                  Detailed information about this student's assessment
                </p>
              </div>
            </div>

            <button
              className="results-close-btn"
              onClick={() => setSelectedResult(null)}
            >
              ✕
            </button>
          </div>

          <div className="results-details-grid">
            <div>
              <span>Submission ID</span>
              <strong>#{selectedResult.submission_id}</strong>
            </div>

            <div>
              <span>Student Name</span>
              <strong>{selectedResult.student_name}</strong>
            </div>

            <div>
              <span>Class</span>
              <strong>{selectedResult.class_name || "—"}</strong>
            </div>

            <div>
              <span>Roll Number</span>
              <strong>{selectedResult.roll_number || "—"}</strong>
            </div>

            <div>
              <span>Assessment</span>
              <strong>{selectedResult.assessment_title}</strong>
            </div>

            <div>
              <span>Subject</span>
              <strong>{selectedResult.subject || "—"}</strong>
            </div>

            <div>
              <span>Modality</span>
              <strong>{formatModality(selectedResult.modality)}</strong>
            </div>

            <div>
              <span>Score</span>
              <strong>
                {selectedResult.score !== null &&
                selectedResult.score !== undefined
                  ? `${selectedResult.score} / ${selectedResult.total_marks}`
                  : "Awaiting evaluation"}
              </strong>
            </div>

            <div>
              <span>Percentage</span>
              <strong>
                {getPercentage(
                  selectedResult.score,
                  selectedResult.total_marks
                ) !== null
                  ? `${Math.round(
                      getPercentage(
                        selectedResult.score,
                        selectedResult.total_marks
                      )
                    )}%`
                  : "—"}
              </strong>
            </div>

            <div>
              <span>Status</span>
              <strong>{getStatusLabel(selectedResult.status)}</strong>
            </div>

            <div>
              <span>Submitted At</span>
              <strong>{formatDate(selectedResult.submitted_at)}</strong>
            </div>
          </div>

          <div className="results-details-footer">
            <span>AssessAI</span>
            <span>Multimodal Learner Assessment System</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Results;
