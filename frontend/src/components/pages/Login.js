import React, { useState } from 'react';
import './Login.css';
import { authAPI } from '../services/api';

const Login = ({ onLoginSuccess, onSkipLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password1: '',
    password2: ''
  });

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(loginData);
      console.log('Login successful:', response);
      
      const userInfo = await authAPI.getCurrentUser();
      onLoginSuccess(userInfo);
      
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (registerData.password1 !== registerData.password2) {
      setError('Passwords do not match! Please check your passwords.');
      setLoading(false);
      return;
    }

    if (registerData.password1.length < 8) {
      setError('Password must be at least 8 characters long!');
      setLoading(false);
      return;
    }

    try {
      await authAPI.register(registerData);
      
      await authAPI.login({
        username: registerData.username,
        password: registerData.password1
      });
      
      const userInfo = await authAPI.getCurrentUser();
      onLoginSuccess(userInfo);
      
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>WIS2</h1>
        </div>

        <div className="login-tabs">
          <button
            className={`tab ${isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
          >
            Login
          </button>
          <button
            className={`tab ${!isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="error-alert">
            <div className="error-icon">⚠️</div>
            <div className="error-content">
              <strong>Error!</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {isLogin ? (
          <form onSubmit={handleLoginSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                name="username"
                className="input-field"
                placeholder="Enter your username"
                value={loginData.username}
                onChange={handleLoginChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="input-field"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={handleLoginChange}
                required
              />
            </div>

            <button
              type="submit"
              className="button button-primary"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Username *</label>
              <input
                type="text"
                name="username"
                className="input-field"
                placeholder="Choose a username"
                value={registerData.username}
                onChange={handleRegisterChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                name="email"
                className="input-field"
                placeholder="your.email@example.com"
                value={registerData.email}
                onChange={handleRegisterChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  className="input-field"
                  placeholder="First name"
                  value={registerData.first_name}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  className="input-field"
                  placeholder="Last name"
                  value={registerData.last_name}
                  onChange={handleRegisterChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                name="password1"
                className="input-field"
                placeholder="At least 8 characters"
                value={registerData.password1}
                onChange={handleRegisterChange}
                required
                minLength={8}
              />
              <small className="form-hint">Password must contain at least 8 characters</small>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                name="password2"
                className="input-field"
                placeholder="Enter password again"
                value={registerData.password2}
                onChange={handleRegisterChange}
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              className="button button-primary"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        )}

        <div className="skip-login">
          <button
            className="button-link"
            onClick={onSkipLogin}
          >
            Continue without login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;