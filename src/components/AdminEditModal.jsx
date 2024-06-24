import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminEditModal.css'; 

const AdminEditModal = ({ admin, onClose, onSave }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://192.168.0.111:3001/get-users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setFormData({ ...user });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://192.168.0.111:3001/update-user/${selectedUser.id}`, formData);
      await fetchUsers(); // Refresh users list after save
      onSave(); // Notify parent component
      setSelectedUser(null); // Deselect user
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this user?');
    if (confirmDelete) {
      try {
        await axios.delete(`http://192.168.0.111:3001/delete-user/${userId}`);
        await fetchUsers(); 
        onSave(); 
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword) {
      alert('Please enter a new password.');
      return;
    }
    try {
      await axios.post(`http://192.168.0.111:3001/change-password/${selectedUser.id}`, { newPassword });
      alert('Password changed successfully.');
      setNewPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password.');
    }
  };

  const toggleActiveStatus = async (user) => {
    const updatedStatus = !user.isActive;
    try {
      await axios.put(`http://192.168.0.111:3001/update-user/${user.id}`, { ...user, isActive: updatedStatus });
      await fetchUsers(); // Refresh users list after update
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  return (
    <div className="admin-edit-modal">
      <div className="admin-edit-modal-content">
        <h2>Edit Users</h2>
        <button className="close-button" onClick={onClose}>Close</button>
        <button className="register-button" onClick={() => navigate('/register')}>Register New User</button>
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Name</th>
              <th>Email</th>
              <th>User Type</th>
              <th>Created At</th>
              <th>User Type ID</th>
              <th>Actions</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className={user.isActive ? '' : 'inactive'}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.user_type}</td>
                <td>{new Date(user.created_at).toLocaleString()}</td>
                <td>{user.user_type_id}</td>
                <td>
                  <button style={{cursor: 'pointer'}}onClick={() => handleUserSelect(user)}>Edit</button>
                  <button style={{display: 'none'}} onClick={() => handleDelete(user.id)}>Delete</button>
                </td>
                <td>
                  <button style={{cursor: 'pointer'}}onClick={() => toggleActiveStatus(user)}>
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {selectedUser && (
          <div className="user-edit-form">
            <h3>Edit User: {selectedUser.name}</h3>
            <form>
              <label>ID</label>
              <input type="text" name="id" value={formData.id} onChange={handleChange} disabled />
              <label>Username</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} />
              <label>Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} />
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} />
              <label>User Type</label>
              <input type="text" name="user_type" value={formData.user_type} onChange={handleChange} />
              <label>Created At</label>
              <input type="text" name="created_at" value={formData.created_at} onChange={handleChange} disabled />
              <label>User Type ID</label>
              <input type="text" name="user_type_id" value={formData.user_type_id} onChange={handleChange} />
              <label>New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </form>
            <div className="admin-edit-modal-buttons">
              <button className="save-button" onClick={handleSave}>Save</button>
              <button className="change-password-button" onClick={handleChangePassword}>Change Password</button>
              <button className="close-button" onClick={() => setSelectedUser(null)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEditModal;
