import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext'; 
import './LoginPortal.css';

function NursesPortal() {
    const [isRightPanelActive, setIsRightPanelActive] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate(); 
    const { login } = useContext(UserContext);

    const handleSignUp = () => setIsRightPanelActive(true);
    const handleSignIn = () => {
        setIsRightPanelActive(false);
        setErrorMessage('');
    };
    
    const handleLogin = async (username, password) => {
        try {
            const response = await axios.post('http://192.168.0.111:3001/login', { username, password });
            console.log("Login Response Data:", response.data);
    
            if (response.data.status === 'success') {
                const userData = response.data.user;
    
                login({
                    id: userData.id,
                    name: userData.name,
                    username: userData.username,
                    userType: userData.userType
                });
    
                switch (userData.userType) {
                    case 'nursing':
                        navigate('/nursing-admin');
                        break;
                    case 'finance':
                        navigate('/finance-admin');
                        break;
                    case 'admin':
                        navigate('/super-admin');
                        break;
                    default:
                        console.error('Unknown user type:', userData.userType);
                }
            } else {
                setErrorMessage('Invalid username or password');
            }
        } catch (error) {
            setErrorMessage(error.response ? error.response.data.message : error.message);
        }
    };

    return (
        <div className={`container2 ${isRightPanelActive ? "right-panel-active" : ""}`} id="container2">
            <div className="form-container2 sign-in-container2">
                <SignInForm 
                    handleLogin={handleLogin} 
                    handleSignUp={handleSignUp} 
                    handleSignIn={handleSignIn} 
                    errorMessage={errorMessage} 
                />
            </div>
            <div className="overlay-container">
                <OverlayPanel isRightPanelActive={isRightPanelActive} />
            </div>
        </div>
    );
}

function SignInForm({ handleLogin, handleSignUp, handleSignIn, errorMessage }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const onSubmit = (e) => {
        e.preventDefault();
        handleLogin(username, password);
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <form className="myform" onSubmit={onSubmit}>
            <h1>Sign in</h1>
            <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                style={{
                    backgroundColor: '#ffffff', 
                    border: '1.5px solid black',
                    padding: '12px 15px',
                    margin: '12px 0',
                    width: '100%',
                    outline: 'none',
                }} 
                placeholder="Username" 
                required
            />
            <div style={{ position: 'relative', width: '100%' }}>
                <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                        backgroundColor: '#ffffff', 
                        border: '1.5px solid black',
                        padding: '12px 15px',
                        margin: '12px 0',
                        width: '100%',
                        outline: 'none',
                        boxSizing: 'border-box'
                    }} 
                    placeholder="Password"
                    required 
                />
                <button 
                    type="button" 
                    onClick={toggleShowPassword} 
                    style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                    }}
                >
                    {showPassword ? 'Hide' : 'Show'}
                </button>
            </div>
            {errorMessage && <p className="error-text" style={{marginTop: '0'}}>{errorMessage}</p>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0' }}>
                <button className="mybutton" type="submit" style={{ fontStyle: 'larger' }}>Login</button>
            </div>
        </form>
    );
}

function OverlayPanel({ isRightPanelActive }) {
    return (
        <div className="overlay">
            <div className="overlay-panel overlay-left">
            </div>
            <div className="overlay-panel overlay-right">
            </div>
        </div>
    );
}

export default NursesPortal;
