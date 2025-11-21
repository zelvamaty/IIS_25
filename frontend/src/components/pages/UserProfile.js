import React, { useState, useEffect } from 'react';
import './UserProfile.css';
import { usersAPI } from '../services/api';

const UserProfile = ({ user }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  
  // Profile edit data
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: ''
  });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password change data
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password1: '',
    new_password2: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    loadUserDetails();
  }, [user.id]);

  const loadUserDetails = async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getCurrentUser();
      setUserDetails(data);
      setProfileData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || ''
      });
    } catch (err) {
      setError('Nepodařilo se načíst údaje uživatele');
      console.error('Error loading user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
    setProfileError('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    try {
      await usersAPI.updateUser(userDetails.id, profileData);
      setProfileSuccess('Profil byl úspěšně upraven');
      await loadUserDetails(); // Reload user data
      
      setTimeout(() => {
        setIsEditingProfile(false);
        setProfileSuccess('');
      }, 2000);
    } catch (err) {
      setProfileError(err.message || 'Úprava profilu selhala');
      console.error('Profile update error:', err);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
    setPasswordError('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.new_password1 !== passwordData.new_password2) {
      setPasswordError('Nová hesla se neshodují');
      return;
    }

    if (passwordData.new_password1.length < 8) {
      setPasswordError('Heslo musí mít alespoň 8 znaků');
      return;
    }

    try {
      await usersAPI.changePassword(passwordData);
      setPasswordSuccess('Heslo bylo úspěšně změněno');
      setPasswordData({
        old_password: '',
        new_password1: '',
        new_password2: ''
      });
      setTimeout(() => {
        setIsEditingPassword(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (err) {
      setPasswordError(err.message || 'Změna hesla selhala');
      console.error('Password change error:', err);
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'Student': return '🎓';
      case 'Garant': return '👨‍🏫';
      case 'Lektor': return '📚';
      case 'Administrátor': return '⚙️';
      default: return '👤';
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'Student': return '#3b82f6';
      case 'Garant': return '#8b5cf6';
      case 'Lektor': return '#10b981';
      case 'Administrátor': return '#ef4444';
      default: return '#64748b';
    }
  };

  if (loading) {
    return (
      <div className="user-profile">
        <div className="loading-state">
          <p>Načítání profilu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile">
        <div className="error-state">
          <p>{error}</p>
          <button className="button" onClick={loadUserDetails}>
            Zkusit znovu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar" style={{ borderColor: getRoleColor(user.role) }}>
            <span className="avatar-icon">{getRoleIcon(user.role)}</span>
          </div>
          <div className="profile-header-info">
            <h1>{userDetails?.first_name} {userDetails?.last_name}</h1>
            <div className="role-badge" style={{ background: getRoleColor(user.role) }}>
              {user.role}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="profile-details">
          <div className="section-header">
            <h2>Osobní údaje</h2>
            {!isEditingProfile && (
              <button 
                className="button button-edit"
                onClick={() => setIsEditingProfile(true)}
              >
                ✏️ Upravit
              </button>
            )}
          </div>

          {isEditingProfile ? (
            // EDIT MODE
            <div className="edit-section">
              {profileError && (
                <div className="error-message">
                  {profileError}
                </div>
              )}

              {profileSuccess && (
                <div className="success-message">
                  {profileSuccess}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="edit-form">
                <div className="form-group">
                  <label className="form-label">Jméno</label>
                  <input
                    type="text"
                    name="first_name"
                    className="input-field"
                    placeholder="Zadejte jméno"
                    value={profileData.first_name}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Příjmení</label>
                  <input
                    type="text"
                    name="last_name"
                    className="input-field"
                    placeholder="Zadejte příjmení"
                    value={profileData.last_name}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="input-field"
                    placeholder="Zadejte email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="button button-primary">
                    💾 Uložit změny
                  </button>
                  <button 
                    type="button" 
                    className="button button-secondary"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setProfileData({
                        first_name: userDetails.first_name || '',
                        last_name: userDetails.last_name || '',
                        email: userDetails.email || ''
                      });
                      setProfileError('');
                      setProfileSuccess('');
                    }}
                  >
                    ❌ Zrušit
                  </button>
                </div>
              </form>
            </div>
          ) : (
            // VIEW MODE
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-icon">👤</span>
                <div className="detail-content">
                  <label>Uživatelské jméno</label>
                  <p>{userDetails?.username}</p>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-icon">📧</span>
                <div className="detail-content">
                  <label>Email</label>
                  <p>{userDetails?.email || 'Není nastaveno'}</p>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-icon">🏷️</span>
                <div className="detail-content">
                  <label>Jméno</label>
                  <p>{userDetails?.first_name || 'Není nastaveno'}</p>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-icon">🏷️</span>
                <div className="detail-content">
                  <label>Příjmení</label>
                  <p>{userDetails?.last_name || 'Není nastaveno'}</p>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-icon">🔑</span>
                <div className="detail-content">
                  <label>Role</label>
                  <p>{user.role}</p>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-icon">🆔</span>
                <div className="detail-content">
                  <label>ID uživatele</label>
                  <p>#{userDetails?.id}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Password Change Button */}
        {!isEditingProfile && (
          <div className="profile-actions">
            <button 
              className="button button-secondary"
              onClick={() => setIsEditingPassword(!isEditingPassword)}
            >
              <span>🔒</span> {isEditingPassword ? 'Zrušit změnu hesla' : 'Změnit heslo'}
            </button>
          </div>
        )}

        {/* Password Change Form */}
        {isEditingPassword && (
          <div className="password-change-section">
            <h2>Změna hesla</h2>
            
            {passwordError && (
              <div className="error-message">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="success-message">
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="password-form">
              <div className="form-group">
                <label className="form-label">Staré heslo</label>
                <input
                  type="password"
                  name="old_password"
                  className="input-field"
                  placeholder="Zadejte staré heslo"
                  value={passwordData.old_password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nové heslo</label>
                <input
                  type="password"
                  name="new_password1"
                  className="input-field"
                  placeholder="Zadejte nové heslo (min. 8 znaků)"
                  value={passwordData.new_password1}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Potvrzení nového hesla</label>
                <input
                  type="password"
                  name="new_password2"
                  className="input-field"
                  placeholder="Zadejte nové heslo znovu"
                  value={passwordData.new_password2}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="button button-primary">
                  💾 Uložit nové heslo
                </button>
                <button 
                  type="button" 
                  className="button button-secondary"
                  onClick={() => {
                    setIsEditingPassword(false);
                    setPasswordData({
                      old_password: '',
                      new_password1: '',
                      new_password2: ''
                    });
                    setPasswordError('');
                    setPasswordSuccess('');
                  }}
                >
                  ❌ Zrušit
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;