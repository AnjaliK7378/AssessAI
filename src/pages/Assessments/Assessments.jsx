
import { useState, useEffect, useCallback } from "react";
import {
  getAssessments,
  createAssessment,
  publishAssessment,
} from "../../api";
import "./Assessments.css";

function Assessments() {
  const [showForm, setShowForm] = useState(false);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [publishingId, setPublishingId] = useState(null);
  const [error, setError] = useState("");

  const createEmptyQuestion = () => ({
    id: Date.now() + Math.random(),
    question: "",
    correctAnswer: "",
    options: ["", "", "", ""],
  });

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    className: "",
    modality: "",
    questions: [createEmptyQuestion()],
  });

  // Convert backend data into frontend format.
  const formatAssessments = (data) => {
    return data.map((item) => ({
      dbId: item.id,
      id: item.assessment_code,
      title: item.title,
      subject: item.subject,
      className: item.class_name,
      questions: item.total_questions,
      modality:
        item.modality === "omr"
          ? "OMR / Image"
          : item.modality === "speech"
          ? "Speech"
          : item.modality === "sign_language"
          ? "Sign Language"
          : item.modality === "mcq"
          ? "MCQ"
          : item.modality.toUpperCase(),
      status:
        item.status.toLowerCase() === "active"
          ? "Published"
          : item.status.charAt(0).toUpperCase() +
            item.status.slice(1),
    }));
  };

  // Fetch assessments from FastAPI.
  const fetchAssessments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAssessments();
      setAssessments(formatAssessments(data));
    } catch (err) {
      console.error("Error fetching assessments:", err);
      setError(err.message || "Could not fetch assessments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  // Basic field changes.
  const handleBasicChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Question changes.
  const handleQuestionChange = (questionId, value) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((question) =>
        question.id === questionId
          ? { ...question, question: value }
          : question
      ),
    }));
  };

  // Correct answer changes.
  const handleCorrectAnswerChange = (questionId, value) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((question) =>
        question.id === questionId
          ? { ...question, correctAnswer: value }
          : question
      ),
    }));
  };

  // Options changes.
  const handleOptionChange = (questionId, optionIndex, value) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        const updatedOptions = [...question.options];
        updatedOptions[optionIndex] = value;

        return {
          ...question,
          options: updatedOptions,
        };
      }),
    }));
  };

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, createEmptyQuestion()],
    }));
  };

  const removeQuestion = (questionId) => {
    if (formData.questions.length === 1) {
      alert("An assessment must contain at least one question.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter(
        (question) => question.id !== questionId
      ),
    }));
  };

  // Generate assessment code.
  const getNextAssessmentId = () => {
    const numbers = assessments
      .map((assessment) => {
        const match = assessment.id?.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter((number) => !Number.isNaN(number));

    const nextNumber =
      numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

    return `ASM${String(nextNumber).padStart(3, "0")}`;
  };

  // Reset form.
  const resetForm = () => {
    setFormData({
      title: "",
      subject: "",
      className: "",
      modality: "",
      questions: [createEmptyQuestion()],
    });
  };

  const isChoiceBased =
    formData.modality === "MCQ" ||
    formData.modality === "OMR / Image";

  // Create assessment and save to database.
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    if (!formData.modality) {
      alert("Please select an answer modality.");
      return;
    }

    for (let i = 0; i < formData.questions.length; i++) {
      const question = formData.questions[i];

      if (!question.question.trim()) {
        alert(`Please enter Question ${i + 1}.`);
        return;
      }

      if (isChoiceBased) {
        if (question.options.some((option) => !option.trim())) {
          alert(`Please complete all options for Question ${i + 1}.`);
          return;
        }

        if (!question.correctAnswer.trim()) {
          alert(`Please select the correct answer for Question ${i + 1}.`);
          return;
        }

        if (!question.options.includes(question.correctAnswer)) {
          alert(`Please select a valid answer for Question ${i + 1}.`);
          return;
        }
      } else if (!question.correctAnswer.trim()) {
        alert(`Please enter the expected answer for Question ${i + 1}.`);
        return;
      }
    }

    const modalityMap = {
      "OMR / Image": "omr",
      Speech: "speech",
      "Sign Language": "sign_language",
      MCQ: "mcq",
    };

    const assessmentPayload = {
      assessment_code: getNextAssessmentId(),
      title: formData.title.trim(),
      subject: formData.subject.trim(),
      class_name: formData.className.trim(),
      description: "",
      modality: modalityMap[formData.modality],
      status: "draft",

      questions: formData.questions.map((question, index) => ({
        question_number: index + 1,
        question_text: question.question.trim(),
        question_type: isChoiceBased ? "mcq" : "descriptive",
        options: isChoiceBased
          ? JSON.stringify(
              question.options.map((option) => option.trim())
            )
          : JSON.stringify([]),
        correct_answer: question.correctAnswer.trim(),
        marks: 1,
      })),
    };

    try {
      setSubmitting(true);
      setError("");

      const result = await createAssessment(assessmentPayload);

      await fetchAssessments();

      alert(
        `Assessment ${result.assessment_code} created successfully!\n\nStatus: Draft\n\nClick Publish when you want students to access it.`
      );

      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error("Error creating assessment:", err);
      setError(err.message || "Could not create assessment.");
      alert(`Could not create assessment: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Publish assessment.
  const handlePublish = async (assessment) => {
    const confirmed = window.confirm(
      `Publish "${assessment.title}"?\n\nStudents will be able to see and start this assessment.`
    );

    if (!confirmed) return;

    try {
      setPublishingId(assessment.dbId);
      setError("");

      await publishAssessment(assessment.dbId);

      await fetchAssessments();

      alert(
        `${assessment.title} published successfully!\n\nStudents can now access it from their dashboard.`
      );
    } catch (err) {
      console.error("Error publishing assessment:", err);

      setError(err.message || "Could not publish assessment.");

      alert(`Publishing failed: ${err.message}`);
    } finally {
      setPublishingId(null);
    }
  };

  // Copy student test link.
  const handleCopyLink = async (assessment) => {
    const studentLink = `${window.location.origin}/student/test/${assessment.dbId}`;

    try {
      await navigator.clipboard.writeText(studentLink);

      alert(`Student assessment link copied!\n\n${studentLink}`);
    } catch (err) {
      alert(
        `Student assessment link:\n\n${studentLink}\n\nCopy this link manually.`
      );
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Assessments</h1>
          <p>Create, publish and manage learner assessments</p>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={() => {
            if (showForm) resetForm();
            setShowForm((prev) => !prev);
          }}
          disabled={submitting}
        >
          {showForm ? "Close Form" : "+ Create Assessment"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="assessment-error">
          {error}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="assessment-form-card">
          <div className="form-card-header">
            <div>
              <h2>Create New Assessment</h2>
              <p>
                Configure the assessment and define its questions.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="section-title">
              <h3>Assessment Details</h3>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="title">Assessment Title</label>
                <input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleBasicChange}
                  placeholder="e.g. Science - Human Body"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleBasicChange}
                  placeholder="e.g. Science"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="className">Class</label>
                <input
                  id="className"
                  name="className"
                  value={formData.className}
                  onChange={handleBasicChange}
                  placeholder="e.g. Class 7"
                  required
                />
              </div>
            </div>

            <div className="section-title modality-title">
              <h3>Answer Modality</h3>
              <p>Choose how students will provide answers.</p>
            </div>

            <div className="modality-options">
              {[
                ["OMR / Image", "🖼️ OMR / Image", "Student uploads a completed OMR sheet."],
                ["Speech", "🎤 Speech", "Student gives a spoken answer."],
                ["Sign Language", "🤟 Sign Language", "Student provides a sign-language response."],
                ["MCQ", "📝 MCQ", "Student selects one answer."],
              ].map(([value, label, description]) => (
                <label
                  key={value}
                  className={`modality-option ${
                    formData.modality === value ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="modality"
                    value={value}
                    checked={formData.modality === value}
                    onChange={handleBasicChange}
                    required={value === "OMR / Image"}
                  />

                  <div>
                    <strong>{label}</strong>
                    <span>{description}</span>
                  </div>
                </label>
              ))}
            </div>

            {/* Questions */}
            <div className="questions-section">
              <div className="questions-header">
                <div>
                  <h3>Questions</h3>
                  <p>{formData.questions.length} question(s) added</p>
                </div>

                <button
                  type="button"
                  className="add-question-button"
                  onClick={addQuestion}
                  disabled={submitting}
                >
                  + Add Question
                </button>
              </div>

              {formData.questions.map((question, index) => (
                <div className="question-builder" key={question.id}>
                  <div className="question-builder-header">
                    <h4>Question {index + 1}</h4>

                    {formData.questions.length > 1 && (
                      <button
                        type="button"
                        className="remove-question-button"
                        onClick={() => removeQuestion(question.id)}
                        disabled={submitting}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor={`question-${question.id}`}>
                      Question Text
                    </label>

                    <textarea
                      id={`question-${question.id}`}
                      value={question.question}
                      onChange={(e) =>
                        handleQuestionChange(question.id, e.target.value)
                      }
                      placeholder="Enter the question"
                      rows="3"
                      required
                    />
                  </div>

                  {isChoiceBased ? (
                    <div className="choice-question-area">
                      <label className="question-label">
                        Answer Options
                      </label>

                      <div className="options-list">
                        {question.options.map((option, optionIndex) => (
                          <div
                            className="option-input-row"
                            key={optionIndex}
                          >
                            <span className="option-letter">
                              {String.fromCharCode(65 + optionIndex)}
                            </span>

                            <input
                              value={option}
                              onChange={(e) =>
                                handleOptionChange(
                                  question.id,
                                  optionIndex,
                                  e.target.value
                                )
                              }
                              placeholder={`Option ${String.fromCharCode(
                                65 + optionIndex
                              )}`}
                              required
                            />
                          </div>
                        ))}
                      </div>

                      <div className="form-group correct-answer-group">
                        <label htmlFor={`correct-${question.id}`}>
                          Correct Answer
                        </label>

                        <select
                          id={`correct-${question.id}`}
                          value={question.correctAnswer}
                          onChange={(e) =>
                            handleCorrectAnswerChange(
                              question.id,
                              e.target.value
                            )
                          }
                          required
                        >
                          <option value="">Select correct answer</option>

                          {question.options.map((option, optionIndex) => (
                            <option
                              key={optionIndex}
                              value={option}
                              disabled={!option.trim()}
                            >
                              {String.fromCharCode(65 + optionIndex)} - {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="form-group correct-answer-group">
                      <label htmlFor={`answer-${question.id}`}>
                        Expected Answer
                      </label>

                      <textarea
                        id={`answer-${question.id}`}
                        value={question.correctAnswer}
                        onChange={(e) =>
                          handleCorrectAnswerChange(
                            question.id,
                            e.target.value
                          )
                        }
                        placeholder="Enter expected answer"
                        rows="3"
                        required
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Create Assessment"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assessments Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Assessment ID</th>
              <th>Title</th>
              <th>Subject</th>
              <th>Class</th>
              <th>Questions</th>
              <th>Modality</th>
              <th>Status</th>
              <th>Student Access</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9">Loading assessments...</td>
              </tr>
            ) : error && assessments.length === 0 ? (
              <tr>
                <td colSpan="9">Error: {error}</td>
              </tr>
            ) : assessments.length === 0 ? (
              <tr>
                <td colSpan="9">No assessments found.</td>
              </tr>
            ) : (
              assessments.map((assessment) => (
                <tr key={assessment.dbId}>
                  <td>{assessment.id}</td>
                  <td>{assessment.title}</td>
                  <td>{assessment.subject}</td>
                  <td>{assessment.className}</td>
                  <td>{assessment.questions}</td>
                  <td>{assessment.modality}</td>

                  <td>
                    <span
                      className={`assessment-status ${
                        assessment.status.toLowerCase()
                      }`}
                    >
                      {assessment.status}
                    </span>
                  </td>

                  <td>
                    {assessment.status === "Published" ? (
                      <button
                        type="button"
                        className="student-link-button"
                        onClick={() => handleCopyLink(assessment)}
                      >
                        Copy Student Link
                      </button>
                    ) : (
                      <span>Not available yet</span>
                    )}
                  </td>

                  <td>
                    {assessment.status === "Draft" ? (
                      <button
                        type="button"
                        className="publish-button"
                        onClick={() => handlePublish(assessment)}
                        disabled={publishingId === assessment.dbId}
                      >
                        {publishingId === assessment.dbId
                          ? "Publishing..."
                          : "Publish"}
                      </button>
                    ) : (
                      <span className="published-label">
                        Published ✓
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Assessments;
