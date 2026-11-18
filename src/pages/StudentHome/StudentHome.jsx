import { useNavigate } from "react-router-dom";
import "./StudentHome.css";

function StudentHome() {
  const navigate = useNavigate();

  const assessments = [
    {
      id: "ASM001",
      title: "Mathematics - Algebra",
      subject: "Mathematics",
      className: "Class 8",
      questions: 20,
      duration: "30 Minutes",
      status: "Available",
    },
    {
      id: "ASM002",
      title: "Science - Human Body",
      subject: "Science",
      className: "Class 7",
      questions: 15,
      duration: "25 Minutes",
      status: "Available",
    },
    {
      id: "ASM003",
      title: "English - Grammar",
      subject: "English",
      className: "Class 8",
      questions: 25,
      duration: "30 Minutes",
      status: "Available",
    },
  ];

  return (
    <div className="student-page">

      {/* Top Header */}
      <header className="student-header">
        <div>
          <h1>AssessAI</h1>
          <p>Learner Assessment System</p>
        </div>

        <div className="student-profile">
          <div className="profile-circle">R</div>
          <div>
            <strong>Rahul Patil</strong>
            <span>Class 8</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="student-content">

        <div className="welcome-section">
          <h2>Welcome, Rahul! 👋</h2>
          <p>
            Select an assessment below to start your test.
          </p>
        </div>

        {/* Assessment Section */}
        <section className="assessment-section">

          <div className="section-heading">
            <h2>Available Assessments</h2>
            <span>{assessments.length} Tests Available</span>
          </div>

          <div className="assessment-grid">

            {assessments.map((assessment) => (
              <div className="student-assessment-card" key={assessment.id}>

                <div className="assessment-card-top">
                  <span className="subject-badge">
                    {assessment.subject}
                  </span>

                  <span className="available-badge">
                    {assessment.status}
                  </span>
                </div>

                <h3>{assessment.title}</h3>

                <p className="assessment-id">
                  Assessment ID: {assessment.id}
                </p>

                <div className="assessment-info">

                  <div>
                    <span>Class</span>
                    <strong>{assessment.className}</strong>
                  </div>

                  <div>
                    <span>Questions</span>
                    <strong>{assessment.questions}</strong>
                  </div>

                  <div>
                    <span>Duration</span>
                    <strong>{assessment.duration}</strong>
                  </div>

                </div>

                <button
                  className="start-button"
                  onClick={() =>
                    navigate(`/student/instructions/${assessment.id}`)
                  }
                >
                  Start Assessment →
                </button>

              </div>
            ))}

          </div>

        </section>

      </main>
    </div>
  );
}

export default StudentHome;