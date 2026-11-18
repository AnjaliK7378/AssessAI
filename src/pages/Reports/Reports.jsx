import "./Reports.css";

function Reports() {
  const reportStats = [
    {
      title: "Total Students",
      value: "120",
      description: "Registered students",
    },
    {
      title: "Average Score",
      value: "84%",
      description: "Across all assessments",
    },
    {
      title: "AI Evaluations",
      value: "342",
      description: "Responses evaluated",
    },
    {
      title: "Teacher Reviews",
      value: "18",
      description: "Pending verification",
    },
  ];

  const modalityReports = [
    {
      modality: "OMR/Image",
      evaluations: 150,
      accuracy: "92%",
    },
    {
      modality: "Speech",
      evaluations: 102,
      accuracy: "84%",
    },
    {
      modality: "Sign Language",
      evaluations: 90,
      accuracy: "78%",
    },
  ];

  // Download report
  const handleDownloadReport = () => {
    let csvContent = "AssessAI - Assessment Report\n\n";

    csvContent += "Overall Statistics\n";
    csvContent += "Category,Value,Description\n";

    reportStats.forEach((stat) => {
      csvContent += `"${stat.title}","${stat.value}","${stat.description}"\n`;
    });

    csvContent += "\n";

    csvContent += "Modality-wise Performance\n";
    csvContent += "Modality,Total Evaluations,Accuracy\n";

    modalityReports.forEach((report) => {
      csvContent += `"${report.modality}","${report.evaluations}","${report.accuracy}"\n`;
    });

    // Create downloadable file
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "AssessAI_Report.csv";

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-container">

      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <p>View assessment performance and evaluation summaries</p>
        </div>

        <button
          className="primary-button"
          onClick={handleDownloadReport}
        >
          Download Report
        </button>
      </div>

      <div className="report-cards">
        {reportStats.map((stat) => (
          <div className="report-card" key={stat.title}>
            <h3>{stat.title}</h3>
            <h2>{stat.value}</h2>
            <p>{stat.description}</p>
          </div>
        ))}
      </div>

      <div className="report-section">
        <h2>Modality-wise Performance</h2>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Modality</th>
                <th>Total Evaluations</th>
                <th>Accuracy</th>
              </tr>
            </thead>

            <tbody>
              {modalityReports.map((report) => (
                <tr key={report.modality}>
                  <td>{report.modality}</td>
                  <td>{report.evaluations}</td>
                  <td>{report.accuracy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default Reports;