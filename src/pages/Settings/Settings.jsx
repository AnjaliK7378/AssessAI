
import { useEffect, useState } from "react";
import "./Settings.css";

const defaultSettings = {
  notifications: {
    newSubmission: true,
    aiEvaluation: true,
    teacherReview: true,
    assessmentUpdates: false,
  },
  theme: "light",
};

function getSavedSettings() {
  try {
    const saved = localStorage.getItem("assessai_settings");
    return saved ? JSON.parse(saved) : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

function getTeacherProfile() {
  const possibleKeys = ["user", "currentUser", "teacher", "user_details"];

  for (const key of possibleKeys) {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) continue;

      const parsed = JSON.parse(stored);

      if (parsed?.role === "teacher" || parsed?.user?.role === "teacher") {
        return parsed.user || parsed;
      }

      if (parsed?.full_name || parsed?.email || parsed?.subject) {
        return parsed.user || parsed;
      }
    } catch {
      // Continue checking other storage keys
    }
  }

  return {
    full_name: "Teacher",
    email: "teacher@assessai.com",
    subject: "Not specified",
  };
}

function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [settings, setSettings] = useState(getSavedSettings);
  const [profile] = useState(getTeacherProfile);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    localStorage.setItem("assessai_settings", JSON.stringify(settings));
  }, [settings]);

  // Apply selected theme
  useEffect(() => {
    document.body.classList.toggle(
      "assessai-dark-mode",
      settings.theme === "dark"
    );
  }, [settings.theme]);

  const updateNotification = (key) => {
    setSettings((previous) => ({
      ...previous,
      notifications: {
        ...previous.notifications,
        [key]: !previous.notifications[key],
      },
    }));
  };

  const changeTheme = () => {
    setSettings((previous) => ({
      ...previous,
      theme: previous.theme === "light" ? "dark" : "light",
    }));
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPasswordMessage("");

    if (
      passwordData.newPassword !== passwordData.confirmPassword
    ) {
      setPasswordMessage("New passwords do not match.");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordMessage("Password must be at least 8 characters.");
      return;
    }

    setPasswordMessage(
      "Password form validated. Connect your backend password API to apply the change."
    );

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const tabs = [
    { id: "profile", label: "My Profile", icon: "👤" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "appearance", label: "Appearance", icon: "🎨" },
    { id: "security", label: "Security", icon: "🔒" },
    { id: "about", label: "About AssessAI", icon: "ℹ️" },
  ];

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="settings-page-header">
        <div>
          <span className="settings-eyebrow">PREFERENCES & CONTROL</span>
          <h1>Settings</h1>
          <p>Manage your account, preferences and application settings.</p>
        </div>
      </div>

      <div className="settings-layout">
        {/* Settings Navigation */}
        <aside className="settings-sidebar">
          <div className="settings-sidebar-heading">
            <span>GENERAL SETTINGS</span>
          </div>

          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`settings-nav-item ${
                activeTab === tab.id ? "active" : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="settings-nav-icon">{tab.icon}</span>
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <span className="settings-nav-arrow">›</span>
              )}
            </button>
          ))}
        </aside>

        {/* Settings Content */}
        <main className="settings-content">
          {/* PROFILE */}
          {activeTab === "profile" && (
            <section className="settings-panel">
              <div className="settings-panel-header">
                <div>
                  <h2>Teacher Profile</h2>
                  <p>Your personal account information</p>
                </div>
                <span className="settings-panel-icon">👤</span>
              </div>

              <div className="settings-profile-banner">
                <div className="settings-avatar">
                  {(profile.full_name || "T")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h3>{profile.full_name || "Teacher"}</h3>
                  <p>Teacher Account</p>
                  <span className="settings-role-badge">
                    ● Active Teacher
                  </span>
                </div>
              </div>

              <div className="settings-field-grid">
                <div className="settings-field">
                  <label>Full Name</label>
                  <div className="settings-field-value">
                    {profile.full_name || "Not available"}
                  </div>
                </div>

                <div className="settings-field">
                  <label>Email Address</label>
                  <div className="settings-field-value">
                    {profile.email || "Not available"}
                  </div>
                </div>

                <div className="settings-field">
                  <label>Subject</label>
                  <div className="settings-field-value">
                    {profile.subject || "Not specified"}
                  </div>
                </div>

                <div className="settings-field">
                  <label>Account Role</label>
                  <div className="settings-field-value">
                    Teacher / Administrator
                  </div>
                </div>
              </div>

              <div className="settings-info-note">
                <span>ℹ️</span>
                Profile details are currently displayed from your saved
                login information. Profile editing can be enabled after
                connecting the backend profile API.
              </div>
            </section>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <section className="settings-panel">
              <div className="settings-panel-header">
                <div>
                  <h2>Notification Preferences</h2>
                  <p>Choose which activities you want to be notified about</p>
                </div>
                <span className="settings-panel-icon">🔔</span>
              </div>

              <div className="settings-option-list">
                <div className="settings-option">
                  <div className="settings-option-icon blue">📥</div>
                  <div className="settings-option-info">
                    <h3>New Student Submissions</h3>
                    <p>Notify when students submit their answers</p>
                  </div>
                  <button
                    className={`settings-toggle ${
                      settings.notifications.newSubmission ? "on" : ""
                    }`}
                    onClick={() => updateNotification("newSubmission")}
                    aria-label="Toggle new student submissions notifications"
                  >
                    <span />
                  </button>
                </div>

                <div className="settings-option">
                  <div className="settings-option-icon purple">🤖</div>
                  <div className="settings-option-info">
                    <h3>AI Evaluation Updates</h3>
                    <p>Notify when AI evaluation is completed</p>
                  </div>
                  <button
                    className={`settings-toggle ${
                      settings.notifications.aiEvaluation ? "on" : ""
                    }`}
                    onClick={() => updateNotification("aiEvaluation")}
                    aria-label="Toggle AI evaluation notifications"
                  >
                    <span />
                  </button>
                </div>

                <div className="settings-option">
                  <div className="settings-option-icon orange">📝</div>
                  <div className="settings-option-info">
                    <h3>Teacher Review Alerts</h3>
                    <p>Notify when an answer needs manual review</p>
                  </div>
                  <button
                    className={`settings-toggle ${
                      settings.notifications.teacherReview ? "on" : ""
                    }`}
                    onClick={() => updateNotification("teacherReview")}
                    aria-label="Toggle teacher review notifications"
                  >
                    <span />
                  </button>
                </div>

                <div className="settings-option">
                  <div className="settings-option-icon green">📚</div>
                  <div className="settings-option-info">
                    <h3>Assessment Updates</h3>
                    <p>Notify about assessment status and updates</p>
                  </div>
                  <button
                    className={`settings-toggle ${
                      settings.notifications.assessmentUpdates ? "on" : ""
                    }`}
                    onClick={() => updateNotification("assessmentUpdates")}
                    aria-label="Toggle assessment updates notifications"
                  >
                    <span />
                  </button>
                </div>
              </div>

              <div className="settings-saved-note">
                ✓ Your notification preferences are saved automatically.
              </div>
            </section>
          )}

          {/* APPEARANCE */}
          {activeTab === "appearance" && (
            <section className="settings-panel">
              <div className="settings-panel-header">
                <div>
                  <h2>Appearance</h2>
                  <p>Customize how AssessAI looks on your device</p>
                </div>
                <span className="settings-panel-icon">🎨</span>
              </div>

              <div className="settings-option">
                <div className="settings-option-icon purple">🌙</div>
                <div className="settings-option-info">
                  <h3>Dark Mode</h3>
                  <p>Switch between light and dark interface themes</p>
                </div>
                <button
                  className={`settings-toggle ${
                    settings.theme === "dark" ? "on" : ""
                  }`}
                  onClick={changeTheme}
                  aria-label="Toggle dark mode"
                >
                  <span />
                </button>
              </div>

       
<div className="settings-theme-preview">
  <h3>Theme Preview</h3>

  <div className="settings-preview-grid">
    <div
      className={`settings-theme-card ${
        settings.theme === "light" ? "selected" : ""
      }`}
      onClick={() =>
        setSettings((previous) => ({
          ...previous,
          theme: "light",
        }))
      }
    >
      <div className="theme-preview-light">
        <div />
        <div />
        <div />
      </div>

      <strong>☀️ Light</strong>

      {settings.theme === "light" && (
        <span className="theme-selected-label">Selected</span>
      )}
    </div>

    <div
      className={`settings-theme-card ${
        settings.theme === "dark" ? "selected" : ""
      }`}
      onClick={() =>
        setSettings((previous) => ({
          ...previous,
          theme: "dark",
        }))
      }
    >
      <div className="theme-preview-dark">
        <div />
        <div />
        <div />
      </div>

      <strong>🌙 Dark</strong>

      {settings.theme === "dark" && (
        <span className="theme-selected-label">Selected</span>
      )}
    </div>
  </div>
</div>


              <div className="settings-info-note">
                <span>ℹ️</span>
                Theme preference is saved automatically on this device.
              </div>
            </section>
          )}

          {/* SECURITY */}
          {activeTab === "security" && (
            <section className="settings-panel">
              <div className="settings-panel-header">
                <div>
                  <h2>Security & Password</h2>
                  <p>Manage your account password</p>
                </div>
                <span className="settings-panel-icon">🔒</span>
              </div>

              <div className="settings-security-banner">
                <span>🛡️</span>
                <div>
                  <h3>Account Security</h3>
                  <p>
                    Keep your account secure by using a strong,
                    unique password.
                  </p>
                </div>
              </div>

              <form
                className="settings-password-form"
                onSubmit={handlePasswordChange}
              >
                <div className="settings-field">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div className="settings-field">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Enter new password"
                    minLength={8}
                    required
                  />
                </div>

                <div className="settings-field">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Confirm new password"
                    minLength={8}
                    required
                  />
                </div>

                <button type="submit" className="settings-save-password">
                  Validate Password Change
                </button>

                {passwordMessage && (
                  <div className="settings-password-message">
                    {passwordMessage}
                  </div>
                )}
              </form>

              <div className="settings-info-note">
                <span>⚠️</span>
                Password changes are not yet connected to the backend.
                This form currently performs frontend validation only.
              </div>
            </section>
          )}

          {/* ABOUT */}
          {activeTab === "about" && (
            <section className="settings-panel">
              <div className="settings-panel-header">
                <div>
                  <h2>About AssessAI</h2>
                  <p>Project information and platform details</p>
                </div>
                <span className="settings-panel-icon">ℹ️</span>
              </div>

              <div className="settings-about-banner">
                <div className="settings-about-logo">AI</div>
                <h2>AssessAI</h2>
                <p>Intelligent & Inclusive Learner Assessment</p>
                <span>Major Project · B.Tech Computer Engineering</span>
              </div>

              <div className="settings-about-grid">
                <div>
                  <span>Platform</span>
                  <strong>Web-based Assessment System</strong>
                </div>

                <div>
                  <span>Frontend</span>
                  <strong>React + Vite</strong>
                </div>

                <div>
                  <span>Backend</span>
                  <strong>FastAPI + Python</strong>
                </div>

                <div>
                  <span>Evaluation Modes</span>
                  <strong>OMR · Speech · Sign Language</strong>
                </div>
              </div>

              <div className="settings-about-description">
                AssessAI is an intelligent learner assessment platform
                designed to evaluate student responses across multiple
                input modalities. It combines AI-based evaluation,
                confidence-driven routing and teacher review to support
                accessible and inclusive assessment.
              </div>

              <div className="settings-about-footer">
                <span>Designed for inclusive education</span>
                <span>AssessAI © 2026</span>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default Settings;
