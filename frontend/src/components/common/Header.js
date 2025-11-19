import React from 'react';
import './Header.css';

const Header = ({ user, onLogin, onLogout }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          {/* Prázdny priestor pre balans */}
        </div>
        
        <div className="logo">
          <h1 className="app-name">WIS2</h1>
        </div>
        
        <div className="header-right">
          <div className="user-section">
            {user ? (
              <div className="user-info">
                <span className="user-name">{user.role}: {user.name}</span>
                <button className="button button-secondary" onClick={onLogout}>
                  Zmeniť rolu
                </button>
              </div>
            ) : (
              <button className="button" onClick={onLogin}>
                Prihlásiť sa
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;