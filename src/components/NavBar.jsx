// NavBar.jsx
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import sgrhlogo from '../logoimage.png';
import './NavBar.css';

const NavBar = () => {
    const { logout } = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="navbar">
             <img src={sgrhlogo} alt="School Logo" className="navbar-logo"/>
            <span className="navbar-title" style={{fontSize: '30px', fontWeight: 'bold'}}>SCHOOL OF NURSING</span>
            <button onClick={handleLogout} className="logout-button">LOGOUT</button>
        </div>
    );
};

export default NavBar;
