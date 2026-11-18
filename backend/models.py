
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship

from database import Base


# -------------------------
# TEACHER MODEL
# -------------------------

class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)

    subject = Column(String(100), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    assessments = relationship(
        "Assessment",
        back_populates="teacher",
    )


# -------------------------
# STUDENT MODEL
# -------------------------

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)

    class_name = Column(String(50), nullable=False)
    roll_number = Column(String(30), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


# -------------------------
# ASSESSMENT MODEL
# -------------------------

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)

    assessment_code = Column(String(20), unique=True, nullable=False, index=True)
    title = Column(String(200), nullable=False)
    subject = Column(String(100), nullable=False)
    class_name = Column(String(50), nullable=False)

    description = Column(Text, nullable=True)

    modality = Column(String(30), nullable=False)
    status = Column(String(20), default="draft", nullable=False)

    total_questions = Column(Integer, default=0, nullable=False)

    # Assessment timing settings
    duration_minutes = Column(Integer, default=30, nullable=False)

    start_time = Column(DateTime(timezone=True), nullable=True)
    end_time = Column(DateTime(timezone=True), nullable=True)

    # Teacher who created this assessment
    teacher_id = Column(
        Integer,
        ForeignKey("teachers.id"),
        nullable=True,
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    teacher = relationship(
        "Teacher",
        back_populates="assessments",
    )

    questions = relationship(
        "Question",
        back_populates="assessment",
        cascade="all, delete-orphan",
        order_by="Question.question_number",
    )

# -------------------------
# QUESTION MODEL
# -------------------------

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)

    assessment_id = Column(
        Integer,
        ForeignKey("assessments.id", ondelete="CASCADE"),
        nullable=False,
    )

    question_number = Column(Integer, nullable=False)
    question_text = Column(Text, nullable=False)

    question_type = Column(String(30), default="descriptive")

    options = Column(Text, nullable=True)
    correct_answer = Column(Text, nullable=True)
    marks = Column(Float, default=1.0, nullable=False)

    assessment = relationship(
        "Assessment",
        back_populates="questions",
    )

    __table_args__ = (
        UniqueConstraint(
            "assessment_id",
            "question_number",
            name="uq_assessment_question_number",
        ),
    )

    
# -------------------------
# SUBMISSION MODEL
# -------------------------

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(
        Integer,
        ForeignKey("students.id"),
        nullable=False,
        index=True,
    )

    assessment_id = Column(
        Integer,
        ForeignKey("assessments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Student answers stored as JSON
    answers = Column(Text, nullable=False)

    score = Column(Float, nullable=True)
    total_marks = Column(Float, nullable=False)

    status = Column(
        String(20),
        default="submitted",
        nullable=False,
    )

    submitted_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint(
            "student_id",
            "assessment_id",
            name="uq_student_assessment_submission",
        ),
    )


# -------------------------
# ASSESSMENT ATTEMPT MODEL
# -------------------------

class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(
        Integer,
        ForeignKey("students.id"),
        nullable=False,
        index=True,
    )

    assessment_id = Column(
        Integer,
        ForeignKey("assessments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    started_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    expires_at = Column(
        DateTime(timezone=True),
        nullable=False,
    )

    status = Column(
        String(20),
        default="in_progress",
        nullable=False,
    )

    completed_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    __table_args__ = (
        UniqueConstraint(
            "student_id",
            "assessment_id",
            name="uq_student_assessment_attempt",
        ),
    )