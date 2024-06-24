import React, { useEffect, useRef } from 'react';
import './NursingPage.css';
import PrintModalComponent from './PrintModalComponent';
import quitIcon from "../assets/remove.png";
import { useReactToPrint } from 'react-to-print';

const Modal = ({ student, onClose, showSendAdmitCardButton }) => {
  const modalRef = useRef();
  const printRef = useRef();

  useEffect(() => {
    const modalElement = modalRef.current;
    if (modalElement) {
      modalElement.style.transition = 'transform 0.3s ease-out';
      modalElement.style.transform = 'scale(1)';
    }
  }, []);

  const downloadAdmitCard = () => {
    const studentIdString = String(student.id);
    const numericId = studentIdString.split('/').pop();
    const trimmedNumericId = parseInt(numericId, 10);

    const url = `http://192.168.0.111:3001/uploads/${trimmedNumericId}.pdf`;
    window.open(url);
  };

  const sendAdmitCard = async () => {
    try {
      const response = await fetch('http://192.168.0.111:3001/update-and-send-admit-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId: student.id,
          status: 'APPROVED',
          remarks: 'Your admit card is now available.'
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
      } else {
        alert('Failed to send admit card. Please check server logs for more details.');
      }
    } catch (error) {
      console.error('Failed to send request:', error);
      alert('Error when attempting to send admit card. Please check network connectivity.');
    }
  };

  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  const formatDOB = (dob) => {
    const date = new Date(dob);
    const day = date.getDate();
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const monthIndex = date.getMonth();
    const year = date.getFullYear();

    return `${day}${getOrdinalSuffix(day)} ${monthNames[monthIndex]} ${year}`;
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const class10SubjectsArray = student.class10Subjects ? student.class10Subjects.split(',') : [];
  const class10MarksArray = student.class10Marks ? student.class10Marks.split(',') : [];
  const class12SubjectsArray = student.class12Subjects ? student.class12Subjects.split(',') : [];
  const class12MarksArray = student.class12Marks ? student.class12Marks.split(',') : [];
  const otherSubject = student.otherSubject;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content" ref={modalRef}>
        <img
          src={quitIcon}
          onClick={onClose}
          alt="Remove"
          className="remove-image-button"
        />
        <h2 className="modal-title">Student Detailed Information</h2>
        <div className="modal-body">
          <div className="student-photo-container">
            <img
              src={student.studentPhoto ? `http://192.168.0.111:3001/uploads/${encodeURIComponent(student.studentPhoto)}` : './noimage.jpg'}
              alt="Student Photo"
              className="student-photo"
              onError={(e) => { e.target.onerror = null; e.target.src = './noimage.jpg'; }}
            />
            <div className="student-id" style={{ fontWeight: 'bold', color: 'red' }}>
              {`SON/24-25/${String(student.id).padStart(5, '0')}`}
            </div>
          </div>
          <div className="details-container">
            <div className="detail-row">
              <div className="detail-key">Full Name:</div>
              <div className="detail-value">{`${student.firstName} ${student.lastName}`}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Email:</div>
              <div className="detail-value">{student.email}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Date of Birth:</div>
              <div className="detail-value">{formatDOB(student.dob)}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Marital Status:</div>
              <div className="detail-value" style={{ color: student.maritalStatus === 'Married' ? 'red' : 'inherit' }}>
                {student.maritalStatus}
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Father's Name:</div>
              <div className="detail-value">{`${student.fathersFirstName} ${student.fathersLastName}`}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Father's Occupation:</div>
              <div className="detail-value">{student.fathersOccupation}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Mother's Name:</div>
              <div className="detail-value">{`${student.mothersFirstName} ${student.mothersLastName}`}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Mother's Occupation:</div>
              <div className="detail-value">{student.mothersOccupation}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Contact Number:</div>
              <div className="detail-value">{student.contactNumber}</div>
            </div>
            <div className="detail-row">
                <div className="detail-key">Address:</div>
                <div className="detail-value">
                  {`${student.presentAddressLine1}, ${student.presentCity}, ${student.presentState}, ${student.presentCountry}`}
                </div>
              </div>
              {student.correspondenceAddressLine1 && student.correspondenceCity && student.correspondenceState && student.correspondenceCountry && (
                <div className="detail-row">
                  <div className="detail-key">Correspondence Address:</div>
                  <div className="detail-value">
                    {`${student.correspondenceAddressLine1}, ${student.correspondenceCity}, ${student.correspondenceState}, ${student.correspondenceCountry}`}
                  </div>
                </div>
              )}
            {student.guardianName && (
              <>
                <div className="detail-row">
                  <div className="detail-key">Guardian Name:</div>
                  <div className="detail-value">{student.guardianName}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-key">Guardian Relationship:</div>
                  <div className="detail-value">{student.guardianRelationship}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-key">Guardian Contact Number:</div>
                  <div className="detail-value">{student.guardianContactNumber}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-key">Guardian Residential Address:</div>
                  <div className="detail-value">{student.guardianResidentialAddress}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-key">Guardian Official Address:</div>
                  <div className="detail-value">{student.guardianOfficialAddress}</div>
                </div>
              </>
            )}
            <div className="detail-row">
              <div className="detail-key">Religion:</div>
              <div className="detail-value">{student.religion}</div>
            </div>
            <div className="detail-row">
                <div className="detail-key">Category:</div>
                <div className="detail-value">
                  {student.category}
                </div>
              </div>
            <div className="detail-row">
              <div className="detail-key">Nationality:</div>
              <div className="detail-value">{student.nationality}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Transaction ID:</div>
              <div className="detail-value">{student.transactionId}</div>
            </div>
            <div className="detail-row" style={{ flexDirection: 'column' }}>
              <div className="detail-key">Class 10 Details:</div>
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
            <div className="detail-row">
              <div className="detail-key">Class 10 Percentage:</div>
              <div className="detail-value">{student.class10Percentage}</div>
            </div>
            <div className="detail-value">
              {student.class10Certificate ? (
                <a
                  href={`http://192.168.0.111:3001/uploads/${encodeURIComponent(student.class10Certificate)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className='class10no'
                  style={{ fontSize: '15px' }}
                  download>
                  Download Class 10 Certificate
                </a>
              ) : (
                <span>No file available</span>
              )}
            </div>
            <br />
            <div className="detail-row" style={{ flexDirection: 'column' }}>
              <div className="detail-key">Class 12 Details:</div>
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
                  <td>{index === 4 && subject.trim() === "other" ? otherSubject : subject.trim()}</td>
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
              <div className="detail-key">Class 12 Percentage:</div>
              <div className="detail-value">{student.class12Percentage}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Any Academic/Sports Distinction:</div>
              <div className="detail-value">{student.academicSportsDistinction}</div>
            </div>
            <div className="detail-value">
              {student.class12MarkSheet ? (
                <a
                  href={`http://192.168.0.111:3001/uploads/${encodeURIComponent(student.class12MarkSheet)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className='class12no'
                  style={{ fontSize: '15px' }}
                  download>
                  Download Class 12 Marksheet
                </a>
              ) : (
                <span>No file available</span>
              )}
            </div>
            <br/>
            <div className="detail-row">
              <div className="detail-key">Nursing Status:</div>
              <div className="detail-value">{student.status}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Finance Status:</div>
              <div className="detail-value">{student.finance_status}</div>
            </div>
            <div className="modal-footer">
              <div className="admit-card-button" onClick={downloadAdmitCard} style={{ cursor: 'pointer', display: 'none' }}>
                <div className="admit-card-button-wrapper">
                  <div className="admit-card-text">Download Admit Card</div>
                  <span className="admit-card-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="2em" height="2em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
                      <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"></path>
                    </svg>
                  </span>
                </div>
              </div>
              {showSendAdmitCardButton && student.status === 'APPROVED' && (
                <button onClick={sendAdmitCard} className="send-button" style={{ cursor: 'pointer' }}>Send Admit Card</button>
              )}
            </div>
            <button onClick={handlePrint} className="print-button print-btn">
              <span className="printer-wrapper">
                <span className="printer-container">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 92 75">
                    <path
                      stroke-width="5"
                      stroke="black"
                      d="M12 37.5H80C85.2467 37.5 89.5 41.7533 89.5 47V69C89.5 70.933 87.933 72.5 86 72.5H6C4.067 72.5 2.5 70.933 2.5 69V47C2.5 41.7533 6.75329 37.5 12 37.5Z"
                    ></path>
                    <mask fill="white" id="path-2-inside-1_30_7">
                      <path
                        d="M12 12C12 5.37258 17.3726 0 24 0H57C70.2548 0 81 10.7452 81 24V29H12V12Z"
                      ></path>
                    </mask>
                    <path
                      mask="url(#path-2-inside-1_30_7)"
                      fill="black"
                      d="M7 12C7 2.61116 14.6112 -5 24 -5H57C73.0163 -5 86 7.98374 86 24H76C76 13.5066 67.4934 5 57 5H24C20.134 5 17 8.13401 17 12H7ZM81 29H12H81ZM7 29V12C7 2.61116 14.6112 -5 24 -5V5C20.134 5 17 8.13401 17 12V29H7ZM57 -5C73.0163 -5 86 7.98374 86 24V29H76V24C76 13.5066 67.4934 5 57 5V-5Z"
                    ></path>
                    <circle fill="black" r="3" cy="49" cx="78"></circle>
                  </svg>
                </span>
                <span className="printer-page-wrapper">
                  <span className="printer-page"></span>
                </span>
              </span>
              Print
            </button>
          </div>
          <div style={{ display: 'none' }}>
            <PrintModalComponent ref={printRef} student={student} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
