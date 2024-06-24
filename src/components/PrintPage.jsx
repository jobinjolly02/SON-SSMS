import React from 'react';

const PrintPage = ({ student }) => {
    const formatDOB = (dob) => {
        const date = new Date(dob);
        const day = date.getDate();
        const monthNames = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
        const monthIndex = date.getMonth();
        const year = date.getFullYear();
        const ordinal = (day > 3 && day < 21) ? 'th' : (day % 10 === 1) ? 'st' : (day % 10 === 2) ? 'nd' : (day % 10 === 3) ? 'rd' : 'th';
        return `${day}${ordinal} ${monthNames[monthIndex]} ${year}`;
    };

    const class10SubjectsArray = student.class10Subjects ? student.class10Subjects.split(',') : [];
    const class10MarksArray = student.class10Marks ? student.class10Marks.split(',') : [];
    const class12SubjectsArray = student.class12Subjects ? student.class12Subjects.split(',') : [];
    const class12MarksArray = student.class12Marks ? student.class12Marks.split(',') : [];

    return (
        <div className="print-page">
            <h1>Student Details</h1>
            <img src={student.studentPhoto ? `${process.env.REACT_APP_SERVER_URL}/uploads/${encodeURIComponent(student.studentPhoto)}` : './noimage.jpg'} alt="Student Photo" />
            <div><strong>Student ID:</strong> {`SON/24-25/${String(student.id).padStart(5, '0')}`}</div>
            <div><strong>Full Name:</strong> {`${student.firstName} ${student.lastName}`}</div>
            <div><strong>Email:</strong> {student.email}</div>
            <div><strong>Date of Birth:</strong> {formatDOB(student.dob)}</div>
            <div><strong>Marital Status:</strong> {student.maritalStatus}</div>
            <div><strong>Father's Name:</strong> {`${student.fathersFirstName} ${student.fathersLastName}`}</div>
            <div><strong>Father's Occupation:</strong> {student.fathersOccupation}</div>
            <div><strong>Mother's Name:</strong> {`${student.mothersFirstName} ${student.mothersLastName}`}</div>
            <div><strong>Mother's Occupation:</strong> {student.mothersOccupation}</div>
            <div><strong>Contact Number:</strong> {student.contactNumber}</div>
            <div><strong>Address:</strong> {`${student.presentAddressLine1}, ${student.presentCity}, ${student.presentState}, ${student.presentCountry}`}</div>
            <div><strong>Correspondence Address:</strong> {`${student.correspondenceAddressLine1}, ${student.correspondenceCity}, ${student.correspondenceState}, ${student.correspondenceCountry}`}</div>
            <div><strong>Guardian Name:</strong> {student.guardianName}</div>
            <div><strong>Guardian Relationship:</strong> {student.guardianRelationship}</div>
            <div><strong>Guardian Contact Number:</strong> {student.guardianContactNumber}</div>
            <div><strong>Guardian Residential Address:</strong> {student.guardianResidentialAddress}</div>
            <div><strong>Guardian Official Address:</strong> {student.guardianOfficialAddress}</div>
            <div><strong>Religion:</strong> {student.religion}</div>
            <div><strong>Nationality:</strong> {student.nationality}</div>
            <div><strong>Transaction ID:</strong> {student.transactionId}</div>
            <div style={{marginTop: '20px'}}>
                <strong>Class 10 Details:</strong>
                <table>
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
            <div><strong>Class 10 Percentage:</strong> {student.class10Percentage}</div>
            <div><strong>Class 12 Details:</strong>
                <table>
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
                    </tbody>
                </table>
            </div>
            <div><strong>Class 12 Percentage:</strong> {student.class12Percentage}</div>
        </div>
    );
};

export default PrintPage;
