import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './ResetPassword.css';

function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();
    const { token } = useParams();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        try {
            const response = await axios.post('http://192.168.0.111:3001/reset-password', { token, password });
            alert(response.data.message);
            navigate('/');
        } catch (error) {
            alert('Failed to reset password. ' + error.response.data.message);
        }
    };

    return (
        <div className="reset-password-container">
            <h1 className="reset-password-header">Reset Your Password</h1>
            <form className="reset-password-form" onSubmit={handleSubmit}>
                <input type="password" className="reset-password-input" placeholder="New Password" value={password}
                    onChange={(e) => setPassword(e.target.value)} required />
                <input type="password" className="reset-password-input" placeholder="Confirm New Password" value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)} required />
                <button className="reset-password-button" type="submit">Reset Password</button>
            </form>
        </div>
    );
}

export default ResetPassword;
