function Students() {
  return (
    <div>
      <header className="topbar">
        <div>
          <h1>Students</h1>
          <p>Manage and monitor learner information</p>
        </div>

        <button className="primary-button">
          + Add Student
        </button>
      </header>

      <section className="dashboard-card">
        <div className="card-header">
          <h3>Student List</h3>

          <input
            type="text"
            placeholder="Search students..."
            className="search-input"
          />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Class</th>
                <th>Assessments</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>STU001</td>
                <td>Rahul Patil</td>
                <td>Class 8</td>
                <td>5</td>
                <td>
                  <span className="status completed">Active</span>
                </td>
              </tr>

              <tr>
                <td>STU002</td>
                <td>Priya Sharma</td>
                <td>Class 8</td>
                <td>4</td>
                <td>
                  <span className="status completed">Active</span>
                </td>
              </tr>

              <tr>
                <td>STU003</td>
                <td>Amit Joshi</td>
                <td>Class 7</td>
                <td>3</td>
                <td>
                  <span className="status ongoing">Active</span>
                </td>
              </tr>

              <tr>
                <td>STU004</td>
                <td>Neha Kulkarni</td>
                <td>Class 7</td>
                <td>2</td>
                <td>
                  <span className="status pending">Pending</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Students;