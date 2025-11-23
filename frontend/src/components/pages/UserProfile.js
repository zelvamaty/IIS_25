import React, { useState, useEffect } from 'react';
import './UserProfile.css';
import { usersAPI } from '../services/api';

const UserProfile = ({ user }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: ''
  });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

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
      setError('Failed to load user data');
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
      setProfileSuccess('Profile has been successfully updated');
      await loadUserDetails();
      
      setTimeout(() => {
        setIsEditingProfile(false);
        setProfileSuccess('');
      }, 2000);
    } catch (err) {
      setProfileError(err.message || 'Profile update failed');
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
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.new_password1.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    try {
      await usersAPI.changePassword(passwordData);
      setPasswordSuccess('Password has been successfully changed');
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
      setPasswordError(err.message || 'Password change failed');
      console.error('Password change error:', err);
    }
  };



  if (loading) {
    return (
      <div className="user-profile">
        <div className="loading-state">
          <p>Loading profile...</p>
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
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile">
      <div className="profile-container">
        <div className="profile-header">
          
          <div className="profile-header-info">
            <h1>{userDetails?.first_name} {userDetails?.last_name}</h1>
            
          </div>
        </div>

        <div className="profile-details">
          <div className="section-header">
            <h2>Personal Information</h2>
            {!isEditingProfile && (
              <button 
                className="button button-edit"
                onClick={() => setIsEditingProfile(true)}
              >
                Edit
              </button>
            )}
          </div>

          {isEditingProfile ? (
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
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    className="input-field"
                    placeholder="Enter first name"
                    value={profileData.first_name}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    className="input-field"
                    placeholder="Enter last name"
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
                    placeholder="Enter email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="button button-primary">
                    Save Changes
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
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="details-grid">
              <div className="detail-item">
                <div className="detail-content">
                  <label>Username</label>
                  <p>{userDetails?.username}</p>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-content">
                  <label>Email</label>
                  <p>{userDetails?.email || 'Not set'}</p>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-content">
                  <label>First Name</label>
                  <p>{userDetails?.first_name || 'Not set'}</p>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-content">
                  <label>Last Name</label>
                  <p>{userDetails?.last_name || 'Not set'}</p>
                </div>
              </div>

            

              <div className="detail-item">
                <div className="detail-content">
                  <label>User ID</label>
                  <p>#{userDetails?.id}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {!isEditingProfile && (
          <div className="profile-actions">
            <button 
              className="button button-secondary"
              onClick={() => setIsEditingPassword(!isEditingPassword)}
            >
             {isEditingPassword ? 'Cancel Password Change' : 'Change Password'}
            </button>
          </div>
        )}

        {isEditingPassword && (
          <div className="password-change-section">
            <h2>Change Password</h2>
            
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
                <label className="form-label">Old Password</label>
                <input
                  type="password"
                  name="old_password"
                  className="input-field"
                  placeholder="Enter old password"
                  value={passwordData.old_password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  name="new_password1"
                  className="input-field"
                  placeholder="Enter new password (min. 8 characters)"
                  value={passwordData.new_password1}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  name="new_password2"
                  className="input-field"
                  placeholder="Enter new password again"
                  value={passwordData.new_password2}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="button button-primary">
                  Save New Password
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
                  Cancel
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