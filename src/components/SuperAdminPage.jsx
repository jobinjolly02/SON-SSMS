import React, { useState, useEffect, useRef } from 'react';
import NavBar from './NavBar';
import './NursingPage.css'; 
import ExportToExcel from './ExportToExcel'; 
import Dashboard from './Dashboard';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort } from '@fortawesome/free-solid-svg-icons';
import Footer from './Footer';
import Modal from './Modal';
import PrintComponent from './PrintComponent'; 
import { useReactToPrint } from 'react-to-print'; 
import EmailTemplatesModal from './EmailTemplatesModal';
import AdminEditModal from './AdminEditModal'; 
import ActionMatrix from './ActionMatrix';

const SuperAdminPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [studentStatuses, setStudentStatuses] = useState({});
  const [studentFinanceStatuses, setStudentFinanceStatuses] = useState({});
  const [sortAscending, setSortAscending] = useState(false); 
  const [sortField, setSortField] = useState('student_id'); 
  const [statusFilter, setStatusFilter] = useState('ALL'); 
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(50);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null); 
  const [isEditingEmailTemplate, setIsEditingEmailTemplate] = useState(false);
  const [isEmailTemplatesModalOpen, setIsEmailTemplatesModalOpen] = useState(false);
  const [isAdminEditModalOpen, setIsAdminEditModalOpen] = useState(false); 
  const [isActionMatrixOpen, setIsActionMatrixOpen] = useState(false); 
  const [actionType, setActionType] = useState('parallel');
  const printRef = useRef(); 

  const fetchCurrentActionMatrix = async () => {
    try {
      const response = await axios.get('http://192.168.0.111:3001/get-action-matrix');
      if (response.data.actionType) {
        setActionType(response.data.actionType.toLowerCase());
      }
    } catch (error) {
      console.error('Error fetching action matrix:', error);
    }
  };

  const updateActionMatrix = async (newActionType) => {
    try {
      await axios.post('http://192.168.0.111:3001/set-action-matrix', { actionType: newActionType });
      fetchCurrentActionMatrix(); // Refresh the action type after update
    } catch (error) {
      console.error('Error updating action matrix:', error);
    }
  };

  useEffect(() => {
    fetchCurrentActionMatrix();
  }, []);

  useEffect(() => {
    const fetchStudentApplications = async () => {
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
        console.error('Error fetching applications:', error);
      }
    };
    fetchStudentApplications();
  }, []);

  useEffect(() => {
    const fetchEmailTemplates = async () => {
      try {
        const response = await axios.get('http://192.168.0.111:3001/get-email-templates');
        setEmailTemplates(response.data);
      } catch (error) {
        console.error('Error fetching email templates:', error);
      }
    };

    const fetchAdmins = async () => {
      try {
        const response = await axios.get('http://192.168.0.111:3001/get-admins');
        setAdmins(response.data);
      } catch (error) {
        console.error('Error fetching admins:', error);
      }
    };

    fetchEmailTemplates();
    fetchAdmins();
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

  const handleChangeSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const displayStudentID = (student) => {
    return student.student_id || 'ID not available'; 
  };

  const handleOpenModal = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  const handleOpenEmailTemplateEditor = (template) => {
    setSelectedAdmin(template);
    setIsEditingEmailTemplate(true);
  };

  const handleCloseEmailTemplateEditor = () => {
    setSelectedAdmin(null);
    setIsEditingEmailTemplate(false);
  };

  const handleOpenAdminEditor = (admin) => {
    setSelectedAdmin(admin);
    setIsEditingEmailTemplate(false);
    setIsAdminEditModalOpen(true); // Open admin edit modal
  };

  const handleStatusChange = (student, statusType) => {
    setConfirmation({
      student,
      action: statusType,
      message: `Are you sure you want to reset the ${statusType} status of this student?`
    });
  };

  const handleResetPassword = async (adminId) => {
    try {
      await axios.post(`http://192.168.0.111:3001/reset-password/${adminId}`);
      alert('Password reset successfully.');
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Failed to reset password.');
    }
  };

  const handleSetActiveStatus = async (adminId, isActive) => {
    try {
      await axios.post(`http://192.168.0.111:3001/set-active-status/${adminId}`, { isActive });
      alert('Admin status updated successfully.');
    } catch (error) {
      console.error('Error updating admin status:', error);
      alert('Failed to update admin status.');
    }
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

  const formatDOB = (dob) => {
    const date = new Date(dob);
    const day = date.getDate();
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
  
    return `${day}${getOrdinalSuffix(day)} ${monthNames[monthIndex]} ${year}`;
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

  const handleConfirmAction = async () => {
    const actionToPerform = confirmation.action === 'approve' ? 'APPROVED' : 'REJECTED';
    const studentId = confirmation.student.id;

    setConfirmation(null);
    setStudentStatuses(prevStatuses => ({
        ...prevStatuses,
        [studentId]: actionToPerform
    }));

    try {
        const updateSuccess = await handleStatusUpdate(studentId, actionToPerform);
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

  const handleConfirmReset = async () => {
    const studentId = confirmation.student.id;
    const statusType = confirmation.statusType === 'nursing' ? 'status' : 'finance_status';
  
    setConfirmation(null);
    if (statusType === 'status') {
      setStudentStatuses(prevStatuses => ({
        ...prevStatuses,
        [studentId]: 'PENDING'
      }));
    } else {
      setStudentFinanceStatuses(prevStatuses => ({
        ...prevStatuses,
        [studentId]: 'PENDING'
      }));
    }
  
    try {
      const updateSuccess = await handleStatusUpdate(studentId, 'PENDING', statusType);
      if (updateSuccess) {
        await fetchApplicationStatus(studentId);
        console.log("Reset successful");
      } else {
        throw new Error('Reset failed');
      }
    } catch (error) {
      console.error('Failed to reset status:', error);
    }
  };  

  const handleStatusUpdate = async (studentId, newStatus, statusType = 'status') => {
    try {
      const response = await axios.post('http://192.168.0.111:3001/update-status', { studentId, status: newStatus, statusType });
  
      if (response.data.status === 'success') {
        if (statusType === 'status') {
          setStudentStatuses(prevStatuses => ({
            ...prevStatuses,
            [studentId]: newStatus
          }));
        } else {
          setStudentFinanceStatuses(prevStatuses => ({
            ...prevStatuses,
            [studentId]: newStatus
          }));
        }
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
            setStudentFinanceStatuses(prevStatuses => ({
                ...prevStatuses,
                [studentId]: response.data.data.finance_status
            }));
        } else {
            throw new Error(response.data.message);
        }
    } catch (error) {
        console.error('Error fetching application status:', error);
    }
  };

  const handleOpenEmailTemplatesModal = () => {
    setIsEmailTemplatesModalOpen(true);
  };

  const handleCloseEmailTemplatesModal = () => {
    setIsEmailTemplatesModalOpen(false);
  };

  const handleCancelAction = () => {
    setConfirmation(null);
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleDelete = async (studentId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this student?');
    if (confirmDelete) {
      try {
        await axios.delete(`http://192.168.0.111:3001/delete-student/${studentId}`);
        setSubmissions(submissions.filter(student => student.id !== studentId));
        setFilteredSubmissions(filteredSubmissions.filter(student => student.id !== studentId));
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Failed to delete student.');
      }
    }
  };

  const handleResetStatus = (student, statusType) => {
    setConfirmation({
      student,
      action: 'reset',
      statusType,
      message: `Are you sure you want to reset the ${statusType} status of this student?`
    });
  };

  const ActionDropdown = ({ student }) => {
    const [showActions, setShowActions] = useState(false);
  
    useEffect(() => {
      if (['APPROVED', 'REJECTED'].includes(studentStatuses[student.id])) {
        setShowActions(false);
      }
    }, [studentStatuses, student.id]);
  
    return (
      <div className="action-dropdown">
        <button className="action-dropdown-btn" onClick={() => setShowActions(!showActions)}>Action</button>
        {showActions && (
          <div className={`action-buttons ${showActions ? 'action-buttons-showing' : ''}`}>
            {studentStatuses[student.id] !== 'APPROVED' && (
              <button className="btn green" onClick={() => handleOpenConfirmation(student, 'approve')}>Approve</button>
            )}
            {studentStatuses[student.id] !== 'REJECTED' && (
              <button className="btn red" onClick={() => handleOpenConfirmation(student, 'reject')}>Reject</button>
            )}
            <button className="btn yellow" onClick={() => handleResetStatus(student, 'nursing')}>Reset Nursing Status</button>
            <button className="btn yellow" onClick={() => handleResetStatus(student, 'finance')}>Reset Finance Status</button>
          </div>
        )}
      </div>
    );
  };

  const handleOpenAdminModal = (admin) => {
    setSelectedAdmin(admin);
    setIsAdminEditModalOpen(true);
  };

  const handleCloseAdminModal = () => {
    setIsAdminEditModalOpen(false);
    setSelectedAdmin(null);
  };

  const handleSaveAdmin = async (admin) => {
    try {
      const response = await axios.post(`http://192.168.0.111:3001/update-admin`, admin);
      if (response.data.status === 'success') {
        alert('Admin updated successfully.');
        fetchAdmins(); 
        setIsAdminEditModalOpen(false);
      } else {
        throw new Error(response.data.message || 'An error occurred');
      }
    } catch (error) {
      console.error('Error updating admin:', error);
      alert('Failed to update admin.');
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this admin?');
    if (confirmDelete) {
      try {
        await axios.delete(`http://192.168.0.111:3001/delete-admin/${adminId}`);
        setAdmins(admins.filter(admin => admin.id !== adminId));
      } catch (error) {
        console.error('Error deleting admin:', error);
        alert('Failed to delete admin.');
      }
    }
  };

  return (
    <>
      <NavBar />
      <div className="admin-dashboard-container">
        <h1 className="welcome-message">SUPER ADMIN PORTAL</h1>
        <Dashboard setStatusFilter={handleFilter} />
        <br/>
        <button onClick={handleOpenEmailTemplatesModal} className="email-templates-button">Email Templates</button>
        <br />
        <br/>
        <button onClick={() => setIsAdminEditModalOpen(true)} className="modify-users-button">Modify Users</button>
        <br />
        {isAdminEditModalOpen && (
          <AdminEditModal
            admin={selectedAdmin}
            onClose={handleCloseAdminModal}
            onSave={handleSaveAdmin}
            onDelete={handleDeleteAdmin}
            onResetPassword={handleResetPassword}
          />
        )}
        <br/>
          <button onClick={() => setIsActionMatrixOpen(true)} className="action-matrix-button">Set Action Matrix</button>
        {isActionMatrixOpen && (
          <ActionMatrix onClose={() => setIsActionMatrixOpen(false)} onUpdate={updateActionMatrix} />
        )}
        <div className="admin-dashboard-controls">
          <input
            type="text"
            placeholder="Search by Student ID or Name"
            value={searchTerm}
            onChange={handleChangeSearch}
            className="search-input"
            style={{width: '1800px', fontFamily: 'Matter', height: '70px', fontSize: 'larger'}}
          />
        </div>

         {/* Refresh Button */}
        <div className="refresh-button-container">
          <button onClick={() => window.location.reload()} className="refresh-button">Refresh</button>
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
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage).map((student, index) => {
              const currentStatus = studentStatuses[student.id] || student.status;
              const financeStatus = studentFinanceStatuses[student.id] || 'PENDING';
              const financeStyle = financeStatus === 'REJECTED' ? 
                { color: '#FF0000', fontFamily: 'Matter', textTransform: 'uppercase', textAlign: 'center'} :
                financeStatus === 'APPROVED' ?
                { color: '#000000', fontFamily: 'Matter', textTransform: 'uppercase', textAlign: 'center'} :
                financeStatus === 'PENDING' ?
                { color: '#0000FF', fontFamily: 'Matter', textTransform: 'uppercase', textAlign: 'center'} : {};
  
                
              // Calculate serial number based on current page and index
              const serialNumber = (currentPage - 1) * recordsPerPage + index + 1;

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
                <tr style={{textAlign: 'left'}} key={student.id}>
                  <td style={{textAlign: 'center'}}>{serialNumber}</td>
                  <td style={{ fontWeight: '600'}}>{student.student_id}</td>
                  <td style={{textTransform: 'uppercase'}}>{`${student.firstName} ${student.lastName}`}</td>
                  <td style={{textAlign: 'center'}}>{student.contactNumber}</td>
                  <td>{student.email}</td>
                  <td style={{textAlign: 'center'}}>
                    {currentStatus === 'APPROVED' || currentStatus === 'REJECTED' ? (
                      <button className={`btn ${currentStatus === 'APPROVED' ? 'green' : 'red'}`} onClick={() => handleResetStatus(student, 'nursing')}>
                        {currentStatus}
                      </button>
                    ) : (
                      <ActionDropdown student={student} />
                    )}
                  </td>
                  <td style={financeStyle}>
                    {financeStatus === 'APPROVED' || financeStatus === 'REJECTED' ? (
                      <button className={`btn ${financeStatus === 'APPROVED' ? 'green' : 'red'}`} onClick={() => handleResetStatus(student, 'finance')}>
                        {financeStatus}
                      </button>
                    ) : (
                      <ActionDropdown student={student} />
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

                  <td>
                    <button onClick={() => handleDelete(student.id)}>Delete</button>
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
          {Array.from({ length: Math.ceil(filteredSubmissions.length / recordsPerPage) }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              disabled={currentPage === i + 1}
            >
              {i + 1}
            </button>
          ))}
          <button onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage === Math.ceil(filteredSubmissions.length / recordsPerPage)}>
            Next
          </button>
          <button onClick={() => setCurrentPage(Math.ceil(filteredSubmissions.length / recordsPerPage))} disabled={currentPage === Math.ceil(filteredSubmissions.length / recordsPerPage)}>
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
              onClose={handleCloseModal}
            />
          </div>
        )}
        <button onClick={handlePrint} className="print-button"><span className="print-icon"></span></button>
      </div>
      <Footer />
      {isEmailTemplatesModalOpen && (
        <EmailTemplatesModal onClose={handleCloseEmailTemplatesModal} />
      )}
      {isAdminEditModalOpen && (
        <AdminEditModal
          admin={selectedAdmin}
          onClose={handleCloseAdminModal}
          onSave={handleSaveAdmin}
          onDelete={handleDeleteAdmin}
          onResetPassword={handleResetPassword}
        />
      )}
      <div style={{ display: 'none' }}>
        <PrintComponent ref={printRef} students={filteredSubmissions} />
      </div>
      {confirmation && (
        <ConfirmationModal
          action={confirmation.action}
          message={confirmation.message}
          onConfirm={confirmation.action === 'reset' ? handleConfirmReset : handleConfirmAction}
          onCancel={handleCancelAction}
        />
      )}
    </>
  );  
};

const ConfirmationModal = ({ action, message, onConfirm, onCancel }) => {
  return (
    <div className="modal-backdrop-2">
      <div className="modal-content-2">
        <h2 className="confirmation-title">Confirmation</h2>
        <p className="confirmation-text">{message}</p>
        <div className="confirmation-buttons">
          <button className="confirmation-button yes" onClick={onConfirm}>
            Yes
          </button>
          <button className="confirmation-button no" onClick={onCancel}>
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminPage;
