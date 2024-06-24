import React from 'react';
import './PrintComponent.css'; // Import the CSS file

const PrintComponent = React.forwardRef(({ students }, ref) => {
  return (
    <div ref={ref} className="printable-content">
      <header className="print-header">
        <h2>Registered Students</h2>
      </header>
      <table className="print-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Student ID</th>
            <th>Student Name</th>
            <th>Contact No.</th>
            <th>Email</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={student.id}>
              <td>{index + 1}</td>
              <td>{student.student_id}</td>
              <td>{`${student.firstName} ${student.lastName}`}</td>
              <td>{student.contactNumber}</td>
              <td>{student.email}</td>
              <td>{student.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <footer className="print-footer">
        <p>&copy; 2024 Nursing Portal. All rights reserved.</p>
      </footer>
    </div>
  );
});

export default PrintComponent;
