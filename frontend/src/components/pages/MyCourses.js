import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyCourses.css';
import { coursesAPI } from '../services/api';

const MyCourses = () => {
  const navigate = useNavigate();
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMyCourses();
  }, []);

  const loadMyCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const courses = await coursesAPI.getMyCourses();
      setMyCourses(courses);

    } catch (err) {
      setError('Nepodařilo se načíst kurzy');
      console.error('Error loading my courses:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="my-courses">
        <div className="loading-state">
          <p>Načítání kurzů...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-courses">
        <div className="error-state">
          <p>{error}</p>
          <button className="button" onClick={loadMyCourses}>
            Zkusit znovu
          </button>
        </div>
      </div>
    );
  }

  const approvedCourses = myCourses.filter(c => c.role === 'APPROVED');
  const pendingCourses = myCourses.filter(c => c.role === 'PENDING');

  return (
    <div className="my-courses">
      <h1 className="page-title">Zapsané kurzy</h1>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{approvedCourses.length}</div>
          <div className="stat-label">AKTIVNÍ KURZY</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{pendingCourses.length}</div>
          <div className="stat-label">ČEKAJÍCÍ NA SCHVÁLENÍ</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{myCourses.length}</div>
          <div className="stat-label">CELKEM KURZŮ</div>
        </div>
      </div>

      {/* Pending Courses */}
      {pendingCourses.length > 0 && (
        <div className="courses-section">
          <h2 className="section-title">⏳ Čekající na schválení</h2>
          <div className="courses-list">
            {pendingCourses.map(course => (
              <div key={course.id} className="course-card pending">
                <div className="course-header">
                  <h3>{course.title}</h3>
                  <span className="course-code">{course.code}</span>
                  <span className="badge badge-warning">Čeká na schválení</span>
                </div>
                <div className="course-body">
                  <p><strong>Garant:</strong> {course.guarantee}</p>
                </div>
                <div className="course-footer">
                  <button 
                    className="button"
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    Detail kurzu
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved Courses */}
      <div className="courses-section">
        <h2 className="section-title">✅ Schválené kurzy</h2>
        
        {approvedCourses.length === 0 ? (
          <div className="empty-state">
            <p>Zatím nemáte žádné schválené kurzy</p>
            <button className="button" onClick={() => navigate('/courses')}>
              Prohlédnout dostupné kurzy
            </button>
          </div>
        ) : (
          <div className="courses-list">
            {approvedCourses.map(course => (
              <div key={course.id} className="course-card approved">
                <div className="course-header">
                  <h3>{course.title}</h3>
                  <span className="course-code">{course.code}</span>
                  <span className="badge badge-success">✓ Schváleno</span>
                </div>
                <div className="course-body">
                  <p><strong>Garant:</strong> {course.guarantee}</p>
                </div>
                <div className="course-footer">
                  <button 
                    className="button"
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    Detail kurzu
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {myCourses.length === 0 && (
        <div className="empty-state">
          <p>Nejste zapsání do žádných kurzů</p>
          <button className="button" onClick={() => navigate('/courses')}>
            Prohlédnout dostupné kurzy
          </button>
        </div>
      )}
    </div>
  );
};

export default MyCourses;