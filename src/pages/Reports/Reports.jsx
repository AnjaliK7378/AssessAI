
import "./Reports.css";

function Reports() {
  const reportStats = [
    {
      title: "Total Students",
      value: "120",
      description: "Registered learners",
      icon: "👥",
      color: "blue",
      trend: "Student database",
    },
    {
      title: "Average Score",
      value: "84%",
      description: "Across all assessments",
      icon: "🎯",
      color: "green",
      trend: "Overall performance",
    },
    {
      title: "AI Evaluations",
      value: "342",
      description: "Responses evaluated",
      icon: "🤖",
      color: "purple",
      trend: "AI processed responses",
    },
    {
      title: "Teacher Reviews",
      value: "18",
      description: "Pending verification",
      icon: "📝",
      color: "orange",
      trend: "Manual review queue",
    },
  ];

  const modalityReports = [
    {
      modality: "OMR / Image",
      evaluations: 150,
      accuracy: 92,
      icon: "📷",
      color: "blue",
      description: "Image-based answer evaluation",
    },
    {
      modality: "Speech",
      evaluations: 102,
      accuracy: 84,
      icon: "🎤",
      color: "purple",
      description: "Voice response evaluation",
    },
    {
      modality: "Sign Language",
      evaluations: 90,
      accuracy: 78,
      icon: "🤟",
      color: "orange",
      description: "Visual gesture recognition",
    },
  ];

  const totalEvaluations = modalityReports.reduce(
    (sum, item) => sum + item.evaluations,
    0
  );

  const averageAccuracy = Math.round(
    modalityReports.reduce((sum, item) => sum + item.accuracy, 0) /
      modalityReports.length
  );

  const handleDownloadReport = () => {
    let csvContent = "AssessAI - Assessment Report\n\n";

    csvContent += "Overall Statistics\n";
    csvContent += "Category,Value,Description\n";

    reportStats.forEach((stat) => {
      csvContent += `"${stat.title}","${stat.value}","${stat.description}"\n`;
    });

    csvContent += "\nModality-wise Performance\n";
    csvContent += "Modality,Total Evaluations,Accuracy\n";

    modalityReports.forEach((report) => {
      csvContent += `"${report.modality}","${report.evaluations}","${report.accuracy}%"\n`;
    });

    csvContent += `\nTotal Evaluations,${totalEvaluations}\n`;
    csvContent += `Average Modality Accuracy,${averageAccuracy}%\n`;

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "AssessAI_Performance_Report.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="reports-page">
      {/* Header */}
      <div className="reports-header">
        <div>
          <div className="reports-eyebrow">ANALYTICS OVERVIEW</div>
          <h1>Reports & Analytics</h1>
          <p>
            Monitor student performance, AI evaluation activity and assessment
            insights.
          </p>
        </div>

        <button className="reports-download-btn" onClick={handleDownloadReport}>
          <span>↓</span> Download Report
        </button>
      </div>

      {/* Statistics */}
      <section className="reports-stat-grid">
        {reportStats.map((stat) => (
          <div
            className={`reports-stat-card ${stat.color}`}
            key={stat.title}
          >
            <div className="reports-stat-top">
              <div className="reports-stat-icon">{stat.icon}</div>
              <span className="reports-stat-label">{stat.title}</span>
            </div>

            <h2>{stat.value}</h2>
            <p>{stat.description}</p>

            <div className="reports-stat-footer">
              <span className="reports-stat-dot"></span>
              {stat.trend}
            </div>
          </div>
        ))}
      </section>

      {/* Performance Overview */}
      <section className="reports-performance-card">
        <div className="reports-section-header">
          <div>
            <h2>Evaluation Performance</h2>
            <p>Accuracy comparison across AI evaluation modalities</p>
          </div>

          <div className="reports-chart-legend">
            <span className="legend-dot"></span>
            Accuracy
          </div>
        </div>

        <div className="reports-chart">
          {modalityReports.map((report) => (
            <div className="reports-chart-item" key={report.modality}>
              <div className="reports-chart-label">
                <span>{report.icon}</span>
                <strong>{report.modality}</strong>
              </div>

              <div className="reports-chart-track">
                <div
                  className={`reports-chart-bar ${report.color}`}
                  style={{ width: `${report.accuracy}%` }}
                >
                  <span>{report.accuracy}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="reports-chart-summary">
          <div>
            <span>Total Evaluations</span>
            <strong>{totalEvaluations}</strong>
          </div>

          <div>
            <span>Average Modality Accuracy</span>
            <strong>{averageAccuracy}%</strong>
          </div>

          <div>
            <span>Highest Accuracy</span>
            <strong>OMR / Image · 92%</strong>
          </div>
        </div>
      </section>

      {/* Modality cards */}
      <section className="reports-modality-section">
        <div className="reports-section-header">
          <div>
            <h2>Modality-wise Performance</h2>
            <p>Detailed breakdown of each AI evaluation method</p>
          </div>
        </div>

        <div className="reports-modality-grid">
          {modalityReports.map((report) => (
            <div
              className={`reports-modality-card ${report.color}`}
              key={report.modality}
            >
              <div className="reports-modality-top">
                <div className="reports-modality-icon">
                  {report.icon}
                </div>

                <span className="reports-modality-tag">
                  AI Modality
                </span>
              </div>

              <h3>{report.modality}</h3>
              <p>{report.description}</p>

              <div className="reports-modality-metrics">
                <div>
                  <span>Evaluations</span>
                  <strong>{report.evaluations}</strong>
                </div>

                <div>
                  <span>Accuracy</span>
                  <strong>{report.accuracy}%</strong>
                </div>
              </div>

              <div className="reports-mini-track">
                <div
                  className="reports-mini-fill"
                  style={{ width: `${report.accuracy}%` }}
                ></div>
              </div>

              <div className="reports-modality-bottom">
                <span>Model performance</span>
                <strong>{report.accuracy}%</strong>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Report export section */}
      <section className="reports-export-card">
        <div className="reports-export-icon">📊</div>

        <div className="reports-export-content">
          <h3>Export Assessment Summary</h3>
          <p>
            Download the overall statistics and modality-wise evaluation
            performance as a CSV file for further analysis.
          </p>
        </div>

        <button
          className="reports-export-secondary"
          onClick={handleDownloadReport}
        >
          Export CSV <span>↗</span>
        </button>
      </section>
    </div>
  );
}

export default Reports;
