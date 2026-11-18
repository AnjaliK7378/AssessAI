
import { useState, useEffect, useCallback, useMemo } from "react";
import { getTeacherStudents } from "../../api";
import "./Students.css";

function Students() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getTeacherStudents();

      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Students loading error:", err);
      setError(err.message || "Failed to load students.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return students.filter((student) =>
      [
        student.full_name,
        student.email,
        student.class_name,
        student.roll_number,
        student.id,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search))
    );
  }, [students, searchTerm]);

  const totalAssessments = students.reduce(
    (total, student) => total + (student.assessment_count || 0),
    0
  );

  const classCount = new Set(
    students.map((student) => student.class_name).filter(Boolean)
  ).size;

  const getInitials = (name) => {
    return (name || "Student")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("");
  };

  if (loading) {
    return (
      <div className="students-page">
        <div className="students-loading">
          <div className="students-spinner"></div>
          <h2>Loading students...</h2>
          <p>Fetching student records from your database.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="students-page">
      {/* Header */}
      <header className="students-header">
        <div>
          <span className="students-eyebrow">
            <span className="students-live-dot"></span>
            LEARNER MANAGEMENT
          </span>

          <h1>Students</h1>

          <p>
            Manage learners and monitor their assessment participation.
          </p>
        </div>

        <button className="students-refresh-btn" onClick={fetchStudents}>
          ↻ Refresh
        </button>
      </header>

      {/* Error */}
      {error && (
        <div className="students-error">
          <span>⚠️ {error}</span>
          <button onClick={fetchStudents}>Retry</button>
        </div>
      )}

      {/* Summary cards */}
      <div className="students-stats-grid">
        <div className="students-stat-card">
          <div className="students-stat-icon blue">👨‍🎓</div>
          <div className="students-stat-info">
            <span>Total Students</span>
            <h2>{students.length}</h2>
            <small>Registered learners</small>
          </div>
        </div>

        <div className="students-stat-card">
          <div className="students-stat-icon purple">🏫</div>
          <div className="students-stat-info">
            <span>Total Classes</span>
            <h2>{classCount}</h2>
            <small>Classes represented</small>
          </div>
        </div>

        <div className="students-stat-card">
          <div className="students-stat-icon green">📝</div>
          <div className="students-stat-info">
            <span>Assessment Submissions</span>
            <h2>{totalAssessments}</h2>
            <small>Participation records</small>
          </div>
        </div>
      </div>

      {/* Students table */}
      <section className="students-card">
        <div className="students-card-header">
          <div>
            <h2>Student Directory</h2>
            <p>Student records retrieved from your database</p>
          </div>

          <div className="students-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search name, email, class or roll no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {searchTerm && (
              <button onClick={() => setSearchTerm("")} title="Clear search">
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="students-table-wrapper">
          <table className="students-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Student ID</th>
                <th>Class</th>
                <th>Roll Number</th>
                <th>Assessments</th>
                <th>Registration</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="students-user-cell">
                        <div className="students-avatar">
                          {getInitials(student.full_name)}
                        </div>

                        <div className="students-user-info">
                          <strong>{student.full_name}</strong>
                          <small>{student.email}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="students-id">
                        STU{String(student.id).padStart(3, "0")}
                      </span>
                    </td>

                    <td>
                      <span className="students-class-badge">
                        {student.class_name || "—"}
                      </span>
                    </td>

                    <td>{student.roll_number || "—"}</td>

                    <td>
                      <span className="students-assessment-count">
                        {student.assessment_count ?? 0}
                      </span>
                    </td>

                    <td>
                      <span className="students-status">
                        <span className="students-status-dot"></span>
                        Registered
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    <div className="students-empty">
                      <div className="students-empty-icon">🔍</div>

                      <h3>
                        {searchTerm
                          ? "No matching students"
                          : "No students registered yet"}
                      </h3>

                      <p>
                        {searchTerm
                          ? "Try searching with another name, email, class or roll number."
                          : "Registered students will appear here automatically."}
                      </p>

                      {searchTerm && (
                        <button onClick={() => setSearchTerm("")}>
                          Clear Search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="students-table-footer">
          <span>
            Showing <strong>{filteredStudents.length}</strong> of{" "}
            <strong>{students.length}</strong> students
          </span>

          <span className="students-database-indicator">
            <span></span>
            Live database data
          </span>
        </div>
      </section>
    </div>
  );
}

export default Students;
