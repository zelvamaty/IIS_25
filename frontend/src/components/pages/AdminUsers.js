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
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: ''
  });

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
      setError('Nepodařilo se načíst uživatele');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleSearch = () => {
    filterUsers();
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email || '',
      role: user.role
    });
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
      alert('Uživatel byl úspěšně upraven');
      setEditingUser(null);
      await loadUsers();
    } catch (err) {
      alert(err.message || 'Úprava uživatele se nezdařila');
      console.error('Error updating user:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditFormData({
      first_name: '',
      last_name: '',
      email: '',
      role: ''
    });
  };

  const handleDeleteUser = async (id, username) => {
    if (!window.confirm(`Opravdu chcete smazat uživatele ${username}?`)) {
      return;
    }

    try {
      await usersAPI.deleteUser(id);
      alert('Uživatel byl smazán');
      await loadUsers();
    } catch (err) {
      alert(err.message || 'Smazání uživatele se nezdařilo');
      console.error('Error deleting user:', err);
    }
  };

  const getRoleName = (role) => {
    const roleMap = {
      'ADMIN': 'Administrátor',
      'USER': 'Student',
      'GUARANTOR': 'Garant',
      'LECTURER': 'Lektor'
    };
    return roleMap[role] || role;
  };

  const getRoleBadgeClass = (role) => {
    const classMap = {
      'ADMIN': 'badge-danger',
      'USER': 'badge-info',
      'GUARANTOR': 'badge-warning',
      'LECTURER': 'badge-success'
    };
    return classMap[role] || 'badge-info';
  };

  if (loading) {
    return (
      <div className="admin-users">
        <div className="loading-state">
          <p>Načítání uživatelů...</p>
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
            Zkusit znovu
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
              placeholder="Hledat uživatele (jméno, username, email)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group">
            <select
              className="input-field"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">Všechny role</option>
              <option value="USER">Student</option>
              <option value="LECTURER">Lektor</option>
              <option value="GUARANTOR">Garant</option>
              <option value="ADMIN">Administrátor</option>
            </select>
          </div>
          <button className="button" onClick={handleSearch}>
            🔍 Hledat
          </button>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="empty-state">
          <p>Žádní uživatelé nenalezeni</p>
        </div>
      ) : (
        <div className="users-table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Uživatelské jméno</th>
                <th>Jméno a příjmení</th>
                <th>Email</th>
                <th>Role</th>
                <th>Akce</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td><strong>{user.username}</strong></td>
                  <td>{user.first_name} {user.last_name}</td>
                  <td>{user.email || '-'}</td>
                  <td>
                    <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                      {getRoleName(user.role)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="button button-warning button-small"
                        onClick={() => handleEditUser(user)}
                      >
                        ✏️ Upravit
                      </button>
                      <button 
                        className="button button-danger button-small"
                        onClick={() => handleDeleteUser(user.id, user.username)}
                      >
                        🗑️ Smazat
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upravit uživatele: {editingUser.username}</h2>
              <button className="close-button" onClick={handleCancelEdit}>×</button>
            </div>

            <form onSubmit={handleSaveEdit} className="edit-form">
              <div className="form-group">
                <label className="form-label">Jméno</label>
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
                <label className="form-label">Příjmení</label>
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

              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  name="role"
                  className="input-field"
                  value={editFormData.role}
                  onChange={handleEditFormChange}
                  required
                >
                  <option value="USER">Student</option>
                  <option value="LECTURER">Lektor</option>
                  <option value="GUARANTOR">Garant</option>
                  <option value="ADMIN">Administrátor</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="button button-success">
                  💾 Uložit změny
                </button>
                <button 
                  type="button" 
                  className="button button-secondary"
                  onClick={handleCancelEdit}
                >
                  ❌ Zrušit
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