import React, { useState } from 'react';
import './Login.css';
import { authAPI } from '../services/api';

const Login = ({ onLoginSuccess, onSkipLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Login form
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  // Registration form
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
      
      // Get current user info
      const userInfo = await authAPI.getCurrentUser();
      onLoginSuccess(userInfo);
      
    } catch (err) {
      setError(err.message || 'Přihlášení selhalo. Zkontrolujte své údaje.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (registerData.password1 !== registerData.password2) {
      setError('Hesla se neshodují');
      setLoading(false);
      return;
    }

    try {
      await authAPI.register(registerData);
      
      // Auto login after registration
      await authAPI.login({
        username: registerData.username,
        password: registerData.password1
      });
      
      const userInfo = await authAPI.getCurrentUser();
      onLoginSuccess(userInfo);
      
    } catch (err) {
      setError(err.message || 'Registrace selhala. Zkuste to znovu.');
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
          <p>Systém pro správu konzultací</p>
        </div>

        <div className="login-tabs">
          <button
            className={`tab ${isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
          >
            Přihlášení
          </button>
          <button
            className={`tab ${!isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
          >
            Registrace
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {isLogin ? (
          // LOGIN FORM
          <form onSubmit={handleLoginSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Uživatelské jméno</label>
              <input
                type="text"
                name="username"
                className="input-field"
                placeholder="Zadejte uživatelské jméno"
                value={loginData.username}
                onChange={handleLoginChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Heslo</label>
              <input
                type="password"
                name="password"
                className="input-field"
                placeholder="Zadejte heslo"
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
              {loading ? 'Přihlašování...' : 'Přihlásit se'}
            </button>
          </form>
        ) : (
          // REGISTRATION FORM
          <form onSubmit={handleRegisterSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Uživatelské jméno *</label>
              <input
                type="text"
                name="username"
                className="input-field"
                placeholder="Zvolte si uživatelské jméno"
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
                placeholder="vas.email@example.com"
                value={registerData.email}
                onChange={handleRegisterChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Jméno *</label>
                <input
                  type="text"
                  name="first_name"
                  className="input-field"
                  placeholder="Jméno"
                  value={registerData.first_name}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Příjmení *</label>
                <input
                  type="text"
                  name="last_name"
                  className="input-field"
                  placeholder="Příjmení"
                  value={registerData.last_name}
                  onChange={handleRegisterChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Heslo *</label>
              <input
                type="password"
                name="password1"
                className="input-field"
                placeholder="Zadejte heslo"
                value={registerData.password1}
                onChange={handleRegisterChange}
                required
                minLength={8}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Potvrzení hesla *</label>
              <input
                type="password"
                name="password2"
                className="input-field"
                placeholder="Zadejte heslo znovu"
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
              {loading ? 'Registrace...' : 'Registrovat se'}
            </button>
          </form>
        )}

        {/* Skip login button */}
        <div className="skip-login">
          <button
            className="button-link"
            onClick={onSkipLogin}
          >
            Pokračovat bez přihlášení
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;