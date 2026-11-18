from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Assessment, Submission, AssessmentAttempt
from dependencies import get_current_user


router = APIRouter(
    prefix="/student",
    tags=["Student Dashboard"],
)


@router.get("/dashboard")
def get_student_dashboard(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Only students can access this dashboard
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=403,
            detail="Only students can access this dashboard.",
        )

    student = current_user["user"]

    # Fetch active assessments for the student's class
    assessments = db.query(Assessment).filter(
        Assessment.class_name == student.class_name,
        Assessment.status == "active",
    ).all()

    # Fetch student's submissions
    submissions = db.query(Submission).filter(
        Submission.student_id == student.id
    ).all()

    # Fetch student's attempts
    attempts = db.query(AssessmentAttempt).filter(
        AssessmentAttempt.student_id == student.id
    ).all()

    # Assessment IDs already submitted
    submitted_assessment_ids = {
        submission.assessment_id
        for submission in submissions
    }

    # Map attempts by assessment ID
    attempt_map = {
        attempt.assessment_id: attempt
        for attempt in attempts
    }

    available_assessments = []
    in_progress_assessments = []

    # Categorize assessments
    for assessment in assessments:

        # Skip already submitted assessments
        if assessment.id in submitted_assessment_ids:
            continue

        attempt = attempt_map.get(assessment.id)

        # Assessment currently in progress
        if attempt and attempt.status == "in_progress":

            in_progress_assessments.append({
                "assessment_id": assessment.id,
                "title": assessment.title,
                "subject": assessment.subject,
                "attempt_id": attempt.id,
                "expires_at": attempt.expires_at,
                "status": attempt.status,
            })

        # Assessment not started yet
        elif not attempt:

            available_assessments.append({
                "assessment_id": assessment.id,
                "title": assessment.title,
                "subject": assessment.subject,
                "modality": assessment.modality,
                "total_questions": assessment.total_questions,
                "status": assessment.status,
            })

    # Completed tests count
    completed_count = len(submissions)

    # Calculate average percentage from evaluated submissions
    evaluated_submissions = [
        submission
        for submission in submissions
        if submission.score is not None
        and submission.total_marks > 0
    ]

    average_score = (
        round(
            sum(
                (submission.score / submission.total_marks) * 100
                for submission in evaluated_submissions
            ) / len(evaluated_submissions),
            2,
        )
        if evaluated_submissions
        else 0
    )

    # Fetch recent submissions
    recent_submissions = (
        db.query(Submission, Assessment)
        .join(
            Assessment,
            Submission.assessment_id == Assessment.id,
        )
        .filter(Submission.student_id == student.id)
        .order_by(Submission.submitted_at.desc())
        .limit(5)
        .all()
    )

    recent_results = []

    for submission, assessment in recent_submissions:

        recent_results.append({
            "assessment_id": assessment.id,
            "title": assessment.title,
            "subject": assessment.subject,
            "score": submission.score,
            "total_marks": submission.total_marks,
            "status": submission.status,
            "submitted_at": submission.submitted_at,
        })

    # Dashboard response
    return {
        "student_name": student.full_name,
        "class_name": student.class_name,

        "available_tests": len(available_assessments),
        "completed_tests": completed_count,
        "in_progress_tests": len(in_progress_assessments),
        "average_score": average_score,

        "available_assessments": available_assessments,
        "in_progress_assessments": in_progress_assessments,
        "recent_results": recent_results,
    }