
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError

from database import get_db
from models import Teacher, Student
from schemas import (
    TeacherRegister,
    StudentRegister,
    LoginRequest,
    AuthResponse,
)
from security import (
    hash_password,
    verify_password,
    create_access_token,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# -------------------------
# TEACHER REGISTRATION
# -------------------------

@router.post("/register/teacher", status_code=201)
def register_teacher(
    data: TeacherRegister,
    db: Session = Depends(get_db),
):
    email = data.email.lower()

    existing_teacher = db.query(Teacher).filter(
        func.lower(Teacher.email) == email
    ).first()

    existing_student = db.query(Student).filter(
        func.lower(Student.email) == email
    ).first()

    if existing_teacher or existing_student:
        raise HTTPException(
            status_code=409,
            detail="Email is already registered.",
        )

    teacher = Teacher(
        full_name=data.full_name,
        email=email,
        password_hash=hash_password(data.password),
        subject=data.subject,
    )

    try:
        db.add(teacher)
        db.commit()
        db.refresh(teacher)

        return {
            "message": "Teacher registered successfully.",
            "user": {
                "id": teacher.id,
                "full_name": teacher.full_name,
                "email": teacher.email,
                "role": "teacher",
            },
        }

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Email is already registered.",
        )


# -------------------------
# STUDENT REGISTRATION
# -------------------------

@router.post("/register/student", status_code=201)
def register_student(
    data: StudentRegister,
    db: Session = Depends(get_db),
):
    email = data.email.lower()

    existing_teacher = db.query(Teacher).filter(
        func.lower(Teacher.email) == email
    ).first()

    existing_student = db.query(Student).filter(
        func.lower(Student.email) == email
    ).first()

    if existing_teacher or existing_student:
        raise HTTPException(
            status_code=409,
            detail="Email is already registered.",
        )

    student = Student(
        full_name=data.full_name,
        email=email,
        password_hash=hash_password(data.password),
        class_name=data.class_name,
        roll_number=data.roll_number,
    )

    try:
        db.add(student)
        db.commit()
        db.refresh(student)

        return {
            "message": "Student registered successfully.",
            "user": {
                "id": student.id,
                "full_name": student.full_name,
                "email": student.email,
                "class_name": student.class_name,
                "role": "student",
            },
        }

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Email is already registered.",
        )


# -------------------------
# TEACHER / STUDENT LOGIN
# -------------------------

@router.post("/login", response_model=AuthResponse)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    role = data.role.lower()
    email = data.email.lower()

    if role == "teacher":
        user = db.query(Teacher).filter(
            func.lower(Teacher.email) == email
        ).first()

    elif role == "student":
        user = db.query(Student).filter(
            func.lower(Student.email) == email
        ).first()

    else:
        raise HTTPException(
            status_code=400,
            detail="Role must be teacher or student.",
        )

    if not user or not verify_password(
        data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    token = create_access_token({
        "sub": str(user.id),
        "role": role,
    })

    user_details = {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
    }

    if role == "teacher":
        user_details["subject"] = user.subject
    else:
        user_details["class_name"] = user.class_name
        user_details["roll_number"] = user.roll_number

    return {
        "message": "Login successful.",
        "access_token": token,
        "token_type": "bearer",
        "role": role,
        "user": user_details,
    }
