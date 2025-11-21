import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import { coursesAPI, usersAPI, roomsAPI, termsAPI } from '../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCourses: 0,
    approvedCourses: 0,
    totalStudents: 0,
    pendingCourses: 0,
    totalLecturers: 0,
    totalRooms: 0
  });
  const [upcomingTerms, setUpcomingTerms] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [courses, users, rooms, terms] = await Promise.all([
        coursesAPI.getCourses(),
        usersAPI.getUsers(),
        roomsAPI.getRooms(),
        termsAPI.getTerms()
      ]);

      // Calculate statistics
      const totalCourses = courses.length;
      const approvedCourses = courses.filter(c => c.approved).length;
      const pendingCourses = courses.filter(c => !c.approved).length;
      const totalStudents = courses.reduce((sum, c) => sum + (c.enrolled_count || 0), 0);
      const totalLecturers = users.filter(u => u.role === 'LECTURER' || u.role === 'GUARANTOR').length;
      const totalRooms = rooms.length;

      setStats({
        totalCourses,
        approvedCourses,
        totalStudents,
        pendingCourses,
        totalLecturers,
        totalRooms
      });

      // Get upcoming terms (next 7 days)
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const upcoming = terms
        .filter(term => {
          const termDate = new Date(term.start_time);
          return termDate >= today && termDate <= nextWeek;
        })
        .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
        .slice(0, 5);

      setUpcomingTerms(upcoming);

    } catch (err) {
      setError('Nepodařilo se načíst data');
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    { label: 'Celkem kurzů', value: stats.totalCourses, icon: '📚', color: '#3b82f6' },
    { label: 'Schválené kurzy', value: stats.approvedCourses, icon: '✅', color: '#10b981' },
    { label: 'Registrovaní studenti', value: stats.totalStudents, icon: '👨‍🎓', color: '#8b5cf6' },
    { label: 'Čeká na schválení', value: stats.pendingCourses, icon: '⏳', color: '#f59e0b' },
    { label: 'Vyučující', value: stats.totalLecturers, icon: '👨‍🏫', color: '#06b6d4' },
    { label: 'Místnosti', value: stats.totalRooms, icon: '🏫', color: '#ec4899' }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      time: date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getTermTypeName = (type) => {
    const typeMap = {
      'LECTURE': 'Přednáška',
      'EXERCISE': 'Cvičení',
      'EXAM': 'Zkouška'
    };
    return typeMap[type] || type;
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-state">
          <p>Načítání dashboardu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-state">
          <p>{error}</p>
          <button className="button" onClick={loadDashboardData}>
            Zkusit znovu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h1 className="page-title">Dashboard</h1>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statsCards.map((stat, index) => (
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

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {/* Upcoming Terms */}
        <div className="dashboard-section">
          <h2>Nadcházející termíny (příštích 7 dní)</h2>
          {upcomingTerms.length === 0 ? (
            <div className="empty-message">
              <p>Žádné nadcházející termíny v příštích 7 dnech</p>
            </div>
          ) : (
            <div className="upcoming-list">
              {upcomingTerms.map((term, index) => {
                const date = formatDate(term.start_time);
                return (
                  <div key={index} className="upcoming-item">
                    <div className="upcoming-date">
                      <div className="date-day">{date.day}</div>
                      <div className="date-month">{date.month}/{date.year}</div>
                    </div>
                    <div className="upcoming-info">
                      <div className="upcoming-name">
                        {term.course?.title || 'Bez názvu'} - {getTermTypeName(term.type)}
                      </div>
                      <div className="upcoming-instructor">
                        {term.course?.guarantee 
                          ? `${term.course.guarantee.first_name} ${term.course.guarantee.last_name}`
                          : 'Neznámý'}
                      </div>
                      <div className="upcoming-time">
                        📅 {date.time} | 📍 {term.room || 'Bez místnosti'}
                      </div>
                    </div>
                    <div className="upcoming-capacity">
                      {term.registered_count || 0}/{term.capacity}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="dashboard-section">
          <h2>Rychlý přehled</h2>
          <div className="quick-stats">
            <div className="quick-stat-item">
              <div className="quick-stat-label">Naplněnost kurzů</div>
              <div className="quick-stat-value">
                {stats.totalCourses > 0 
                  ? Math.round((stats.totalStudents / (stats.totalCourses * 30)) * 100) 
                  : 0}%
              </div>
            </div>
            <div className="quick-stat-item">
              <div className="quick-stat-label">Průměr studentů/kurz</div>
              <div className="quick-stat-value">
                {stats.totalCourses > 0 
                  ? Math.round(stats.totalStudents / stats.totalCourses) 
                  : 0}
              </div>
            </div>
            <div className="quick-stat-item">
              <div className="quick-stat-label">Místností k dispozici</div>
              <div className="quick-stat-value">{stats.totalRooms}</div>
            </div>
            <div className="quick-stat-item">
              <div className="quick-stat-label">Čeká na schválení</div>
              <div className="quick-stat-value" style={{ color: '#f59e0b' }}>
                {stats.pendingCourses}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Rychlé akce</h2>
        <div className="actions-grid">
          <button className="action-card" onClick={() => navigate('/admin/courses')}>
            <span className="action-icon">📚</span>
            <span>Spravovat kurzy</span>
          </button>
          <button className="action-card" onClick={() => navigate('/admin/users')}>
            <span className="action-icon">👤</span>
            <span>Spravovat uživatele</span>
          </button>
          <button className="action-card" onClick={() => navigate('/admin/rooms')}>
            <span className="action-icon">🏫</span>
            <span>Spravovat místnosti</span>
          </button>
          <button className="action-card" onClick={() => navigate('/create-course')}>
            <span className="action-icon">➕</span>
            <span>Vytvořit kurz</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;