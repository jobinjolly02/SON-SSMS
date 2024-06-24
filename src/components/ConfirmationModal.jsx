// ConfirmationModal.js
import React from 'react';
import './ConfirmationModal.css'; 
import { FaCheck } from 'react-icons/fa'; 

const ConfirmationModal = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;

    return (
        <div className="unique-modal-overlay">
            <div className="unique-modal">
                <div className="check-icon">
                    <FaCheck />
                </div>
                <h2>Thank You!</h2>
                <p>{message}</p>
                <button onClick={onClose}>OK</button>
            </div>
        </div>
    );
};

export default ConfirmationModal;
