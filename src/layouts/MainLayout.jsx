import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import "../App.css";

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="app">

      {/* Mobile Header */}
      <header className="mobile-header">
        <button
          className="menu-button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          ☰
        </button>

        <div className="mobile-logo">
          <strong>AssessAI</strong>
          <span>Learner Assessment</span>
        </div>
      </header>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>

        <div className="logo">
          <h2>AssessAI</h2>
          <p>Learner Assessment</p>
        </div>

        <nav>

          <NavLink
            to="/teacher/dashboard"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
            onClick={closeSidebar}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/teacher/students"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
            onClick={closeSidebar}
          >
            Students
          </NavLink>

          <NavLink
            to="/teacher/assessments"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
            onClick={closeSidebar}
          >
            Assessments
          </NavLink>

          <NavLink
            to="/teacher/responses"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
            onClick={closeSidebar}
          >
            Responses
          </NavLink>

          <NavLink
            to="/teacher/evaluation"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
            onClick={closeSidebar}
          >
            AI Evaluation
          </NavLink>

          <NavLink
            to="/teacher/results"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
            onClick={closeSidebar}
          >
            Results
          </NavLink>

          <NavLink
            to="/teacher/reports"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
            onClick={closeSidebar}
          >
            Reports
          </NavLink>

        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item">
            Settings
          </button>
        </div>

      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>

    </div>
  );
}

export default MainLayout;