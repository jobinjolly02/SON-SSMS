import React, { useEffect, useRef } from 'react';
import './NursingPage.css';
import quitIcon from "../assets/remove.png";

const ApplicationPreviewModal = ({ formData, isOpen, onClose }) => {
  const modalRef = useRef();

  useEffect(() => {
    const modalElement = modalRef.current;
    if (modalElement) {
      modalElement.style.transition = 'transform 0.3s ease-out';
      modalElement.style.transform = 'scale(1)';
    }
  }, [isOpen]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDOB = (dob) => {
    const date = new Date(dob);
    const day = date.getDate();
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const monthIndex = date.getMonth();
    const year = date.getFullYear();

    return `${day} ${monthNames[monthIndex]} ${year}`;
  };

  const class10SubjectsArray = formData.class10Subjects || [];
  const class10MarksArray = formData.class10Marks || [];
  const class12SubjectsArray = formData.class12Subjects || [];
  const class12MarksArray = formData.class12Marks || [];
  const additionalSubject = formData.additionalSubject || 'Additional Subject';
  const additionalSubjectMarks = formData.additionalSubjectMarks || 'N/A';

  return (
    isOpen && (
      <div className="modal-backdrop open" onClick={handleBackdropClick}>
        <div className="modal-content" ref={modalRef}>
          <img
            src={quitIcon}
            onClick={onClose}
            alt="Close"
            className="remove-image-button"
          />
          <h2 className="modal-title">Application Preview</h2>
          <div className="modal-body">
            
            <div className="details-container">
              <div className="detail-row">
                <div className="detail-key">First Name:</div>
                <div className="detail-value">{formData.firstName}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Last Name:</div>
                <div className="detail-value">{formData.lastName}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Contact Number:</div>
                <div className="detail-value">{formData.contactNumber}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Email:</div>
                <div className="detail-value">{formData.email}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Gender:</div>
                <div className="detail-value">{formData.gender}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Father's First Name:</div>
                <div className="detail-value">{formData.fathersFirstName}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Father's Last Name:</div>
                <div className="detail-value">{formData.fathersLastName}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Father's Occupation:</div>
                <div className="detail-value">{formData.fathersOccupation}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Mother's First Name:</div>
                <div className="detail-value">{formData.mothersFirstName}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Mother's Last Name:</div>
                <div className="detail-value">{formData.mothersLastName}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Mother's Occupation:</div>
                <div className="detail-value">{formData.mothersOccupation}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Present Address Line 1:</div>
                <div className="detail-value">{formData.presentAddressLine1}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Present Address Line 2:</div>
                <div className="detail-value">{formData.presentAddressLine2}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Present City:</div>
                <div className="detail-value">{formData.presentCity}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Present State:</div>
                <div className="detail-value">{formData.presentState}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Present Postal Code:</div>
                <div className="detail-value">{formData.presentPostalCode}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Present Country:</div>
                <div className="detail-value">{formData.presentCountry}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Correspondence Address Line 1:</div>
                <div className="detail-value">{formData.correspondenceAddressLine1}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Correspondence Address Line 2:</div>
                <div className="detail-value">{formData.correspondenceAddressLine2}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Correspondence City:</div>
                <div className="detail-value">{formData.correspondenceCity}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Correspondence State:</div>
                <div className="detail-value">{formData.correspondenceState}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Correspondence Postal Code:</div>
                <div className="detail-value">{formData.correspondencePostalCode}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Correspondence Country:</div>
                <div className="detail-value">{formData.correspondenceCountry}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Guardian Name:</div>
                <div className="detail-value">{formData.guardianName}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Guardian Relationship:</div>
                <div className="detail-value">{formData.guardianRelationship}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Guardian Contact Number:</div>
                <div className="detail-value">{formData.guardianContactNumber}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Guardian Residential Address:</div>
                <div className="detail-value">{formData.guardianResidentialAddress}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Guardian Official Address:</div>
                <div className="detail-value">{formData.guardianOfficialAddress}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Religion:</div>
                <div className="detail-value">{formData.religion}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Category:</div>
                <div className="detail-value">{formData.category}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Nationality:</div>
                <div className="detail-value">{formData.nationality}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Date of Birth:</div>
                <div className="detail-value">{formatDOB(formData.dob)}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Class 10 School Name:</div>
                <div className="detail-value">{formData.class10SchoolName}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Class 10 Board Name:</div>
                <div className="detail-value">{formData.class10BoardName}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Class 10 Year:</div>
                <div className="detail-value">{formData.class10Year}</div>
              </div>
              <div className="detail-row" style={{ flexDirection: 'column' }}>
                <div className="detail-key">Class 10 Subjects:</div>
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
                        <td>{subject}</td>
                        <td>{class10MarksArray[index]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="detail-row">
                <div className="detail-key">Class 10 Percentage:</div>
                <div className="detail-value">{formData.class10Percentage}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Class 12 School Name:</div>
                <div className="detail-value">{formData.class12SchoolName}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Class 12 Board Name:</div>
                <div className="detail-value">{formData.class12BoardName}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Class 12 Year:</div>
                <div className="detail-value">{formData.class12Year}</div>
              </div>
              <div className="detail-row" style={{ flexDirection: 'column' }}>
                <div className="detail-key">Class 12 Subjects:</div>
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
                        <td>{subject}</td>
                        <td>{class12MarksArray[index]}</td>
                      </tr>
                    ))}
                    <tr>
                      <td>{additionalSubject}</td>
                      <td>{additionalSubjectMarks}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="detail-row">
                <div className="detail-key">Class 12 Percentage:</div>
                <div className="detail-value">{formData.class12Percentage}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Academic/Sports Distinction:</div>
                <div className="detail-value">{formData.academicSportsDistinction}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default ApplicationPreviewModal;
