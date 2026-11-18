
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!role) {
      setError("Please select Teacher or Student.");
      return;
    }

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      // Send login request to FastAPI
      const data = await loginUser({
        email: email.trim(),
        password,
        role,
      });

      console.log("Login response keys:", Object.keys(data));
      console.log("Access token received:", !!data.access_token);
      console.log("Token type:", typeof data.access_token);
      console.log("User data received:", !!data.user);
      console.log("Role received:", data.role);

      // Save authentication information
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.role);
      // Verify returned role
      if (data.role !== role) {
        throw new Error("The selected role does not match your account.");
      }

      // Navigate according to account role
      if (data.role === "teacher") {
        navigate("/teacher/dashboard");
      } else if (data.role === "student") {
        navigate("/student/dashboard");
      } else {
        throw new Error("Invalid account role.");
      }

    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-header">
          <h1>AssessAI</h1>
          <p>Learner Assessment System</p>
        </div>

        <div className="login-title">
          <h2>Welcome Back</h2>
          <p>Select your account type to continue</p>
        </div>

        {/* Role Selection */}
        <div className="role-selection">

          <button
            type="button"
            className={`role-card ${
              role === "teacher" ? "selected" : ""
            }`}
            onClick={() => setRole("teacher")}
          >
            <div className="role-icon">👨‍🏫</div>
            <strong>Teacher</strong>
            <span>Manage assessments</span>
          </button>

          <button
            type="button"
            className={`role-card ${
              role === "student" ? "selected" : ""
            }`}
            onClick={() => setRole("student")}
          >
            <div className="role-icon">👨‍🎓</div>
            <strong>Student</strong>
            <span>Take assessments</span>
          </button>

        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>

          <label>Email Address</label>

          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

      </div>
    </div>
  );
}

export default Login;
