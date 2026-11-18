
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database import get_db
from models import Assessment, Question, AssessmentAttempt
from schemas import AssessmentCreate, AssessmentResponse
from dependencies import get_current_user, require_teacher

from datetime import datetime, timedelta, timezone

router = APIRouter(
    prefix="/assessments",
    tags=["Assessments"],
)


# CREATE assessment - Teacher only
@router.post(
    "/",
    response_model=AssessmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_assessment(
    assessment_data: AssessmentCreate,
    current_user: dict = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    new_assessment = Assessment(
        assessment_code=assessment_data.assessment_code,
        title=assessment_data.title,
        subject=assessment_data.subject,
        class_name=assessment_data.class_name,
        description=assessment_data.description,
        modality=assessment_data.modality,
        status="draft",
        duration_minutes=assessment_data.duration_minutes,
        start_time=assessment_data.start_time,
        end_time=assessment_data.end_time,

        # Automatically identify the logged-in teacher
        teacher_id=current_user["id"],

        total_questions=len(assessment_data.questions),
        questions=[
            Question(**question.model_dump())
            for question in assessment_data.questions
        ],
    )

    try:
        db.add(new_assessment)
        db.commit()
        db.refresh(new_assessment)
        return new_assessment

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Assessment code already exists.",
        )


# GET assessments
@router.get("/", response_model=list[AssessmentResponse])
def get_assessments(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Assessment)

    if current_user["role"] == "teacher":

        # Teacher sees only their own assessments
        query = query.filter(
            Assessment.teacher_id == current_user["id"]
        )

    else:

        # Student sees only published assessments
        # assigned to their class
        student = current_user["user"]

        query = query.filter(
            Assessment.status == "active",
            Assessment.class_name == student.class_name,
        )

    return query.order_by(Assessment.id.desc()).all()


# GET one assessment
@router.get("/{assessment_id}", response_model=AssessmentResponse)
def get_assessment(
    assessment_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Assessment).filter(
        Assessment.id == assessment_id
    )

    if current_user["role"] == "teacher":
        query = query.filter(
            Assessment.teacher_id == current_user["id"]
        )

    else:
        student = current_user["user"]

        query = query.filter(
            Assessment.status == "active",
            Assessment.class_name == student.class_name,
        )

    assessment = query.first()

    if assessment is None:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found or access denied.",
        )

    return assessment


# PUBLISH assessment - Owner teacher only
@router.patch(
    "/{assessment_id}/publish",
    response_model=AssessmentResponse,
)
def publish_assessment(
    assessment_id: int,
    current_user: dict = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    assessment = db.query(Assessment).filter(
        Assessment.id == assessment_id,
        Assessment.teacher_id == current_user["id"],
    ).first()

    if assessment is None:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found or you do not own it.",
        )

    if assessment.status == "active":
        raise HTTPException(
            status_code=400,
            detail="Assessment is already published.",
        )

    if assessment.status == "completed":
        raise HTTPException(
            status_code=400,
            detail="Completed assessment cannot be published.",
        )

    if assessment.total_questions <= 0:
        raise HTTPException(
            status_code=400,
            detail="Assessment must contain at least one question.",
        )

    assessment.status = "active"

    db.commit()
    db.refresh(assessment)

    return assessment

# -------------------------
# START ASSESSMENT
# -------------------------

@router.post("/{assessment_id}/start")
def start_assessment(
    assessment_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=403,
            detail="Only students can start assessments.",
        )

    student = current_user["user"]

    assessment = db.query(Assessment).filter(
        Assessment.id == assessment_id,
        Assessment.status == "active",
        Assessment.class_name == student.class_name,
    ).first()

    if not assessment:
        raise HTTPException(
            status_code=404,
            detail="Assessment unavailable.",
        )

    now = datetime.now(timezone.utc)

    # Check assessment opening time
    if assessment.start_time and now < assessment.start_time:
        raise HTTPException(
            status_code=403,
            detail="Assessment has not started yet.",
        )

    # Check assessment closing time
    if assessment.end_time and now >= assessment.end_time:
        raise HTTPException(
            status_code=403,
            detail="Assessment deadline has passed.",
        )

    # Find existing attempt
    attempt = db.query(AssessmentAttempt).filter(
        AssessmentAttempt.student_id == student.id,
        AssessmentAttempt.assessment_id == assessment.id,
    ).first()

    # If the student already has an active attempt
    if attempt and attempt.status == "in_progress":

        remaining_seconds = max(
            0,
            int((attempt.expires_at - now).total_seconds()),
        )

        # Continue the existing attempt if time remains
        if remaining_seconds > 0:
            return {
                "message": "Existing attempt retrieved.",
                "attempt_id": attempt.id,
                "status": attempt.status,
                "started_at": attempt.started_at,
                "expires_at": attempt.expires_at,
                "remaining_seconds": remaining_seconds,
            }

        # Mark expired if time is over
        attempt.status = "expired"
        db.commit()

    # Prevent restarting already submitted assessments
    if attempt and attempt.status in ["submitted", "evaluated", "completed"]:
        raise HTTPException(
            status_code=409,
            detail="You have already completed this assessment.",
        )

    # Calculate new attempt expiry
    expires_at = now + timedelta(minutes=assessment.duration_minutes)

    # Reuse the existing attempt record if one exists
    if attempt:
        attempt.started_at = now
        attempt.expires_at = expires_at
        attempt.status = "in_progress"

        db.commit()
        db.refresh(attempt)

        return {
            "message": "Assessment restarted successfully.",
            "attempt_id": attempt.id,
            "status": attempt.status,
            "started_at": attempt.started_at,
            "expires_at": attempt.expires_at,
            "remaining_seconds": max(
                0,
                int((attempt.expires_at - now).total_seconds()),
            ),
        }

    # Create a new attempt if no previous attempt exists
    new_attempt = AssessmentAttempt(
        student_id=student.id,
        assessment_id=assessment.id,
        started_at=now,
        expires_at=expires_at,
        status="in_progress",
    )

    db.add(new_attempt)
    db.commit()
    db.refresh(new_attempt)

    return {
        "message": "Assessment started successfully.",
        "attempt_id": new_attempt.id,
        "status": new_attempt.status,
        "started_at": new_attempt.started_at,
        "expires_at": new_attempt.expires_at,
        "remaining_seconds": max(
            0,
            int((new_attempt.expires_at - now).total_seconds()),
        ),
    }


# -------------------------
# GET ASSESSMENT ATTEMPT
# -------------------------

@router.get("/{assessment_id}/attempt")
def get_assessment_attempt(
    assessment_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Only students can access attempts.")

    student = current_user["user"]

    attempt = db.query(AssessmentAttempt).filter(
        AssessmentAttempt.student_id == student.id,
        AssessmentAttempt.assessment_id == assessment_id,
    ).first()

    if not attempt:
        raise HTTPException(status_code=404, detail="No attempt found.")

    now = datetime.now(timezone.utc)

    remaining_seconds = max(
        0, int((attempt.expires_at - now).total_seconds())
    )

    # Automatically mark expired attempts
    if remaining_seconds == 0 and attempt.status == "in_progress":
        attempt.status = "expired"
        db.commit()

    return {
        "attempt_id": attempt.id,
        "assessment_id": assessment_id,
        "status": attempt.status,
        "started_at": attempt.started_at,
        "expires_at": attempt.expires_at,
        "remaining_seconds": remaining_seconds,
    }