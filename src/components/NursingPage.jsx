import React, { useState, useEffect, useRef } from 'react';
import NavBar from './NavBar';
import './NursingPage.css';
import ExportToExcel from './ExportToExcel'; 
import Dashboard from './Dashboard';
import { useApprovedStudents } from './ApprovedStudentsContext';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort } from '@fortawesome/free-solid-svg-icons';
import Footer from './Footer';
import Modal from './Modal';
import PrintComponent from './PrintComponent'; 
import { useReactToPrint } from 'react-to-print'; 

const NursingPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [studentStatuses, setStudentStatuses] = useState({});
  const [studentFinanceStatuses, setStudentFinanceStatuses] = useState({});
  const [sortAscending, setSortAscending] = useState(false); 
  const [sortField, setSortField] = useState('student_id'); // Set default sort field
  const [statusFilter, setStatusFilter] = useState('ALL'); 
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(50);
  const [actionType, setActionType] = useState('parallel');
  const printRef = useRef(); 

  
  useEffect(() => {
    const fetchStudentApplications = async () => {
      try {
        const response = await axios.get('http://192.168.0.111:3001/get-applications');
        const data = response.data.map(student => ({
          ...student,
          finance_status: student.finance_status || 'PENDING',
          status: student.status || 'PENDING'  
        }));
        setSubmissions(data);
        setFilteredSubmissions(data);
        setStudentFinanceStatuses(data.reduce((acc, student) => ({
          ...acc,
          [student.id]: student.finance_status
        }), {}));
      } catch (error) {
        console.error('Error fetching applications:', error);
      }
    };
    fetchStudentApplications();
  }, []);  

  // Fetch the action type from the server when the component mounts
  useEffect(() => {
    const fetchActionType = async () => {
      try {
        const response = await axios.get('http://192.168.0.111:3001/get-action-matrix');
        if (response.data.actionType) {
          setActionType(response.data.actionType.toLowerCase());
        }
      } catch (error) {
        console.error('Error fetching action type:', error);
      }
    };
    fetchActionType();
  }, []);

  useEffect(() => {
    let filtered = submissions.filter(student => {
      const term = searchTerm.toLowerCase();
      const matchesName = student.firstName.toLowerCase().includes(term) || student.lastName.toLowerCase().includes(term);
      const matchesId = student.student_id && student.student_id.toString().toLowerCase().includes(term);
      return matchesName || matchesId;
    });
  
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(student => {
        if (statusFilter === 'PENDING') {
          return !['APPROVED', 'REJECTED'].includes(student.status);
        } else if (statusFilter === 'FINANCE_PENDING') {
          return student.finance_status === 'PENDING' && ['APPROVED', 'REJECTED'].includes(student.status);
        } else {
          return student.status === statusFilter;
        }
      });
    }
  
    filtered.sort((a, b) => compareStudents(a, b, sortField, sortAscending));
    setFilteredSubmissions(filtered);
  }, [searchTerm, submissions, statusFilter, sortField, sortAscending]);  
  
  const handleFilter = (filter) => {
    setStatusFilter(filter);
  };

  const handleSort = (field) => {
    setFilteredSubmissions(currentFilteredSubmissions => {
      const isNewField = field !== sortField;
      const newSortAscending = isNewField ? true : !sortAscending;

      const sortedSubmissions = [...currentFilteredSubmissions].sort((a, b) =>
        compareStudents(a, b, field, newSortAscending)
      );

      setSortField(field);
      setSortAscending(newSortAscending);

      return sortedSubmissions;
    });
  };

  const compareStudents = (a, b, field, ascending) => {
    let result;
    if (field === 'student_id') {
      const idA = a.student_id ? parseInt(a.student_id.split('/').pop(), 10) : 0;
      const idB = b.student_id ? parseInt(b.student_id.split('/').pop(), 10) : 0;      
      result = idA - idB;
    } else if (field === 'status') {
      const getStatusPriority = (student) => {
        if (student.status === 'APPROVED' && student.finance_status === 'APPROVED') {
          return 1; // Highest priority
        } else if (student.status === 'APPROVED' && student.finance_status === 'PENDING') {
          return 2; 
        } else if (student.status === 'APPROVED' && student.finance_status === 'REJECTED') {
          return 3;
        } else if (student.status === 'REJECTED' && student.finance_status === 'PENDING') {
          return 4; 
        } else if (student.status === 'REJECTED' && student.finance_status === 'APPROVED') {
          return 5; 
        } else if (student.status === 'REJECTED' && student.finance_status === 'REJECTED') {
          return 6; 
        } else if (student.status === 'PENDING') {
          return 7; // Lowest priority
        } else {
          return 8; 
        }
      };
  
      const priorityA = getStatusPriority(a);
      const priorityB = getStatusPriority(b);
      result = priorityA - priorityB;
    } else {
      result = a[field].toString().toLowerCase().localeCompare(b[field].toString().toLowerCase());
    }
  
    return ascending ? result : -result;
  };
  
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredSubmissions.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredSubmissions.length / recordsPerPage);

  const handleChangeSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const displayStudentID = (student) => {
    return student.student_id || 'ID not available'; 
  };

  const handleOpenModal = (student, status) => {
    setSelectedStudent(student);
    setStatusToUpdate(status);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
    setStatusToUpdate('');
  };

  const ActionDropdown = ({ student }) => {
    const [showActions, setShowActions] = useState(false);
  
    useEffect(() => {
      if (['APPROVED', 'REJECTED'].includes(studentStatuses[student.id])) {
        setShowActions(false);
      }
    }, [studentStatuses, student.id]);
  
    return (
      (actionType === 'nursing' || actionType === 'parallel' || student.finance_status === 'APPROVED') && (
        <div className="action-dropdown">
          <button className="action-dropdown-btn" onClick={() => setShowActions(!showActions)}>Action</button>
          {showActions && (
            <div className={`action-buttons ${showActions ? 'action-buttons-showing' : ''}`}>
              <button className="btn green" onClick={() => handleOpenConfirmation(student, 'approve')}>Approve</button>
              <button className="btn red" onClick={() => handleOpenConfirmation(student, 'reject')}>Reject</button>
            </div>
          )}
        </div>
      )
    );
  };
  
  useEffect(() => {
    console.log('Student statuses updated:', studentStatuses);
  }, [studentStatuses]);
  
  const ConfirmationModal = ({ onConfirm, onCancel, action }) => {
    const [inputValue, setInputValue] = useState('');
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(action === 'reject');
    const isApproveAction = action === 'approve';
  
    const handleChange = (e) => {
      const value = e.target.value;
      setInputValue(value);
      if (action === 'reject') {
        setIsSubmitDisabled(!value.trim());
      }
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      onConfirm(inputValue); 
    };
  
    return (
      <div className="modal-backdrop-2">
        <div className="modal-content-2">
          <h2 className="confirmation-title">Confirmation</h2>
          <p className="confirmation-text">
            Are you sure you want to
            {action === 'approve' ? (
              <span style={{ fontWeight: 'bold', textTransform: 'uppercase', color: 'green' ,fontSize: 'larger'}}>
                {' approve '}
              </span>
            ) : (
              <span style={{ fontWeight: 'bold', textTransform: 'uppercase', color: 'red' ,fontSize: 'larger'}}>
                {' reject '}
              </span>
            )}
            this student?
          </p>
          <form onSubmit={handleSubmit}>
            {isApproveAction ? (
              <input
                type="text"
                placeholder="Remarks"
                value={inputValue}
                onChange={handleChange}
                className="input-remarks"
              />
            ) : (
              <input
                type="text"
                placeholder="Reason (Mandatory)"
                value={inputValue}
                onChange={handleChange}
                className="input-reason"
                required
              />
            )}
            <div className="confirmation-buttons">
              <button type="submit" className="confirmation-button yes" disabled={isSubmitDisabled}>Yes</button>
              <button type="button" className="confirmation-button no" onClick={onCancel}>No</button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  

  const handleOpenConfirmation = (student, action) => {
    const actionToPerform = studentStatuses[student.id] === 'APPROVED' && action === 'approve' 
      ? 'reject' 
      : action;

    setConfirmation({ 
      student, 
      action: actionToPerform, 
      message: actionToPerform === 'approve' 
        ? 'Are you sure you want to approve this student?' 
        : 'Are you sure you want to reject this student?'
    });
  };

  const { addApprovedStudent } = useApprovedStudents();

  const handleConfirmAction = async (inputValue) => {
    const actionToPerform = confirmation.action === 'approve' ? 'APPROVED' : 'REJECTED';
    const studentId = confirmation.student.id;
    const remarksField = confirmation.action === 'approve' ? 'approve_remarks' : 'reject_reason';

    // Update UI immediately
    setConfirmation(null);
    setStudentStatuses(prevStatuses => ({
        ...prevStatuses,
        [studentId]: actionToPerform
    }));

    // Proceed with the backend operations asynchronously
    try {
        const updateSuccess = await handleStatusUpdate(studentId, actionToPerform, inputValue, remarksField);
        if (updateSuccess) {
            await fetchApplicationStatus(studentId);
            if (confirmation.action === 'approve') {
                addApprovedStudent(confirmation.student);
            }
            console.log("Update successful");
        } else {
            throw new Error('Update failed');
        }
    } catch (error) {
        setStudentStatuses(prevStatuses => ({
            ...prevStatuses,
            [studentId]: confirmation.student.status  
        }));
        console.error('Failed to update status:', error);
    }
};

const handleStatusUpdate = async (studentId, newStatus, remarks = '') => {
  try {
    const payload = { studentId, status: newStatus };
    if (newStatus === 'APPROVED') {
      payload.remarks = remarks; // changed from approve_remarks to remarks
    } else if (newStatus === 'REJECTED') {
      payload.remarks = remarks; // changed from reject_reason to remarks
    }

    const response = await axios.post('http://192.168.0.111:3001/update-and-send-admit-card', payload);

    if (response.data.status === 'success') {
      setStudentStatuses(prevStatuses => ({
        ...prevStatuses,
        [studentId]: newStatus
      }));
      return true;
    } else {
      throw new Error(response.data.message || 'An error occurred');
    }
  } catch (error) {
    console.error('Error updating status:', error);
    return false;
  }
};

const fetchApplicationStatus = async (studentId) => {
  try {
      const response = await axios.get(`http://192.168.0.111:3001/get-status/${studentId}`);
      if (response.data.status === 'success') {
          setStudentStatuses(prevStatuses => ({
              ...prevStatuses,
              [studentId]: response.data.data.status
          }));
      } else {
          throw new Error(response.data.message);
      }
  } catch (error) {
      console.error('Error fetching application status:', error);
  }
};



  const handleCancelAction = () => {
    setConfirmation(null);
  };

  const handleStatusChange = (student, currentStatus) => {
    const actionToPerform = currentStatus === 'APPROVED' ? 'reject' : 'approve';
  
    setConfirmation({
      student, 
      action: actionToPerform, 
    });
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1:  return "st";
      case 2:  return "nd";
      case 3:  return "rd";
      default: return "th";
    }
  };

  const fileName = 'students_report';
  
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
    <>
      <NavBar />
      <div className="admin-dashboard-container">
        <h1 className="welcome-message">NURSING PORTAL</h1>
        <Dashboard setStatusFilter={handleFilter} />
        <br/>
        <div className="admin-dashboard-controls">
          <input
            type="text"
            placeholder="Search by Student ID or Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            style={{width: '1800px', fontFamily: 'Matter', height: '70px', fontSize: 'larger'}}
          />
          
        </div>
        <div className="records-dropdown">
            <label htmlFor="records-per-page">Records per page:</label>
            <select
              id="records-per-page"
              value={recordsPerPage}
              onChange={(e) => setRecordsPerPage(Number(e.target.value))}
              className="records-select"
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="75">75</option>
              <option value="100">100</option>
            </select>
          </div>

        <table className="admin-dashboard-table">
        <thead>
            <tr>
              <th>S.NO</th>
              <th >
                Student ID
                <button onClick={() => handleSort('student_id')} className="sort-button">
                  <FontAwesomeIcon icon={faSort} />
                </button>
              </th>
              <th >
                Student Name
                <button onClick={() => handleSort('firstName')} className="sort-button">
                  <FontAwesomeIcon icon={faSort} />
                </button>
              </th>
              <th>Contact No.</th>
              <th>Email</th>
              <th>
                Status
                <button onClick={() => handleSort('status')} className="sort-button">
                  <FontAwesomeIcon icon={faSort} />
                </button>
                </th>
              <th>Finance Status</th>
              <th>Submission Date</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
  {currentRecords.map((student, index) => {
    const currentStatus = studentStatuses[student.id] || student.status;
    const financeStatus = studentFinanceStatuses[student.id] || 'PENDING';
    const rowClass = currentStatus === 'REJECTED' || financeStatus === 'Rejected' ? 'grayed-out' : '';
    const financeStyle = financeStatus === 'REJECTED' ? 
      { color: '#FF0000', fontFamily: 'Matter', textTransform: 'uppercase', textAlign: 'center'} :
      financeStatus === 'APPROVED' ?
      { color: '#000000', fontFamily: 'Matter', textTransform: 'uppercase', textAlign: 'center'} :
      financeStatus === 'PENDING' ?
      { color: '#0000FF', fontFamily: 'Matter', textTransform: 'uppercase', textAlign: 'center'} : {};

    // Calculate serial number based on current page and index
    const serialNumber = indexOfFirstRecord + index + 1;

    const formatDate = (date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    };
    
    const submissionDate = formatDate(new Date(student.submissionDate));
    
    return (
      <tr style={{textAlign: 'left'}} key={student.id} className={rowClass}>
        <td style={{textAlign: 'center'}}>{serialNumber}</td>
        <td style={{ fontWeight: '600'}}>{student.student_id}</td>
        <td style={{textTransform: 'uppercase'}}>{`${student.firstName} ${student.lastName}`}</td>
        <td style={{textAlign: 'center'}}>{student.contactNumber}</td>
        <td>{student.email}</td>
        <td style={{textAlign: 'center'}}>
          {currentStatus === 'APPROVED' ? (
            <button className="btn green" disabled>
              Approved
            </button>
          ) : currentStatus === 'REJECTED' ? (
            <button className="btn red" disabled>
              Rejected
            </button>
          ) : (
            <ActionDropdown student={student} />
          )}
        </td>
        <td style={financeStyle}>{financeStatus}</td>
        <td style={{textAlign: 'center'}}>{submissionDate}</td>
        <td className="view-details-container">
          <button onClick={() => handleOpenModal(student)} className="learn-more">
            <span className="circle" aria-hidden="true">
              <span className="icon arrow"></span>
            </span>
            <span className="button-text">View Details</span>
          </button>
        </td>
      </tr>
    );
  })}
</tbody>


      </table>
      <div className="pagination-controls">
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
              First
            </button>
            <button onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage === 1}>
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                disabled={currentPage === i + 1}
              >
                {i + 1}
              </button>
            ))}
            <button onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage === totalPages}>
              Next
            </button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
              Last
            </button>
          </div>
          <br/>
      <ExportToExcel fileName={'students_report'} />
      <br />
      {showModal && (
        <div className="modal-print-content">
          <Modal
            student={selectedStudent}
            statusToUpdate={statusToUpdate}
            onStatusChange={handleStatusChange}
            onClose={handleCloseModal}
          />
        </div>
      )}
      {selectedStudent && <Modal student={selectedStudent} onClose={handleCloseModal}  showSendAdmitCardButton={true} />}
        <button onClick={handlePrint} className="print-button"><span className="print-icon"></span></button>
      {confirmation && (
        <ConfirmationModal
          action={confirmation.action}
          onConfirm={handleConfirmAction}
          onCancel={handleCancelAction}
        />
      )}
    </div>
    <Footer />
      <div style={{ display: 'none' }}>
        <PrintComponent ref={printRef} students={filteredSubmissions} />
      </div>
    </>
  );
};

export default NursingPage;
