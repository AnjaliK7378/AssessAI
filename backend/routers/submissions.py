import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import Assessment, Question, Submission, AssessmentAttempt
from schemas import SubmissionCreate, SubmissionResponse
from dependencies import get_current_user


router = APIRouter(
    prefix="/submissions",
    tags=["Submissions"],
)


@router.post(
    "/",
    response_model=SubmissionResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_assessment(
    submission_data: SubmissionCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Only students can submit assessments
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=403,
            detail="Only students can submit assessments.",
        )

    student = current_user["user"]

    # Find the assessment
    assessment = db.query(Assessment).filter(
        Assessment.id == submission_data.assessment_id,
        Assessment.status == "active",
        Assessment.class_name == student.class_name,
    ).first()

    if not assessment:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found or unavailable.",
        )

    # Prevent duplicate submissions
    existing_submission = db.query(Submission).filter(
        Submission.student_id == student.id,
        Submission.assessment_id == assessment.id,
    ).first()

    if existing_submission:
        raise HTTPException(
            status_code=409,
            detail="You have already submitted this assessment.",
        )

    # Check student's assessment attempt
    attempt = db.query(AssessmentAttempt).filter(
        AssessmentAttempt.student_id == student.id,
        AssessmentAttempt.assessment_id == assessment.id,
    ).first()

    if not attempt:
        raise HTTPException(
            status_code=403,
            detail="You must start the assessment before submitting.",
        )

    if attempt.status != "in_progress":
        raise HTTPException(
            status_code=403,
            detail="Your assessment attempt is no longer active.",
        )

    # Check assessment deadline
    now = datetime.now(timezone.utc)
    expires_at = attempt.expires_at

    # Handle timezone-naive datetime if necessary
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if now >= expires_at:
        attempt.status = "expired"
        db.commit()

        raise HTTPException(
            status_code=403,
            detail="Assessment time has expired. Submission is not allowed.",
        )

    # Fetch assessment questions
    questions = db.query(Question).filter(
        Question.assessment_id == assessment.id
    ).all()

    if not questions:
        raise HTTPException(
            status_code=400,
            detail="Assessment contains no questions.",
        )

    # Validate submitted question IDs
    question_ids = {str(question.id) for question in questions}

    for submitted_question_id in submission_data.answers:
        if submitted_question_id not in question_ids:
            raise HTTPException(
                status_code=400,
                detail="Invalid question ID in submitted answers.",
            )

    # Require answers to all questions for MCQ assessments
    if assessment.modality.lower() == "mcq":
        unanswered = question_ids - set(submission_data.answers.keys())

        if unanswered:
            raise HTTPException(
                status_code=400,
                detail="Please answer all questions before submitting.",
            )

    # Evaluate MCQ answers
    score = 0.0
    total_marks = sum(question.marks for question in questions)

    if assessment.modality.lower() == "mcq":
        for question in questions:
            student_answer = submission_data.answers.get(
                str(question.id), ""
            )

            correct_answer = question.correct_answer or ""

            if student_answer.strip().casefold() == correct_answer.strip().casefold():
                score += question.marks

        submission_status = "evaluated"

    else:
        # AI evaluation will be connected later
        submission_status = "submitted"

    # Store answers as JSON text
    answers_json = json.dumps(submission_data.answers)

    new_submission = Submission(
        student_id=student.id,
        assessment_id=assessment.id,
        answers=answers_json,
        score=score if assessment.modality.lower() == "mcq" else None,
        total_marks=total_marks,
        status=submission_status,
    )

    # Complete attempt and save submission together
    try:
        db.add(new_submission)

        attempt.status = "completed"
        attempt.completed_at = now

        db.commit()
        db.refresh(new_submission)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Unable to save submission.",
        )

    return new_submission