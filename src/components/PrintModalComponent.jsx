import React from 'react';
import './PrintModalComponent.css'; // Import the CSS file

const PrintModalComponent = React.forwardRef(({ student }, ref) => {
  const class10SubjectsArray = student.class10Subjects ? student.class10Subjects.split(',') : [];
  const class10MarksArray = student.class10Marks ? student.class10Marks.split(',') : [];
  const class12SubjectsArray = student.class12Subjects ? student.class12Subjects.split(',') : [];
  const class12MarksArray = student.class12Marks ? student.class12Marks.split(',') : [];

  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1:  return "st";
      case 2:  return "nd";
      case 3:  return "rd";
      default: return "th";
    }
  };
  
  const formatDOB = (dob) => {
    const date = new Date(dob);
    const day = date.getDate();
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
  
    return `${day}${getOrdinalSuffix(day)} ${monthNames[monthIndex]} ${year}`;
  };

  return (
    <div ref={ref} className="printable-modal-content">
      <header className="print-header">
        <h1>Nursing Portal</h1>
        <h2>Student Detailed Information</h2>
      </header>
      <div className="student-photo-container">
        <img 
          src={student.studentPhoto ? `http://192.168.0.111:3001/uploads/${encodeURIComponent(student.studentPhoto)}` : './noimage.jpg'} 
          alt="Student Photo"
          className="student-photo"
          onError={(e) => { e.target.onerror = null; e.target.src='./noimage.jpg'; }}
        />
        <div className="student-id" style={{ fontWeight: 'bold', color: 'red' }}>
          {`SON/24-25/${String(student.id).padStart(5, '0')}`}
        </div>
      </div>
      <table className="print-table">
        <tbody>
          <tr>
            <th>Full Name:</th>
            <td>{`${student.firstName} ${student.lastName}`}</td>
          </tr>
          <tr>
            <th>Email:</th>
            <td>{student.email}</td>
          </tr>
          <tr>
            <th>Date of Birth:</th>
            <td>{formatDOB(student.dob)}</td>
          </tr>
          <tr>
            <th>Marital Status:</th>
            <td>{student.maritalStatus}</td>
          </tr>
          <tr>
            <th>Father's Name:</th>
            <td>{`${student.fathersFirstName} ${student.fathersLastName}`}</td>
          </tr>
          <tr>
            <th>Father's Occupation:</th>
            <td>{student.fathersOccupation}</td>
          </tr>
          <tr>
            <th>Mother's Name:</th>
            <td>{`${student.mothersFirstName} ${student.mothersLastName}`}</td>
          </tr>
          <tr>
            <th>Mother's Occupation:</th>
            <td>{student.mothersOccupation}</td>
          </tr>
          <tr>
            <th>Contact Number:</th>
            <td>{student.contactNumber}</td>
          </tr>
          <tr>
            <th>Address:</th>
            <td>{`${student.presentAddressLine1}, ${student.presentCity}, ${student.presentState}, ${student.presentCountry}`}</td>
          </tr>
          <tr>
            <th>Correspondence Address:</th>
            <td>{`${student.correspondenceAddressLine1}, ${student.correspondenceCity}, ${student.correspondenceState}, ${student.correspondenceCountry}`}</td>
          </tr>
          {student.guardianName && (
            <>
              <tr>
                <th>Guardian Name:</th>
                <td>{student.guardianName}</td>
              </tr>
              <tr>
                <th>Guardian Relationship:</th>
                <td>{student.guardianRelationship}</td>
              </tr>
              <tr>
                <th>Guardian Contact Number:</th>
                <td>{student.guardianContactNumber}</td>
              </tr>
              <tr>
                <th>Guardian Residential Address:</th>
                <td>{student.guardianResidentialAddress}</td>
              </tr>
              <tr>
                <th>Guardian Official Address:</th>
                <td>{student.guardianOfficialAddress}</td>
              </tr>
            </>
          )}
          <tr>
            <th>Religion:</th>
            <td>{student.religion}</td>
          </tr>
          <tr>
            <th>Nationality:</th>
            <td>{student.nationality}</td>
          </tr>
          <tr>
            <th>Transaction ID:</th>
            <td>{student.transactionId}</td>
          </tr>
          <tr>
            <th>Class 10 Percentage:</th>
            <td>{student.class10Percentage}</td>
          </tr>
          <tr>
            <th>Class 12 Percentage:</th>
            <td>{student.class12Percentage}</td>
          </tr>
          <tr>
            <th>Any Academic/Sports Distinction:</th>
            <td>{student.academicSportsDistinction}</td>
          </tr>
        </tbody>
      </table>
      <div className="detail-section">
        <h3>Class 10 Details:</h3>
        <table className="education-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Marks</th>
            </tr>
          </thead>
          <tbody>
            {class10SubjectsArray.map((subject, index) => (
              <tr key={`class10-subject-${index}`}>
                <td>{subject.trim()}</td>
                <td>{class10MarksArray[index] ? class10MarksArray[index].trim() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="detail-section">
        <h3>Class 12 Details:</h3>
        <table className="education-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Marks</th>
            </tr>
          </thead>
          <tbody>
            {class12SubjectsArray.map((subject, index) => (
              <tr key={`class12-subject-${index}`}>
                <td>{subject.trim()}</td>
                <td>{class12MarksArray[index] ? class12MarksArray[index].trim() : 'N/A'}</td>
              </tr>
            ))}
            <tr>
              <td>{student.additionalSubject ? student.additionalSubject.trim() : 'Additional Subject'}</td>
              <td>{student.additionalSubjectMarks ? student.additionalSubjectMarks.trim() : 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="detail-row">
        <div className="detail-key">Nursing Status:</div>
        <div className="detail-value">{student.status}</div>
      </div>
      <div className="detail-row">
        <div className="detail-key">Finance Status:</div>
        <div className="detail-value">{student.finance_status}</div>
      </div>
      <footer className="print-footer">
        <p>&copy; 2024 Nursing Portal. All rights reserved.</p>
      </footer>
    </div>
  );
});

export default PrintModalComponent;
