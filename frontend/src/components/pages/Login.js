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

  const [fieldErrors, setFieldErrors] = useState({});

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
    setError('');
    setFieldErrors(prev => ({
      ...prev,
      [e.target.name]: null
    }));
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
    setError('');
    setFieldErrors(prev => ({
      ...prev,
      [e.target.name]: null
    }));
  };

  const validateLoginForm = () => {
    const errors = {};
    
    if (!loginData.username || loginData.username.trim() === '') {
      errors.username = 'Please enter your username';
    }
    
    if (!loginData.password || loginData.password.trim() === '') {
      errors.password = 'Please enter your password';
    }
    
    return errors;
  };

  const validateRegisterForm = () => {
    const errors = {};
    if (!registerData.username || registerData.username.trim() === '') {
      errors.username = 'Username is required';
    } else if (registerData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (registerData.username.length > 150) {
      errors.username = 'Username cannot exceed 150 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(registerData.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }
    if (!registerData.email || registerData.email.trim() === '') {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
      errors.email = 'Please enter a valid email address (e.g., name@example.com)';
    }
    
    if (!registerData.first_name || registerData.first_name.trim() === '') {
      errors.first_name = 'First name is required';
    } else if (registerData.first_name.length < 2) {
      errors.first_name = 'First name must be at least 2 characters';
    } else if (registerData.first_name.length > 30) {
      errors.first_name = 'First name cannot exceed 30 characters';
    }
    if (!registerData.last_name || registerData.last_name.trim() === '') {
      errors.last_name = 'Last name is required';
    } else if (registerData.last_name.length < 2) {
      errors.last_name = 'Last name must be at least 2 characters';
    } else if (registerData.last_name.length > 30) {
      errors.last_name = 'Last name cannot exceed 30 characters';
    }
    if (!registerData.password1 || registerData.password1.trim() === '') {
      errors.password1 = 'Password is required';
    } else if (registerData.password1.length < 8) {
      errors.password1 = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])/.test(registerData.password1)) {
      errors.password1 = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(registerData.password1)) {
      errors.password1 = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(registerData.password1)) {
      errors.password1 = 'Password must contain at least one number';
    }
    if (!registerData.password2 || registerData.password2.trim() === '') {
      errors.password2 = 'Please confirm your password';
    } else if (registerData.password1 !== registerData.password2) {
      errors.password2 = 'Passwords do not match ';
    }
    
    return errors;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateLoginForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please complete all required fields to continue');
      return;
    }
    
    setLoading(true);
    setError('');
    setFieldErrors({});

    try {
      const response = await authAPI.login(loginData);
      
      const userInfo = await authAPI.getCurrentUser();
      onLoginSuccess(userInfo);
      
    } catch (err) {
      setError('Invalid username or password. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateRegisterForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fix the errors below before continuing');
      return;
    }
    
    setLoading(true);
    setError('');
    setFieldErrors({});
  
    try {
      await authAPI.register(registerData);
      
      await authAPI.login({
        username: registerData.username,
        password: registerData.password1
      });
      
      const userInfo = await authAPI.getCurrentUser();
      onLoginSuccess(userInfo);
      
    } catch (err) {
      console.error('Registration error:', err);
      
      if (err.response && err.response.data) {
        const backendErrors = err.response.data;
        const newFieldErrors = {};
        let generalError = '';
        
        if (backendErrors.username) {
          newFieldErrors.username = Array.isArray(backendErrors.username) 
            ? backendErrors.username[0] 
            : backendErrors.username;
        }
        
        if (backendErrors.email) {
          newFieldErrors.email = Array.isArray(backendErrors.email) 
            ? backendErrors.email[0] 
            : backendErrors.email;
        }
        
        if (backendErrors.password1 || backendErrors.password) {
          const passwordError = backendErrors.password1 || backendErrors.password;
          newFieldErrors.password1 = Array.isArray(passwordError) 
            ? passwordError[0] 
            : passwordError;
        }
        
        if (backendErrors.password2) {
          newFieldErrors.password2 = Array.isArray(backendErrors.password2) 
            ? backendErrors.password2[0] 
            : backendErrors.password2;
        }
        
        if (backendErrors.non_field_errors) {
          generalError = Array.isArray(backendErrors.non_field_errors)
            ? backendErrors.non_field_errors.join(' ')
            : backendErrors.non_field_errors;
        }
        
        if (Object.keys(newFieldErrors).length > 0) {
          setFieldErrors(newFieldErrors);
          setError('Please fix the errors below before continuing');
        } else if (generalError) {
          setError(generalError);
        } else {
          setError('Registration failed. Please check your information and try again.');
        }
      } else if (err.message && err.message.includes('username')) {
        setError('This username is already taken. Please choose a different one.');
      } else if (err.message && err.message.includes('email')) {
        setError('This email is already registered. Please use a different email or try logging in.');
      } else {
        setError(err.message || 'Registration failed. Please check your information and try again.');
      }
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
              setFieldErrors({});
            }}
          >
            Login
          </button>
          <button
            className={`tab ${!isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(false);
              setError('');
              setFieldErrors({});
            }}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="error-alert">
            <div className="error-icon">⚠️</div>
            <div className="error-content">
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
                className={`input-field ${fieldErrors.username ? 'input-error' : ''}`}
                placeholder="Enter your username"
                value={loginData.username}
                onChange={handleLoginChange}
              />
              {fieldErrors.username && (
                <small className="form-error">{fieldErrors.username}</small>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className={`input-field ${fieldErrors.password ? 'input-error' : ''}`}
                placeholder="Enter your password"
                value={loginData.password}
                onChange={handleLoginChange}
              />
              {fieldErrors.password && (
                <small className="form-error">{fieldErrors.password}</small>
              )}
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
                className={`input-field ${fieldErrors.username ? 'input-error' : ''}`}
                placeholder="Choose a unique username"
                value={registerData.username}
                onChange={handleRegisterChange}
              />
              {fieldErrors.username && (
                <small className="form-error">{fieldErrors.username}</small>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                name="email"
                className={`input-field ${fieldErrors.email ? 'input-error' : ''}`}
                placeholder="your.email@example.com"
                value={registerData.email}
                onChange={handleRegisterChange}
              />
              {fieldErrors.email && (
                <small className="form-error">{fieldErrors.email}</small>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  className={`input-field ${fieldErrors.first_name ? 'input-error' : ''}`}
                  placeholder="First name"
                  value={registerData.first_name}
                  onChange={handleRegisterChange}
                />
                {fieldErrors.first_name && (
                  <small className="form-error">{fieldErrors.first_name}</small>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  className={`input-field ${fieldErrors.last_name ? 'input-error' : ''}`}
                  placeholder="Last name"
                  value={registerData.last_name}
                  onChange={handleRegisterChange}
                />
                {fieldErrors.last_name && (
                  <small className="form-error">{fieldErrors.last_name}</small>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                name="password1"
                className={`input-field ${fieldErrors.password1 ? 'input-error' : ''}`}
                placeholder="Create a strong password"
                value={registerData.password1}
                onChange={handleRegisterChange}
              />
              {fieldErrors.password1 && (
                <small className="form-error">{fieldErrors.password1}</small>
              )}
              {!fieldErrors.password1 && (
                <small className="form-hint">Must be 8+ characters </small>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                name="password2"
                className={`input-field ${fieldErrors.password2 ? 'input-error' : ''}`}
                placeholder="Re-enter your password"
                value={registerData.password2}
                onChange={handleRegisterChange}
              />
              {fieldErrors.password2 && (
                <small className="form-error">{fieldErrors.password2}</small>
              )}
            </div>

            <button
              type="submit"
              className="button button-primary"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
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