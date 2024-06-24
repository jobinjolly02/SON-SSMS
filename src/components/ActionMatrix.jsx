import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ActionMatrix = ({ onClose }) => {
  const [actionType, setActionType] = useState('');

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

  const handleSave = async () => {
    try {
      await axios.post('http://192.168.0.111:3001/set-action-matrix', { actionType: actionType.toLowerCase() });
      alert('Action matrix updated successfully.');
      onClose();
    } catch (error) {
      console.error('Error saving action matrix:', error);
      alert('Failed to save action matrix.');
    }
  };

  return (
    <div className="modal-backdrop-2">
      <div className="modal-content-2">
        <h2>Set Action Matrix</h2>
        <select value={actionType} onChange={(e) => setActionType(e.target.value)}>
          <option value="parallel">Parallel Action</option>
          <option value="finance">Finance Action</option>
          <option value="nursing">Nursing Action</option>
        </select>
        <div className="confirmation-buttons">
          <button className="confirmation-button yes" onClick={handleSave}>Save</button>
          <button className="confirmation-button no" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ActionMatrix;
