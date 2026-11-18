
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database import get_db
from models import Assessment, Question
from schemas import AssessmentCreate, AssessmentResponse
from dependencies import get_current_user, require_teacher


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
