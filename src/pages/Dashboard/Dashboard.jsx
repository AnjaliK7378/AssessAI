import "./Dashboard.css";

function Dashboard() {
  const stats = [
    {
      title: "Total Students",
      value: "120",
      subtitle: "Registered learners",
      icon: "👨‍🎓",
    },
    {
      title: "Assessments",
      value: "15",
      subtitle: "Created assessments",
      icon: "📝",
    },
    {
      title: "Evaluated Responses",
      value: "342",
      subtitle: "AI evaluated responses",
      icon: "🤖",
    },
    {
      title: "Pending Review",
      value: "18",
      subtitle: "Need teacher verification",
      icon: "⚠️",
    },
  ];

  const recentAssessments = [
    {
      id: "ASM001",
      name: "Alphabet Recognition",
      subject: "Language",
      students: 25,
      status: "Completed",
    },
    {
      id: "ASM002",
      name: "Basic Mathematics",
      subject: "Mathematics",
      students: 18,
      status: "Ongoing",
    },
    {
      id: "ASM003",
      name: "Communication Skills",
      subject: "Communication",
      students: 12,
      status: "Pending",
    },
  ];

  const evaluationSummary = [
    {
      label: "High Confidence",
      value: "82%",
      description: "Direct AI evaluation",
    },
    {
      label: "VLM Escalation",
      value: "13%",
      description: "Semantic evaluation",
    },
    {
      label: "Teacher Verification",
      value: "5%",
      description: "Manual review required",
    },
  ];

  const modalityData = [
    {
      modality: "OMR / Image",
      responses: 156,
      percentage: "46%",
    },
    {
      modality: "Speech",
      responses: 108,
      percentage: "32%",
    },
    {
      modality: "Sign Language",
      responses: 78,
      percentage: "22%",
    },
  ];

  return (
    <div className="dashboard-page">

      {/* Page Header */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>
            Overview of learner assessments and AI-based evaluation
          </p>
        </div>

        <button className="primary-btn">
          + Create Assessment
        </button>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.title}>
            <div className="stat-card-top">
              <div className="stat-icon">
                {stat.icon}
              </div>
            </div>

            <h2>{stat.value}</h2>
            <h3>{stat.title}</h3>
            <p>{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">

        {/* Recent Assessments */}
        <section className="dashboard-card assessments-card">
          <div className="card-header">
            <div>
              <h2>Recent Assessments</h2>
              <p>Latest assessment activity</p>
            </div>

            <button className="text-btn">
              View All
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Assessment</th>
                  <th>Subject</th>
                  <th>Students</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentAssessments.map((assessment) => (
                  <tr key={assessment.id}>
                    <td>{assessment.id}</td>
                    <td>{assessment.name}</td>
                    <td>{assessment.subject}</td>
                    <td>{assessment.students}</td>
                    <td>
                      <span
                        className={`status-badge ${assessment.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {assessment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* AI Evaluation Summary */}
        <section className="dashboard-card ai-card">
          <div className="card-header">
            <div>
              <h2>AI Evaluation</h2>
              <p>Current evaluation routing</p>
            </div>
          </div>

          <div className="evaluation-list">
            {evaluationSummary.map((item) => (
              <div className="evaluation-item" key={item.label}>
                <div className="evaluation-info">
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </div>

                <div className="evaluation-value">
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <div className="ai-note">
            <span>ℹ️</span>
            <p>
              Low-confidence responses can be routed for
              additional semantic evaluation or teacher verification.
            </p>
          </div>
        </section>

      </div>

      {/* Bottom Dashboard Grid */}
      <div className="dashboard-grid bottom-grid">

        {/* Modality Overview */}
        <section className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>Response Modalities</h2>
              <p>Distribution of submitted responses</p>
            </div>
          </div>

          <div className="modality-list">
            {modalityData.map((item) => (
              <div className="modality-item" key={item.modality}>
                <div className="modality-header">
                  <span>{item.modality}</span>
                  <strong>{item.responses}</strong>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: item.percentage }}
                  ></div>
                </div>

                <small>{item.percentage} of total responses</small>
              </div>
            ))}
          </div>
        </section>

        {/* Teacher Verification */}
        <section className="dashboard-card review-card">
          <div className="card-header">
            <div>
              <h2>Pending Teacher Review</h2>
              <p>Responses requiring verification</p>
            </div>

            <span className="review-count">18</span>
          </div>

          <div className="review-message">
            <div className="review-icon">
              ⚠️
            </div>

            <div>
              <h3>18 responses need attention</h3>
              <p>
                These responses were not confidently resolved
                by the automated evaluation pipeline.
              </p>
            </div>
          </div>

          <button className="secondary-btn">
            Open Review Queue
          </button>
        </section>

      </div>

      {/* Demo Data Notice */}
      <div className="demo-notice">
        <strong>Demo Data:</strong> The values currently shown on
        this dashboard are sample values for frontend development.
        They will later be replaced with data from the backend and
        AI evaluation pipeline.
      </div>

    </div>
  );
}

export default Dashboard;

