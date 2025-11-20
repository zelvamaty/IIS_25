import React, { useState } from 'react';
import './AdminUsers.css';

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [users] = useState([
    { 
      id: 1, 
      name: 'Jan Novák', 
      email: 'jan.novak@example.com', 
      role: 'Student', 
      registered: '15.01.2025',
      status: 'Aktivní' 
    },
    { 
      id: 2, 
      name: 'Marie Svobodová', 
      email: 'marie.svobodova@example.com', 
      role: 'Lektor', 
      registered: '10.01.2025',
      status: 'Aktivní' 
    },
    { 
      id: 3, 
      name: 'Petr Dvořák', 
      email: 'petr.dvorak@example.com', 
      role: 'Garant', 
      registered: '05.01.2025',
      status: 'Aktivní' 
    },
    { 
      id: 4, 
      name: 'Jana Procházková', 
      email: 'jana.prochazkova@example.com', 
      role: 'Student', 
      registered: '20.01.2025',
      status: 'Neaktivní' 
    },
    { 
      id: 5, 
      name: 'Tomáš Černý', 
      email: 'tomas.cerny@example.com', 
      role: 'Lektor', 
      registered: '12.01.2025',
      status: 'Aktivní' 
    },
    { 
      id: 6, 
      name: 'Lucie Veselá', 
      email: 'lucie.vesela@example.com', 
      role: 'Student', 
      registered: '18.01.2025',
      status: 'Aktivní' 
    }
  ]);

  const handleSearch = () => {
    console.log('Searching:', searchTerm, roleFilter);
  };

  const handleViewUser = (id) => {
    console.log('View user:', id);
  };

  const handleEditUser = (id) => {
    console.log('Edit user:', id);
  };

  const handleDeleteUser = (id) => {
    console.log('Delete user:', id);
  };

  return (
    <div className="admin-users">

      <div className="search-section">
        <div className="search-inputs">
          <div className="form-group">
            <input
              type="text"
              className="input-field"
              placeholder="Hledat uživatele..."
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
              <option value="student">Student</option>
              <option value="lektor">Lektor</option>
              <option value="garant">Garant</option>
              <option value="admin">Administrátor</option>
            </select>
          </div>
          <button className="button" onClick={handleSearch}>
            Hledat
          </button>
        </div>
      </div>

      <div className="users-table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Jméno</th>
              <th>Email</th>
              <th>Role</th>
              <th>Registrován</th>
              <th>Stav</th>
              <th>Akce</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className="badge badge-info">
                    {user.role}
                  </span>
                </td>
                <td>{user.registered}</td>
                <td>
                  <span className={`badge ${user.status === 'Aktivní' ? 'badge-success' : 'badge-warning'}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="button button-small"
                      onClick={() => handleViewUser(user.id)}
                    >
                      Detail
                    </button>
                    <button 
                      className="button button-warning button-small"
                      onClick={() => handleEditUser(user.id)}
                    >
                      Upravit
                    </button>
                    <button 
                      className="button button-danger button-small"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Smazat
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;