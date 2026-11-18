
const API_BASE_URL = "http://127.0.0.1:8000";

// Get the saved access token
const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
};

// Common API response handler
const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.detail || `Request failed (${response.status})`
    );
  }

  return data;
};

// LOGIN USER
export const loginUser = async (loginData) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  });

  return handleResponse(response);
};

// GET ALL ASSESSMENTS

export const getAssessments = async () => {
  const response = await fetch(`${API_BASE_URL}/assessments/`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
    },
  });

  return handleResponse(response);
};


// GET ONE ASSESSMENT
export const getAssessment = async (assessmentId) => {
  const response = await fetch(
    `${API_BASE_URL}/assessments/${assessmentId}`,
    {
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  return handleResponse(response);
};


// START ASSESSMENT
export const startAssessment = async (assessmentId) => {
  const response = await fetch(
    `${API_BASE_URL}/assessments/${assessmentId}/start`,
    {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  return handleResponse(response);
};

// CREATE ASSESSMENT
export const createAssessment = async (assessmentData) => {
  const response = await fetch(`${API_BASE_URL}/assessments/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(assessmentData),
  });

  return handleResponse(response);
};

// PUBLISH ASSESSMENT
export const publishAssessment = async (assessmentId) => {
  const response = await fetch(
    `${API_BASE_URL}/assessments/${assessmentId}/publish`,
    {
      method: "PATCH",
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  return handleResponse(response);
};



export const submitAssessment = async (submissionData) => {
  const response = await fetch(`${API_BASE_URL}/submissions/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(submissionData),
  });

  return handleResponse(response);
};


// ==========================================
// GET TEACHER DASHBOARD STATISTICS
// ==========================================
export const getTeacherDashboard = async () => {
  const response = await fetch(`${API_BASE_URL}/teacher/dashboard`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
    },
  });

  return handleResponse(response);
};


// ==========================================
// GET STUDENT RESULTS FOR TEACHER
// ==========================================
export const getTeacherResults = async () => {
  const response = await fetch(`${API_BASE_URL}/teacher/results`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
    },
  });

  return handleResponse(response);
};



/* ==========================================
   GET TEACHER STUDENTS
========================================== */

export const getTeacherStudents = async () => {
  const response = await fetch(`${API_BASE_URL}/teacher/students`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
    },
  });

  return handleResponse(response);
};
