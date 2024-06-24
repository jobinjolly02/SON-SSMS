import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import './AdminRegister.css';

function AdminRegister() {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('');

    const navigate = useNavigate();
    const { login } = useContext(UserContext);

    const handleRegister = async (event) => {
        event.preventDefault();

        try {
            const response = await axios.post('http://192.168.0.111:3001/register', {
                name, username, email, password, userType 
            });

            if (response.data.status === 'success') {
                login({
                    id: response.data.userId,
                    name: response.data.name,
                    userType: response.data.userType
                });

                navigate('/super-admin');  
                console.log('Registration successful:', response.data.message);
            } else {
                console.error('Registration failed:', response.data.message);
            }
        } catch (error) {
            console.error('Registration error:', error.response ? error.response.data : error.message);
        }
    };

    return (
        <div className="container3" id="container3">
            <div className="form-container3 sign-up-container3">
                <form className="myform3" onSubmit={handleRegister}>
                    <h1>Admin Registration</h1>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="form-input"
                        placeholder="Full Name"
                        style={{
                            backgroundColor: '#ffffff', border: '1.5px solid black',
                            padding: '12px 15px',
                            margin: '10px 0',
                            width: '100%',
                            outline: 'none',
                        }}
                    />
                     <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="form-input"
                        placeholder="Username"
                        style={{
                            backgroundColor: '#ffffff', border: '1.5px solid black',
                            padding: '12px 15px',
                            margin: '10px 0',
                            width: '100%',
                            outline: 'none'
                        }}
                    />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-input"
                        placeholder="Email"
                        style={{
                            backgroundColor: '#ffffff', border: '1.5px solid black',
                            padding: '12px 15px',
                            margin: '10px 0',
                            width: '100%',
                            outline: 'none',
                        }}
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-input"
                        placeholder="Password"
                        style={{
                            backgroundColor: '#ffffff', border: '1.5px solid black',
                            padding: '12px 15px',
                            margin: '10px 0',
                            width: '100%',
                            outline: 'none',
                        }}
                    />
                    <select
                        value={userType}
                        onChange={(e) => setUserType(e.target.value)}
                        className="form-input"
                        style={{
                            backgroundColor: '#ffffff', border: '1.5px solid black',
                            padding: '12px 15px',
                            margin: '10px 0',
                            width: '100%',
                            outline: 'none',
                        }}
                    >
                        <option value="">Select User Type</option>
                        <option value="nursing">Nursing</option>
                        <option value="finance">Finance</option>
                        <option value="admin">Admin</option> 
                    </select>
                    <button type="submit" style={{marginTop: '20px',fontSize: 'large'}}className="mybutton">Register</button>
                </form>
            </div>
        </div>
    );
}

export default AdminRegister;
