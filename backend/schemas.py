
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# -------------------------
# Question Schemas
# -------------------------

class QuestionCreate(BaseModel):
    question_number: int = Field(gt=0)
    question_text: str = Field(min_length=1)
    question_type: str = "descriptive"
    options: Optional[str] = None
    correct_answer: Optional[str] = None
    marks: float = Field(default=1.0, gt=0)


class QuestionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    assessment_id: int
    question_number: int
    question_text: str
    question_type: str
    options: Optional[str] = None
    correct_answer: Optional[str] = None
    marks: float


# -------------------------
# Assessment Schemas
# -------------------------

class AssessmentCreate(BaseModel):
    assessment_code: str = Field(min_length=1, max_length=20)
    title: str = Field(min_length=1, max_length=200)
    subject: str = Field(min_length=1, max_length=100)
    class_name: str = Field(min_length=1, max_length=50)
    description: Optional[str] = None

    modality: str
    status: str = "draft"

    questions: list[QuestionCreate] = Field(default_factory=list)


class AssessmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    assessment_code: str
    title: str
    subject: str
    class_name: str
    description: Optional[str] = None
    modality: str
    status: str
    total_questions: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    questions: list[QuestionResponse] = Field(default_factory=list)



# -------------------------
# AUTHENTICATION SCHEMAS
# -------------------------

from pydantic import EmailStr


class TeacherRegister(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    subject: Optional[str] = None


class StudentRegister(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    class_name: str = Field(min_length=1, max_length=50)
    roll_number: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)
    role: str


class AuthResponse(BaseModel):
    message: str
    access_token: str
    token_type: str
    role: str
    user: dict
