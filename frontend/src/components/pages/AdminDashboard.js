import React from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const stats = [
    { label: 'Celkem kurzů', value: '24', icon: '📚', color: '#3b82f6' },
    { label: 'Aktivní kurzy', value: '18', icon: '✅', color: '#10b981' },
    { label: 'Registrovaní studenti', value: '342', icon: '👨‍🎓', color: '#8b5cf6' },
    { label: 'Čeká na schválení', value: '7', icon: '⏳', color: '#f59e0b' },
    { label: 'Vyučující', value: '28', icon: '👨‍🏫', color: '#06b6d4' },
    { label: 'Místnosti', value: '15', icon: '🏫', color: '#ec4899' }
  ];

  const recentActivities = [
    { action: 'Nový kurz vytvořen', detail: 'Webové technologie - Dr. Novák', time: 'Před 2 hodinami', icon: '📚' },
    { action: 'Student registrován', detail: 'Jan Novák - Informatika', time: 'Před 3 hodinami', icon: '👨‍🎓' },
    { action: 'Kurz schválen', detail: 'Databázové systémy', time: 'Před 5 hodinami', icon: '✅' },
    { action: 'Nový vyučující', detail: 'Ing. Marie Svobodová', time: 'Dnes o 09:00', icon: '👨‍🏫' },
    { action: 'Kurz uzavřen', detail: 'Umělá inteligence - kapacita naplněna', time: 'Včera', icon: '🔒' }
  ];

  const upcomingCourses = [
    { name: 'Webové technologie', instructor: 'Dr. Novák', date: '20.11.2025', students: '30/30' },
    { name: 'Databázové systémy', instructor: 'Ing. Svobodová', date: '21.11.2025', students: '24/25' },
    { name: 'Síťové technologie', instructor: 'Prof. Dvořák', date: '22.11.2025', students: '28/30' }
  ];

  return (
    <div className="admin-dashboard">

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card" style={{ borderTopColor: stat.color }}>
            <div className="stat-icon" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-value" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="dashboard-content">
        {/* Recent Activities */}
        <div className="dashboard-section">
          <h2>Nedávná aktivita</h2>
          <div className="activity-list">
            {recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">{activity.icon}</div>
                <div className="activity-content">
                  <div className="activity-action">{activity.action}</div>
                  <div className="activity-detail">{activity.detail}</div>
                </div>
                <div className="activity-time">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Courses */}
        <div className="dashboard-section">
          <h2>Nadcházející kurzy</h2>
          <div className="upcoming-list">
            {upcomingCourses.map((course, index) => (
              <div key={index} className="upcoming-item">
                <div className="upcoming-date">
                  <div className="date-day">{course.date.split('.')[0]}</div>
                  <div className="date-month">{course.date.split('.')[1]}</div>
                </div>
                <div className="upcoming-info">
                  <div className="upcoming-name">{course.name}</div>
                  <div className="upcoming-instructor">{course.instructor}</div>
                </div>
                <div className="upcoming-capacity">{course.students}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Rychlé akce</h2>
        <div className="actions-grid">
          <button className="action-card">
            <span className="action-icon">➕</span>
            <span>Přidat kurz</span>
          </button>
          <button className="action-card">
            <span className="action-icon">👤</span>
            <span>Přidat uživatele</span>
          </button>
          <button className="action-card">
            <span className="action-icon">🏫</span>
            <span>Přidat místnost</span>
          </button>
          <button className="action-card">
            <span className="action-icon">📊</span>
            <span>Exportovat data</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;