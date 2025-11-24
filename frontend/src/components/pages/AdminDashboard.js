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
    totalRooms: 0
  });
  const [upcomingTerms, setUpcomingTerms] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [courses, users, rooms, terms] = await Promise.all([
        coursesAPI.getCourses(),
        usersAPI.getUsers(),
        roomsAPI.getRooms(),
        termsAPI.getTerms()
      ]);

      const totalCourses = courses.length;
      const approvedCourses = courses.filter(c => c.approved).length;
      const pendingCourses = courses.filter(c => !c.approved).length;
      const totalStudents = courses.reduce((sum, c) => sum + (c.enrolled_count || 0), 0);
      const totalRooms = rooms.length;

      setStats({
        totalCourses,
        approvedCourses,
        totalStudents,
        pendingCourses,
        totalRooms
      });

      setRooms(rooms);

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
      setError('Failed to load data');
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRoomName = (roomId) => {
    if (!roomId) return 'No room';
    const room = rooms.find(r => r.id === roomId);
    return room ? (room.name || `Room ${room.id}`) : 'Not specified';
  };

  const statsCards = [
    { label: 'Total Courses', value: stats.totalCourses, color: '#3b82f6' },
    { label: 'Approved Courses', value: stats.approvedCourses, color: '#10b981' },
    { label: 'Pending Approval', value: stats.pendingCourses, color: '#f59e0b' },
    { label: 'Registered Students', value: stats.totalStudents, color: '#8b5cf6' },
    { label: 'Rooms', value: stats.totalRooms, color: '#ec4899' }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getTermTypeName = (type) => {
    const typeMap = {
      'LECTURE': 'Lecture',
      'EXERCISE': 'Exercise',
      'EXAM': 'Exam'
    };
    return typeMap[type] || type;
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-state">
          <p>Loading dashboard...</p>
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
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="stats-grid">
        {statsCards.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-value" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2>Upcoming Terms (Next 7 Days)</h2>
          {upcomingTerms.length === 0 ? (
            <div className="empty-message">
              <p>No upcoming terms in the next 7 days</p>
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
                        {term.course?.title || 'Untitled'} - {getTermTypeName(term.type)}
                      </div>
                      <div className="upcoming-instructor">
                        {term.course?.guarantee 
                          ? `${term.course.guarantee.first_name} ${term.course.guarantee.last_name}`
                          : 'Unknown'}
                      </div>
                      <div className="upcoming-time">
                        {date.time} | {getRoomName(term.room)}
                      </div>
                    </div>
                    <div className="upcoming-capacity">
                    {term.registrations_count || term.registered_count || 0}/{term.capacity}                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="quick-actions">
        <div className="actions-grid">
          <button className="action-card" onClick={() => navigate('/admin/courses')}>
            <span>Manage Courses</span>
          </button>
          <button className="action-card" onClick={() => navigate('/admin/users')}>
            <span>Manage Users</span>
          </button>
          <button className="action-card" onClick={() => navigate('/admin/rooms')}>
            <span>Manage Rooms</span>
          </button>
          <button className="action-card" onClick={() => navigate('/create-course')}>
            <span>Create Course</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;