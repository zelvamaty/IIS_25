import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = ({ user, onLogin, onLogout }) => {
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <div className="logo-box">SYSTÉM KURZŮ</div>
        </Link>
        
        <div className="user-section">
          {user ? (
            <div className="user-info">
              <span className="user-name">{user.role}: {user.name}</span>
              <button className="button button-secondary" onClick={onLogout}>
zmen  rolu            </button>
            </div>
          ) : (
            <button className="button" onClick={onLogin}>
              klik
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;