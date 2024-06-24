/*
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext'; 
import './LoginPortal.css';

function FinancePortal() {
    const [isRightPanelActive, setIsRightPanelActive] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const navigate = useNavigate();

    // Access UserContext
    const { user, login, logout } = useContext(UserContext);

    const handleSignUp = () => setIsRightPanelActive(true);
    const handleSignIn = () => {
        setIsRightPanelActive(false);
        setIsForgotPassword(false);
    };
    const handleForgotPassword = () => setIsForgotPassword(true);

    const handleRegister = async (name, email, password) => {
        try {
            const response = await axios.post('http://192.168.0.111:3001/finance-register', { name, email, password });
            if (response.data.status === 'success') {
                console.log('Registration successful:', response.data);
                navigate('/finance-admin'); // Assuming there's a route defined for after registration
            } else {
                console.error('Registration failed:', response.data.message);
            }
        } catch (error) {
            console.error('Registration error:', error.response ? error.response.data : error.message);
        }
    };

    const handleLogin = async (email, password) => {
        try {
            const response = await axios.post('http://192.168.0.111:3001/finance-login', { email, password });
            if (response.data.status === 'success') {
                const financeData = {
                    id: response.data.financeId,
                    name: response.data.name // Assuming the response has a name
                };
                login(financeData); // Save the user's data to context
                navigate('/finance-admin'); // Navigate to the FinanceAdminPage on successful login
            } else {
                console.error('Login failed:', response.data.message);
            }
        } catch (error) {
            console.error('Error during login request:', error);
        }
    };

    return (
        <div className={`container2 ${isRightPanelActive ? "right-panel-active" : ""}`} id="container2" >
            <div className="form-container2 sign-up-container2">
                <SignUpForm handleRegister={handleRegister} handleSignIn={handleSignIn} />
            </div>
            <div className="form-container2 sign-in-container2">
                {isForgotPassword ? (
                    <ForgotPasswordForm handleSignIn={handleSignIn} handleForgotPassword={() => {}} /> // Forgot password logic should be added
                ) : (
                    <SignInForm handleLogin={handleLogin} handleSignUp={handleSignUp} handleForgotPassword={handleForgotPassword} />
                )}
            </div>
            <div className="overlay-container">
                <OverlayPanel isRightPanelActive={isRightPanelActive} />
            </div>
        </div>
    );
}

function SignUpForm({ handleRegister, handleSignIn }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const onSubmit = (e) => {
        e.preventDefault();
        handleRegister(name, email, password);
    };

    return (
        <form className="myform" onSubmit={onSubmit}>
            <h1 className="finance-portal-h1">Finance Portal</h1>
            <h1 style={{display: 'none'}}>Create Account</h1>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Name" style={{ backgroundColor: '#ffffff', border: '1.5px solid black', padding: '12px 15px', margin: '8px 0', width: '70%', outline: 'none' }} />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Email" style={{ backgroundColor: '#ffffff', border: '1.5px solid black', padding: '12px 15px', margin: '8px 0', width: '70%', outline: 'none' }} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Password" style={{ backgroundColor: '#ffffff', border: '1.5px solid black', padding: '12px 15px', margin: '8px 0', width: '70%', outline: 'none' }} />
            <button type="submit" className="mybutton">Sign Up</button>
            <p className="myp">Do you already have an account? <a href="#" onClick={handleSignIn}>Log in</a></p>
        </form>
    );
}

function SignInForm({ handleSignUp, handleForgotPassword, handleLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const onSubmit = (e) => {
        e.preventDefault();
        handleLogin(email, password);
    };

    return (
        <form className="myform" onSubmit={onSubmit}>
            <h1 className="finance-portal-h1">Finance Portal</h1>
            <h1>Sign in</h1>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Email" style={{ backgroundColor: '#ffffff', border: '1.5px solid black', padding: '12px 15px', margin: '8px 0', width: '70%', outline: 'none' }} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Password" style={{ backgroundColor: '#ffffff', border: '1.5px solid black', padding: '12px 15px', margin: '8px 0', width: '70%', outline: 'none' }} />
            <a style={{ color: 'red' }} href="#" onClick={handleForgotPassword}>Forgot your password?</a>
            <button type="submit" className="mybutton">Sign In</button>
            <p style={{display: 'none'}} className="myp">New here? <a style={{display: 'none'}} href="#" onClick={handleSignUp}>Create an account</a></p>
        </form>
    );
}

function ForgotPasswordForm({ handleSignIn }) {
    return (
        <form className="myform">
            <h1>Reset Password</h1>
            <input type="email" style={{ backgroundColor: '#ffffff', border: '1.5px solid black', padding: '12px 15px', margin: '8px 0', width: '70%', outline: 'none' }} placeholder="Enter your email" />
            <button className="mybutton">Send reset link</button>
            <p className="myp">Remember your password? <a href="#" onClick={handleSignIn}>Log in</a></p>
        </form>
    );
}

function OverlayPanel({ isRightPanelActive }) {
    return (
        <div className="overlay">
            <div className="overlay-panel overlay-left"></div>
            <div className="overlay-panel overlay-right"></div>
        </div>
    );
}

export default FinancePortal;

*/