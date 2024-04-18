import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Form submitted with username:', username, 'and password:', password);
    try {
      console.log('Sending login request to server...');
      const response = await fetch('http://10.12.5.17/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      console.log('Response received:', response);
      const data = await response.json();
      console.log('Response data:', data);
  
      if (response.ok) {
        localStorage.setItem('RandomToken', data.token);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('isApproved', data.isApproved.toString());
        if (data.isApproved) {
          navigate('/m');
        } else {
          setErrorMessage('Your account is waiting for approval.');
        }
      } else if (response.status === 401 && data.message === 'User not found') {
        setErrorMessage('User not found. Please register if you don\'t have an account.');
      } else if (response.status === 401 && data.message === 'Account not approved yet') {
        setErrorMessage('Your account is not approved yet. Please wait for approval.');
      } else if (response.status === 401 && data.message === 'Wrong password') {
        setErrorMessage('Wrong password. Please try again.');
      } else {
        setErrorMessage('An error occurred. Please try again later.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Login failed. Please try again.');
    }
  };
  
  
  

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-group">
      <h1> LOGIN ACOUNT</h1>
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <button type="submit">Login</button>
    </form>
  );
}

export default LoginPage;
