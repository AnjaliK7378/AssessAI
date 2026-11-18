import {
  getAssessment,
  startAssessment,
  submitAssessment,
} from "../../api";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./StudentTest.css";

function StudentTest() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [uploadedFile, setUploadedFile] = useState(null);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch actual assessment and questions from FastAPI.
   
useEffect(() => {
  const fetchAssessment = async () => {
    try {
      setLoading(true);
      setError("");

      // STEP 1: Start or retrieve the student's attempt
      const attempt = await startAssessment(assessmentId);

      console.log("Assessment attempt:", attempt);

      // Do not allow expired or completed attempts
      if (attempt.status !== "in_progress") {
        throw new Error(
          `Your assessment attempt is ${attempt.status}. Please contact your teacher.`
        );
      }

      // STEP 2: Fetch assessment questions
      const data = await getAssessment(assessmentId);

      console.log("Assessment data:", data);

      if (data.status?.toLowerCase() !== "active") {
        throw new Error("This assessment has not been published.");
      }

      // STEP 3: Format question options
      const formattedQuestions = (data.questions || []).map((question) => {
        let options = [];

        if (Array.isArray(question.options)) {
          options = question.options;
        } else if (typeof question.options === "string") {
          try {
            const parsed = JSON.parse(question.options);
            options = Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            options = question.options.split(",");
          }
        }

        return {
          ...question,
          options: options
            .map((option) => String(option).trim())
            .filter(Boolean),
        };
      });

      if (formattedQuestions.length === 0) {
        throw new Error("This assessment has no questions.");
      }

      // STEP 4: Display assessment
      setAssessment({
        ...data,
        questions: formattedQuestions,
      });

    } catch (err) {
      console.error("Assessment loading error:", err);
      setError(err.message || "Unable to load assessment.");
    } finally {
      setLoading(false);
    }
  };

  fetchAssessment();
}, [assessmentId]);


  // Stop camera when leaving the page.
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  const formatModality = (modality) => {
    const modalityMap = {
      omr: "OMR / Image",
      speech: "Speech",
      sign_language: "Sign Language",
      mcq: "MCQ",
    };

    return modalityMap[modality?.toLowerCase()] || modality;
  };

  if (loading) {
    return (
      <div className="test-error">
        <h2>Loading Assessment...</h2>
        <p>Please wait while we load your questions.</p>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="test-error">
        <h2>Assessment Not Available</h2>
        <p>{error || "Assessment could not be found."}</p>

        <button onClick={() => navigate("/student/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const questions = assessment.questions;
  const question = questions[currentQuestion];

  const modality = assessment.modality?.toLowerCase();

  const progress =
    ((currentQuestion + 1) / questions.length) * 100;

  // Save answer for the current question.
  const handleAnswerChange = (answer) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image.");
      event.target.value = "";
      return;
    }

    setUploadedFile(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      setCameraStream(stream);
      setIsCameraOn(true);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Unable to access camera. Please allow camera permission.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }

    setCameraStream(null);
    setIsCameraOn(false);
  };

  // Display the appropriate response method.
  const renderResponseArea = () => {
    switch (modality) {
      case "mcq":
        return (
          <div className="mcq-box">
            <h3>Select an answer</h3>

            <div className="options-grid">
              {question.options.map((option, index) => {
                const letter = String.fromCharCode(65 + index);

                return (
                  <button
                    type="button"
                    key={index}
                    className={`option-button ${
                      answers[question.id] === option
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => handleAnswerChange(option)}
                  >
                    <span className="option-letter">{letter}</span>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case "omr":
        return (
          <div className="response-box omr-box">
            <div className="response-icon">📷</div>

            <h3>OMR Answer Sheet</h3>

            <p>
              Complete your answer sheet using the questions
              and options provided. Upload one clear image
              of your completed answer sheet.
            </p>

            <label className="upload-button">
              📁 Upload OMR Sheet

              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                hidden
              />
            </label>

            {uploadedFile && (
              <div className="omr-preview">
                <p className="file-name">
                  Selected: {uploadedFile.name}
                </p>

                <img
                  src={URL.createObjectURL(uploadedFile)}
                  alt="OMR Sheet Preview"
                  className="omr-image-preview"
                />

                <button
                  type="button"
                  className="remove-file-button"
                  onClick={() => setUploadedFile(null)}
                >
                  ✕ Remove Image
                </button>
              </div>
            )}

            {!uploadedFile && (
              <p className="response-note">
                Upload your completed answer sheet before submitting.
              </p>
            )}
          </div>
        );

      case "speech":
        return (
          <div className="response-box speech-box">
            <div className="response-icon">🎤</div>

            <h3>Speech Response</h3>

            <p>
              Your answer should be provided through speech.
            </p>

            <p className="response-note">
              Audio recording and upload will be connected
              when the speech recognition module is integrated.
            </p>
          </div>
        );

      case "sign_language":
        return (
          <div className="response-box sign-box">
            {!isCameraOn ? (
              <>
                <div className="response-icon">🤟</div>

                <h3>Sign Language Response</h3>

                <p>
                  Use your camera to provide your sign language answer.
                </p>

                <button
                  className="camera-button"
                  onClick={startCamera}
                >
                  📷 Start Camera
                </button>

                <p className="response-note">
                  Camera preview is available. Video capture and
                  model integration are still pending.
                </p>
              </>
            ) : (
              <>
                <h3>Camera Active</h3>

                <div className="camera-preview-container">
                  <video
                    autoPlay
                    playsInline
                    ref={(video) => {
                      if (video && cameraStream) {
                        video.srcObject = cameraStream;
                      }
                    }}
                    className="camera-preview"
                  />
                </div>

                <p className="response-note">
                  Show your sign language response in front of the camera.
                </p>

                <button
                  className="stop-camera-button"
                  onClick={stopCamera}
                >
                  ⏹ Stop Camera
                </button>
              </>
            )}
          </div>
        );

      default:
        return (
          <div className="response-box">
            <h3>Response Method Not Available</h3>
          </div>
        );
    }
  };

  
  const handleSubmit = async () => {
    if (submitting) return;

    if (modality === "omr" && !uploadedFile) {
      alert("Please upload your completed OMR answer sheet.");
      return;
    }

    if (modality === "mcq") {
      const unanswered = questions.filter(
        (q) => !answers[q.id]
      );

      if (unanswered.length > 0) {
        alert(
          `Please answer all questions. ${unanswered.length} question(s) remain unanswered.`
        );
        return;
      }
    }

    if (modality === "sign_language") {
      alert("Sign language submission is not connected yet.");
      return;
    }

    if (modality === "speech") {
      alert("Speech recording and submission are not connected yet.");
      return;
    }

    if (modality !== "mcq") {
      alert(
        "Online submission is currently available for MCQ assessments only."
      );
      return;
    }
    try {
      setSubmitting(true);

      const result = await submitAssessment({
        assessment_id: Number(assessmentId),
        answers: answers,
      });

      console.log("Submission response:", result);

      if (result.status === "evaluated") {
        alert(
          `Assessment submitted successfully!\nYour Score: ${result.score} / ${result.total_marks}`
        );
      } else {
        alert("Assessment submitted successfully!");
      }

      navigate("/student/dashboard");

    } catch (err) {
      console.error("Submission error:", err);
      alert(err.message || "Failed to submit assessment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="student-test-page">

      <header className="test-header">
        <div className="test-logo">
          <h2>AssessAI</h2>
          <p>Learner Assessment</p>
        </div>

        <div className="test-title">
          <h3>{assessment.title}</h3>
          <p>{formatModality(modality)} Assessment</p>
        </div>

        <div className="timer-box">
          <span>Assessment ID</span>
          <strong>{assessment.assessment_code}</strong>
        </div>
      </header>

      <main className="test-main">

        <div className="progress-section">
          <div className="progress-info">
            <span>
              Question {currentQuestion + 1} of {questions.length}
            </span>

            <span>{Math.round(progress)}%</span>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <section className="question-card">
          <div className="question-number">
            Question {currentQuestion + 1}
          </div>

          <h1 className="question-text">
            {question.question_text}
          </h1>

          {renderResponseArea()}

        </section>

        <div className="question-navigation">

          <button
            className="previous-button"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            ← Previous
          </button>

          <div className="question-dots">
            {questions.map((q, index) => (
              <span
                key={q.id}
                className={
                  index === currentQuestion
                    ? "dot active"
                    : "dot"
                }
              >
                {index + 1}
              </span>
            ))}
          </div>

          {currentQuestion < questions.length - 1 ? (
            <button
              className="next-button"
              onClick={handleNext}
            >
              Next →
            </button>
          ) : (
            <button
              className="next-button"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Assessment"}
            </button>
          )}

        </div>

      </main>
    </div>
  );
}

export default StudentTest;
