import React, { useState, useEffect } from 'react';
import './AdminUsers.css';
import { usersAPI } from '../services/api';

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [changingPasswordUser, setChangingPasswordUser] = useState(null);
  const [expandedFields, setExpandedFields] = useState({});
  const [editFormData, setEditFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    role: ''
  });
  const [passwordFormData, setPasswordFormData] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersAPI.getUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(user =>
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

 
  const toggleFieldExpansion = (userId, field) => {
    const key = `${userId}-${field}`;
    setExpandedFields(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const truncateText = (text, maxLength = 20) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const isFieldExpanded = (userId, field) => {
    return expandedFields[`${userId}-${field}`];
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditFormData({
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email || '',
      role: user.role
    });
  };

  const handleChangePassword = (user) => {
    setChangingPasswordUser(user);
    setPasswordFormData({
      new_password: '',
      confirm_password: ''
    });
    setPasswordError('');
  };

  const handlePasswordFormChange = (e) => {
    setPasswordFormData({
      ...passwordFormData,
      [e.target.name]: e.target.value
    });
    setPasswordError('');
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
  
    if (passwordFormData.new_password !== passwordFormData.confirm_password) {
      setPasswordError('Passwords do not match');
      return;
    }
  
    if (passwordFormData.new_password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
  
    try {
      await usersAPI.changeUserPassword(changingPasswordUser.id, {
        new_password: passwordFormData.new_password
      });
      
      alert('User password has been successfully changed');
      setChangingPasswordUser(null);
      setPasswordFormData({
        new_password: '',
        confirm_password: ''
      });
    } catch (err) {
      console.error('Full error:', err);
      setPasswordError(err.message || 'Changing password failed');
    }
  };

  const handleCancelPasswordChange = () => {
    setChangingPasswordUser(null);
    setPasswordFormData({
      new_password: '',
      confirm_password: ''
    });
    setPasswordError('');
  };

  const handleEditFormChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await usersAPI.updateUser(editingUser.id, editFormData);
      alert('User has been successfully updated');
      setEditingUser(null);
      await loadUsers();
    } catch (err) {
      alert(err.message || 'Updating user failed');
      console.error('Error updating user:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditFormData({
      username: '',
      first_name: '',
      last_name: '',
      email: '',
      role: ''
    });
  };

  const handleDeleteUser = async (id, username) => {
    if (!window.confirm(`Do you really want to delete user ${username}?`)) {
      return;
    }

    try {
      await usersAPI.deleteUser(id);
      alert('User has been deleted');
      await loadUsers();
    } catch (err) {
      alert(err.message || 'Deleting user failed');
      console.error('Error deleting user:', err);
    }
  };

 

  if (loading) {
    return (
      <div className="admin-users">
        <div className="loading-state">
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-users">
        <div className="error-state">
          <p>{error}</p>
          <button className="button" onClick={loadUsers}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <div className="search-section">
        <div className="search-inputs">
          <div className="form-group">
            <input
              type="text"
              className="input-field"
              placeholder="Search users (name, username, email)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="empty-state">
          <p>No users found</p>
        </div>
      ) : (
        <div className="users-table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Name</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => {
                const fullName = `${user.first_name} ${user.last_name}`;
                const username = user.username;
                const email = user.email || '-';
                
                const isNameLong = fullName.length > 25;
                const isUsernameLong = username.length > 20;
                const isEmailLong = email.length > 25;

                return (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>
                      <div className="expandable-cell">
                        <strong>
                          {isFieldExpanded(user.id, 'username') || !isUsernameLong
                            ? username
                            : truncateText(username, 20)}
                        </strong>
                        {isUsernameLong && (
                          <button 
                            className="expand-button"
                            onClick={() => toggleFieldExpansion(user.id, 'username')}
                          >
                            {isFieldExpanded(user.id, 'username') ? 'Show less' : 'Show more'}
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="expandable-cell">
                        <span>
                          {isFieldExpanded(user.id, 'name') || !isNameLong
                            ? fullName
                            : truncateText(fullName, 25)}
                        </span>
                        {isNameLong && (
                          <button 
                            className="expand-button"
                            onClick={() => toggleFieldExpansion(user.id, 'name')}
                          >
                            {isFieldExpanded(user.id, 'name') ? 'Show less' : 'Show more'}
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="expandable-cell">
                        <span>
                          {isFieldExpanded(user.id, 'email') || !isEmailLong
                            ? email
                            : truncateText(email, 25)}
                        </span>
                        {isEmailLong && email !== '-' && (
                          <button 
                            className="expand-button"
                            onClick={() => toggleFieldExpansion(user.id, 'email')}
                          >
                            {isFieldExpanded(user.id, 'email') ? 'Show less' : 'Show more'}
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="button button-warning button-small"
                          onClick={() => handleEditUser(user)}
                        >
                          Edit
                        </button>
                        <button 
                          className="button button-secondary button-small"
                          onClick={() => handleChangePassword(user)}
                        >
                          Change Password
                        </button>
                        {user.role !== 'ADMIN' && (
                          <button 
                            className="button button-danger button-small"
                            onClick={() => handleDeleteUser(user.id, user.username)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editingUser && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit User: {editingUser.username}</h2>
              <button className="close-button" onClick={handleCancelEdit}>×</button>
            </div>

            <form onSubmit={handleSaveEdit} className="edit-form">
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  className="input-field"
                  value={editFormData.username}
                  onChange={handleEditFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  className="input-field"
                  value={editFormData.first_name}
                  onChange={handleEditFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  className="input-field"
                  value={editFormData.last_name}
                  onChange={handleEditFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="input-field"
                  value={editFormData.email}
                  onChange={handleEditFormChange}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="button button-success">
                  Save Changes
                </button>
                <button 
                  type="button" 
                  className="button button-secondary"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {changingPasswordUser && (
        <div className="modal-overlay" onClick={handleCancelPasswordChange}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Change Password: {changingPasswordUser.username}</h2>
              <button className="close-button" onClick={handleCancelPasswordChange}>×</button>
            </div>

            <form onSubmit={handleSavePassword} className="edit-form">
              {passwordError && (
                <div className="error-message">
                  {passwordError}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  name="new_password"
                  className="input-field"
                  placeholder="Enter new password (min. 8 characters)"
                  value={passwordFormData.new_password}
                  onChange={handlePasswordFormChange}
                  required
                  minLength={8}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  name="confirm_password"
                  className="input-field"
                  placeholder="Enter new password again"
                  value={passwordFormData.confirm_password}
                  onChange={handlePasswordFormChange}
                  required
                  minLength={8}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="button button-success">
                  Change Password
                </button>
                <button 
                  type="button" 
                  className="button button-secondary"
                  onClick={handleCancelPasswordChange}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;