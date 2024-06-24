import React, { useState, useEffect, useRef } from 'react';
import NavBar from './NavBar';
import './NursingPage.css';
import ExportToExcel from './ExportToExcel';
import FinanceDashboard from './FinanceDashboard';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort } from '@fortawesome/free-solid-svg-icons';
import Modal from './Modal';
import Footer from './Footer';
import PrintComponent from './PrintComponent';
import { useReactToPrint } from 'react-to-print';
import './ExportToExcel.css'

const FinanceAdminPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [studentFinanceStatuses, setStudentFinanceStatuses] = useState({});
  const [sortAscending, setSortAscending] = useState(false); 
  const [sortField, setSortField] = useState('student_id'); 
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(25);
  const [actionType, setActionType] = useState('parallel');
  const printRef = useRef();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://192.168.0.111:3001/get-applications');
        const data = response.data.map(student => ({
          ...student,
          finance_status: student.finance_status || 'PENDING'
        }));
        setSubmissions(data);
        setFilteredSubmissions(data);
        setStudentFinanceStatuses(data.reduce((acc, student) => ({
          ...acc,
          [student.id]: student.finance_status
        }), {}));
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };
    fetchStudents();
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
      return student.firstName.toLowerCase().includes(term) || 
             student.lastName.toLowerCase().includes(term) ||
             student.student_id.includes(term);
    });

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(student => {
        switch (statusFilter) {
          case 'APPROVED':
            return student.status === 'APPROVED' && student.finance_status === 'APPROVED';
          case 'REJECTED':
            return student.status === 'REJECTED' || student.finance_status === 'REJECTED';
          case 'PENDING':
            return student.status === 'PENDING' || student.finance_status === 'PENDING';
          default:
            return true;
        }
      });
    }

    filtered.sort((a, b) => compareStudents(a, b, sortField, sortAscending));
    setFilteredSubmissions(filtered);
  }, [searchTerm, submissions, statusFilter, sortField, sortAscending]);

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
    if (field === 'student_id' || field === 'firstName') {
      const aField = a[field] ? a[field].toString().toLowerCase() : '';
      const bField = b[field] ? b[field].toString().toLowerCase() : '';
      result = aField.localeCompare(bField);
    } else {
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
      result = getStatusPriority(a) - getStatusPriority(b);
    }
    return ascending ? result : -result;
  };
  
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const handleChangeSearch = (e) => setSearchTerm(e.target.value);

  const handleOpenModal = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  const handleOpenConfirmation = (student, action) => {
    setConfirmation({
      student,
      action,
      message: `Are you sure you want to ${action === 'approve' ? 'approve' : 'reject'} this student?`
    });
  };

  const handleConfirmAction = async (details) => {
    const { student } = confirmation;
    const { action, reason } = details;
    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
    const financeRemarks = reason.trim();
  
    setStudentFinanceStatuses(prev => ({
      ...prev,
      [student.id]: newStatus
    }));
    setSubmissions(prev => prev.map(s => s.id === student.id ? { ...s, finance_status: newStatus } : s));
  
    setConfirmation(null);
    handleCloseModal();

    try {
      const response = await axios.post('http://192.168.0.111:3001/update-finance-status', {
        studentId: student.id,
        financeStatus: newStatus,
        financeRemarks: newStatus === 'APPROVED' ? financeRemarks : newStatus === 'REJECTED' ? financeRemarks : undefined,
      });
  
      if (response.status !== 200) {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      setStudentFinanceStatuses(prev => ({
        ...prev,
        [student.id]: student.finance_status 
      }));
      setSubmissions(prev => prev.map(s => s.id === student.id ? { ...s, finance_status: student.finance_status } : s));
    }
  };
  
  
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredSubmissions.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredSubmissions.length / recordsPerPage);
  
  const handleCancelAction = () => {
    setConfirmation(null);
  };

  const ActionDropdown = ({ student }) => {
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    if (['APPROVED', 'REJECTED'].includes(student.finance_status) || 
        (actionType === 'nursing' && student.status === 'PENDING')) {
      setShowActions(false);
    }
  }, [student.finance_status, actionType, student.status]);

  return (
    (actionType === 'parallel' || actionType === 'finance' || student.status === 'APPROVED' || student.status === 'REJECTED') && (
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

  
  
  const ConfirmationModal = ({ onConfirm, onCancel, action }) => {
    const [inputValue, setInputValue] = useState('');
    const isApproveAction = action === 'approve';
  
    const handleChange = (e) => {
      setInputValue(e.target.value);
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      onConfirm({
        action: action,
        reason: !isApproveAction ? inputValue.trim() : inputValue.trim() 
      });
    };
  
    return (
      <div className="modal-backdrop-2">
        <div className="modal-content-2">
          <h2 className="confirmation-title">Confirmation</h2>
          <p className="confirmation-text">
            Are you sure you want to {isApproveAction ? 'approve' : 'reject'} this student?
          </p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder={isApproveAction ? "Enter remarks (Optional)" : "Enter rejection reason (Mandatory)"}
              value={inputValue}
              onChange={handleChange}
              className={isApproveAction ? "input-remarks" : "input-reason"}
              required={!isApproveAction}
            />
            <div className="confirmation-buttons">
              <button type="submit" className="confirmation-button yes">Yes</button>
              <button type="button" className="confirmation-button no" onClick={onCancel}>No</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <>
      <NavBar />
      <div className="admin-dashboard-container">
        <h1 className="welcome-message">FINANCE PORTAL</h1>
        <FinanceDashboard setStatusFilter={setStatusFilter} />
        <br />
        <div className="admin-dashboard-controls">
          <input
            type="text"
            placeholder="Search by Student ID or Name"
            value={searchTerm}
            onChange={handleChangeSearch}
            className="search-input"
            style={{ width: '1800px', fontFamily: 'Matter', height: '70px', fontSize: 'larger' }}
          />
          <br />
         
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
              <th style={{ backgroundColor: '#F8D706' }}>S.NO</th>
              <th style={{ backgroundColor: '#F8D706' }}>
                Student ID
                <button onClick={() => handleSort('student_id')} className="sort-button">
                  <FontAwesomeIcon icon={faSort} />
                </button>
              </th>
              <th style={{ backgroundColor: '#F8D706' }}>
                Student Name
                <button onClick={() => handleSort('firstName')} className="sort-button">
                  <FontAwesomeIcon icon={faSort} />
                </button>
              </th>
              <th style={{ backgroundColor: '#F8D706' }}>Contact Number</th>
              <th style={{ backgroundColor: '#F8D706' }}>Email</th>
              <th style={{ backgroundColor: '#F8D706' }}>
                Status
                <button onClick={() => handleSort('status')} className="sort-button">
                  <FontAwesomeIcon icon={faSort} />
                </button>
              </th>
              <th style={{ backgroundColor: '#F8D706' }}>Finance Status</th>
              <th style={{ backgroundColor: '#F8D706' }}>Submission Date</th>
              <th style={{ backgroundColor: '#F8D706' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((student, index) => {
              const financeStatus = studentFinanceStatuses[student.id] || 'PENDING';
              const rowClass = financeStatus === 'REJECTED' ? 'grayed-out' : '';
              const financeStyle = financeStatus === 'REJECTED' ? 
                { color: '#FF0000', fontFamily: 'Matter', textTransform: 'uppercase', textAlign: 'center'} :
                financeStatus === 'APPROVED' ?
                { color: '#000000', fontFamily: 'Matter', textTransform: 'uppercase', textAlign: 'center'} :
                financeStatus === 'PENDING' ?
                { color: '#0000FF', fontFamily: 'Matter', textTransform: 'uppercase', textAlign: 'center'} : 
                {};

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
                  <td style={{textAlign: 'center'}}>{index + indexOfFirstRecord + 1}</td>
                  <td style={{ color: 'black', fontWeight: 'bold'}}>{student.student_id}</td>
                  <td style={{textTransform: 'uppercase'}}>{`${student.firstName} ${student.lastName}`}</td>
                  <td>{student.contactNumber}</td>
                  <td>{student.email}</td>
                  <td style={{textAlign: 'center'}}>
                    <button className={`btn ${student.status === 'APPROVED' ? 'green' : student.status === 'REJECTED' ? 'red' : ''}`} disabled>
                      {student.status}
                    </button>
                  </td>
                  <td style={financeStyle}>
                    {financeStatus === 'PENDING' ? (
                     <ActionDropdown student={student} actionType={actionType} />
                    ) : (
                      <button className={`btn ${financeStatus === 'APPROVED' ? 'green' : 'red'}`} disabled>
                        {financeStatus}
                      </button>
                    )}
                  </td>
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
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => setCurrentPage(i + 1)}
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
        <ExportToExcel apiData={filteredSubmissions} fileName={'finance_report'} />
        <br/>
        <button onClick={handlePrint} className="print-button"><span className="print-icon"></span></button>
        {showModal && (
          <Modal student={selectedStudent} onClose={handleCloseModal} showSendAdmitCardButton={false} />
        )}
        
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

export default FinanceAdminPage;
