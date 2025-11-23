import React from 'react';
import './Header.css';

const Header = ({ user, onLogout, onLogin }) => {
  const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left"></div>
        
        <div className="logo">
          <h1 className="app-name">WIS2</h1>
        </div>
        
        <div className="header-right">
          <div className="user-section">
            {user ? (
              <div className="user-info">
                <span className="user-name">{truncateText(user.name, 30)}</span>
                <button className="button button-secondary" onClick={onLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <button className="button" onClick={onLogin}>
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
    
  );
};

export default Header;