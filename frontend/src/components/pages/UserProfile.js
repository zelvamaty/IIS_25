import React from 'react';
import './UserProfile.css';

const UserProfile = ({ user }) => {
  // Mock additional user data
  const userDetails = {
    email: 'jan.novak@example.com',
    phone: '+420 777 123 456',
    faculty: 'Fakulta informačních technologií',
    studyProgram: 'Informatika',
    year: '3. ročník',
    registrationDate: '15.09.2023',
    completedCourses: 24,
    activeCourses: 5,
    totalCredits: 180
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

  return (
    <div className="user-profile">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar" style={{ borderColor: getRoleColor(user.role) }}>
            <span className="avatar-icon">{getRoleIcon(user.role)}</span>
          </div>
          <div className="profile-header-info">
            <h1>{user.name}</h1>
            <div className="role-badge" style={{ background: getRoleColor(user.role) }}>
              {user.role}
            </div>
          </div>
        </div>

        {/* Profile Stats */}
        {user.role === 'Student' && (
          <div className="profile-stats">
            <div className="stat-item">
              <div className="stat-value">{userDetails.completedCourses}</div>
              <div className="stat-label">Dokončené kurzy</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{userDetails.activeCourses}</div>
              <div className="stat-label">Aktivní kurzy</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{userDetails.totalCredits}</div>
              <div className="stat-label">Celkem kreditů</div>
            </div>
          </div>
        )}

        {/* Profile Details */}
        <div className="profile-details">
          <h2>Osobní údaje</h2>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-icon">📧</span>
              <div className="detail-content">
                <label>Email</label>
                <p>{userDetails.email}</p>
              </div>
            </div>

            <div className="detail-item">
              <span className="detail-icon">📱</span>
              <div className="detail-content">
                <label>Telefon</label>
                <p>{userDetails.phone}</p>
              </div>
            </div>

            {user.role === 'Student' && (
              <>
                <div className="detail-item">
                  <span className="detail-icon">🏫</span>
                  <div className="detail-content">
                    <label>Fakulta</label>
                    <p>{userDetails.faculty}</p>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">📖</span>
                  <div className="detail-content">
                    <label>Studijní program</label>
                    <p>{userDetails.studyProgram}</p>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">📅</span>
                  <div className="detail-content">
                    <label>Ročník</label>
                    <p>{userDetails.year}</p>
                  </div>
                </div>
              </>
            )}

            <div className="detail-item">
              <span className="detail-icon">🗓️</span>
              <div className="detail-content">
                <label>Registrován od</label>
                <p>{userDetails.registrationDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="profile-actions">
          <button className="button button-primary">
            <span>✏️</span> Upravit profil
          </button>
          <button className="button button-secondary">
            <span>🔒</span> Změnit heslo
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;