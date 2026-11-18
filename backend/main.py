
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from database import engine, Base
import models
from routers import assessments, auth, submissions, student_dashboard


# Create database tables if they do not exist
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="AssessAI API",
    description="Backend API for the AssessAI multimodal learner assessment system",
    version="1.0.0",
)


# CORS configuration for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register assessment API routes
app.include_router(assessments.router)
app.include_router(auth.router)
app.include_router(submissions.router)
app.include_router(student_dashboard.router)

@app.get("/")
def root():
    return {"message": "AssessAI backend is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/db-check")
def database_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "success",
            "database": "PostgreSQL connected successfully"
        }

    except SQLAlchemyError:
        raise HTTPException(
            status_code=503,
            detail="PostgreSQL database connection failed. Check your configuration."
        )
