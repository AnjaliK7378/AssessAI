
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import Teacher, Student, Assessment, Submission
from dependencies import require_teacher

router = APIRouter(
    prefix="/teacher",
    tags=["Teacher Results"],
)


# ==========================================
# TEACHER DASHBOARD STATISTICS
# ==========================================

@router.get("/dashboard")
def get_teacher_dashboard(
    current_user: dict = Depends(require_teacher),
    db: Session = Depends(get_db),
):

    teacher_id = current_user["id"]

    # Assessments created by this teacher
    total_assessments = db.query(Assessment).filter(
        Assessment.teacher_id == teacher_id
    ).count()

    # Submissions belonging only to this teacher's assessments
    submissions_query = (
        db.query(Submission)
        .join(
            Assessment,
            Submission.assessment_id == Assessment.id
        )
        .filter(
            Assessment.teacher_id == teacher_id
        )
    )

    total_submissions = submissions_query.count()

    evaluated_submissions = submissions_query.filter(
        Submission.status == "evaluated"
    ).count()

    pending_submissions = submissions_query.filter(
        Submission.status != "evaluated"
    ).count()

    # Calculate average percentage from evaluated submissions
    evaluated_results = submissions_query.filter(
        Submission.status == "evaluated",
        Submission.score.isnot(None),
        Submission.total_marks > 0,
    ).all()

    if evaluated_results:
        average_score_percentage = round(
            sum(
                (submission.score / submission.total_marks) * 100
                for submission in evaluated_results
            ) / len(evaluated_results),
            2,
        )
    else:
        average_score_percentage = 0

    # Count unique students who submitted to this teacher
    total_students = (
        db.query(func.count(func.distinct(Submission.student_id)))
        .join(
            Assessment,
            Submission.assessment_id == Assessment.id
        )
        .filter(
            Assessment.teacher_id == teacher_id
        )
        .scalar()
    )

    return {
        "total_students": total_students or 0,
        "total_assessments": total_assessments,
        "total_submissions": total_submissions,
        "evaluated_submissions": evaluated_submissions,
        "pending_submissions": pending_submissions,
        "average_score_percentage": average_score_percentage,
    }


# ==========================================
# ALL STUDENT RESULTS
# ==========================================

@router.get("/results")
def get_teacher_results(
    current_user: dict = Depends(require_teacher),
    db: Session = Depends(get_db),
):

    teacher_id = current_user["id"]

    results = (
        db.query(
            Submission.id.label("submission_id"),
            Student.id.label("student_id"),
            Student.full_name.label("student_name"),
            Student.class_name.label("class_name"),
            Student.roll_number.label("roll_number"),
            Assessment.id.label("assessment_id"),
            Assessment.title.label("assessment_title"),
            Assessment.subject.label("subject"),
            Assessment.modality.label("modality"),
            Submission.score.label("score"),
            Submission.total_marks.label("total_marks"),
            Submission.status.label("status"),
            Submission.submitted_at.label("submitted_at"),
        )
        .join(
            Student,
            Submission.student_id == Student.id
        )
        .join(
            Assessment,
            Submission.assessment_id == Assessment.id
        )
        .filter(
            Assessment.teacher_id == teacher_id
        )
        .order_by(
            Submission.submitted_at.desc()
        )
        .all()
    )

    return [
        {
            "submission_id": row.submission_id,
            "student_id": row.student_id,
            "student_name": row.student_name,
            "class_name": row.class_name,
            "roll_number": row.roll_number,
            "assessment_id": row.assessment_id,
            "assessment_title": row.assessment_title,
            "subject": row.subject,
            "modality": row.modality,
            "score": row.score,
            "total_marks": row.total_marks,
            "status": row.status,
            "submitted_at": row.submitted_at,
        }
        for row in results
    ]



# ==========================================
# ALL STUDENTS FOR TEACHER
# ==========================================

@router.get("/students")
def get_teacher_students(
    current_user: dict = Depends(require_teacher),
    db: Session = Depends(get_db),
):

    teacher_id = current_user["id"]

    assessment_count = (
        db.query(func.count(Submission.id))
        .join(
            Assessment,
            Submission.assessment_id == Assessment.id,
        )
        .filter(
            Submission.student_id == Student.id,
            Assessment.teacher_id == teacher_id,
        )
        .correlate(Student)
        .scalar_subquery()
    )

    students = (
        db.query(
            Student.id,
            Student.full_name,
            Student.email,
            Student.class_name,
            Student.roll_number,
            Student.created_at,
            assessment_count.label("assessment_count"),
        )
        .order_by(Student.id.asc())
        .all()
    )

    return [
        {
            "id": student.id,
            "full_name": student.full_name,
            "email": student.email,
            "class_name": student.class_name,
            "roll_number": student.roll_number,
            "created_at": student.created_at,
            "assessment_count": student.assessment_count or 0,
        }
        for student in students
    ]
