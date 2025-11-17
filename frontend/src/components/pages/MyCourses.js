import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyCourses.css';

const MyCourses = () => {
  const navigate = useNavigate();

  // Mock data 
  const [enrolledCourses] = useState([
    {
      id: 1,
      name: 'Webové technologie',
      code: 'WEB-101',
      type: 'Přednáška',
      instructor: 'Dr. Jan Novák',
      status: 'Schválený',
      progress: 75,
      totalTerms: 12,
      completedTerms: 9,
      overallGrade: 85,
      terms: [
        { id: 1, name: 'Úvodní přednáška', date: '15.03.2025', grade: 90, status: 'Hodnoceno' },
        { id: 2, name: 'HTML a CSS', date: '22.03.2025', grade: 85, status: 'Hodnoceno' },
        { id: 3, name: 'JavaScript', date: '29.03.2025', grade: 80, status: 'Hodnoceno' },
        { id: 4, name: 'React framework', date: '05.04.2025', grade: null, status: 'Čeká na hodnocení' }
      ]
    },
    {
      id: 2,
      name: 'Databázové systémy',
      code: 'DB-201',
      type: 'Cvičení',
      instructor: 'Ing. Marie Svobodová',
      status: 'Schválený',
      progress: 60,
      totalTerms: 10,
      completedTerms: 6,
      overallGrade: 78,
      terms: [
        { id: 1, name: 'SQL základy', date: '16.03.2025', grade: 75, status: 'Hodnoceno' },
        { id: 2, name: 'Normalizace', date: '23.03.2025', grade: 80, status: 'Hodnoceno' },
        { id: 3, name: 'Indexy', date: '30.03.2025', grade: null, status: 'Registrován' }
      ]
    },
    {
      id: 3,
      name: 'Umělá inteligence',
      code: 'AI-301',
      type: 'Přednáška',
      instructor: 'Dr. Lucie Veselá',
      status: 'Čeká na schválení',
      progress: 0,
      totalTerms: 14,
      completedTerms: 0,
      overallGrade: null,
      terms: []
    }
  ]);

  const [selectedCourse, setSelectedCourse] = useState(null);

  const handleViewDetails = (course) => {
    setSelectedCourse(course);
  };

  const handleCloseDetails = () => {
    setSelectedCourse(null);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Schválený':
        return 'badge-success';
      case 'Čeká na schválení':
        return 'badge-warning';
      case 'Odmítnutý':
        return 'badge-danger';
      default:
        return 'badge-warning';
    }
  };

  const getTermStatusBadgeClass = (status) => {
    switch (status) {
      case 'Hodnoceno':
        return 'badge-success';
      case 'Čeká na hodnocení':
        return 'badge-warning';
      case 'Registrován':
        return 'badge-info';
      default:
        return 'badge-warning';
    }
  };

  return (
    <div className="my-courses">
      <h1 className="page-title">Moje kurzy</h1>

      {/* Summary Statistics */}
      <div className="stats-summary">
        <div className="stat-box">
          <div className="stat-number">{enrolledCourses.filter(c => c.status === 'Schválený').length}</div>
          <div className="stat-label">Aktivní kurzy</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">{enrolledCourses.reduce((sum, c) => sum + c.completedTerms, 0)}</div>
          <div className="stat-label">Dokončené termíny</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">
            {Math.round(
              enrolledCourses
                .filter(c => c.overallGrade)
                .reduce((sum, c) => sum + c.overallGrade, 0) /
              enrolledCourses.filter(c => c.overallGrade).length
            ) || 0}
          </div>
          <div className="stat-label">Průměrné hodnocení</div>
        </div>
      </div>

      {/* Courses List */}
      <div className="courses-list">
        {enrolledCourses.map(course => (
          <div key={course.id} className="course-item">
            <div className="course-header">
              <div className="course-title-section">
                <h3>{course.name}</h3>
                <span className="course-code">{course.code}</span>
                <span className={`badge ${getStatusBadgeClass(course.status)}`}>
                  {course.status}
                </span>
              </div>
              <div className="course-grade">
                {course.overallGrade ? (
                  <>
                    <div className="grade-number">{course.overallGrade}</div>
                    <div className="grade-label">Celkové hodnocení</div>
                  </>
                ) : (
                  <div className="grade-label">Zatím nehodnoceno</div>
                )}
              </div>
            </div>

            <div className="course-body">
              <div className="course-info-row">
                <span><strong>Typ:</strong> {course.type}</span>
                <span><strong>Lektor:</strong> {course.instructor}</span>
              </div>

              <div className="progress-section">
                <div className="progress-info">
                  <span>Pokrok: {course.completedTerms}/{course.totalTerms} termínů</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>

              {course.status === 'Schválený' && (
                <button 
                  className="button"
                  onClick={() => handleViewDetails(course)}
                >
                  Zobrazit hodnocení termínů
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedCourse && (
        <div className="modal-overlay" onClick={handleCloseDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedCourse.name} - Hodnocení termínů</h2>
              <button className="close-button" onClick={handleCloseDetails}>×</button>
            </div>

            <div className="modal-body">
              <div className="course-summary">
                <p><strong>Kód:</strong> {selectedCourse.code}</p>
                <p><strong>Lektor:</strong> {selectedCourse.instructor}</p>
                <p><strong>Celkové hodnocení:</strong> {selectedCourse.overallGrade || 'Zatím nehodnoceno'}</p>
              </div>

              <table className="table">
                <thead>
                  <tr>
                    <th>Termín</th>
                    <th>Datum</th>
                    <th>Hodnocení</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCourse.terms.length > 0 ? (
                    selectedCourse.terms.map(term => (
                      <tr key={term.id}>
                        <td>{term.name}</td>
                        <td>{term.date}</td>
                        <td>
                          {term.grade ? (
                            <span className="grade-badge">{term.grade} bodů</span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${getTermStatusBadgeClass(term.status)}`}>
                            {term.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">
                        Zatím nejsou žádné termíny
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="modal-footer">
              <button className="button button-secondary" onClick={handleCloseDetails}>
                Zavřít
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCourses;