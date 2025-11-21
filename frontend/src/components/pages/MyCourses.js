import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyCourses.css';
import { coursesAPI, registrationsAPI, gradesAPI } from '../services/api';

const MyCourses = () => {
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState(null);

  useEffect(() => {
    loadMyCourses();
  }, []);

  const loadMyCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all courses (will filter enrolled ones)
      const allCourses = await coursesAPI.getCourses();
      
      // Get my registrations
      const registrations = await registrationsAPI.getMyRegistrations();
      
      // Get my grades
      const grades = await gradesAPI.getGrades();

      // Filter courses where I'm enrolled
      const myCourses = allCourses.filter(course => 
        registrations.some(reg => reg.term && reg.term.course_id === course.id)
      );

      // Transform data
      const transformedCourses = myCourses.map(course => {
        // Get all registrations for this course
        const courseRegistrations = registrations.filter(reg => 
          reg.term && reg.term.course_id === course.id
        );

        // Calculate grades
        const courseGrades = courseRegistrations
          .map(reg => reg.grade?.value)
          .filter(grade => grade !== null && grade !== undefined);

        const averageGrade = courseGrades.length > 0
          ? Math.round(courseGrades.reduce((a, b) => parseFloat(a) + parseFloat(b), 0) / courseGrades.length)
          : null;

        // Calculate progress
        const totalTerms = courseRegistrations.length;
        const completedTerms = courseRegistrations.filter(reg => reg.grade).length;
        const progress = totalTerms > 0 ? Math.round((completedTerms / totalTerms) * 100) : 0;

        return {
          id: course.id,
          name: course.title,
          code: course.code,
          type: getCourseType(course.type),
          instructor: course.guarantee 
            ? `${course.guarantee.first_name} ${course.guarantee.last_name}`
            : 'Neznámý',
          status: 'Schválený', // All registered courses are approved
          progress: progress,
          totalTerms: totalTerms,
          completedTerms: completedTerms,
          overallGrade: averageGrade,
          registrations: courseRegistrations
        };
      });

      setEnrolledCourses(transformedCourses);
    } catch (err) {
      setError('Nepodařilo se načíst kurzy');
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCourseType = (type) => {
    const typeMap = {
      'LECTURE': 'Přednáška',
      'EXERCISE': 'Cvičení',
      'EXAM': 'Zkouška'
    };
    return typeMap[type] || type || 'Kurz';
  };

  const handleViewDetails = async (course) => {
    try {
      // Load detailed term information
      const termsWithGrades = course.registrations.map(reg => ({
        id: reg.id,
        name: reg.term ? getCourseType(reg.term.type) : 'Neznámý termín',
        date: reg.term 
          ? new Date(reg.term.start_time).toLocaleDateString('cs-CZ')
          : 'Neznámé datum',
        grade: reg.grade ? parseFloat(reg.grade.value) : null,
        status: reg.grade ? 'Hodnoceno' : 'Čeká na hodnocení',
        registeredAt: new Date(reg.registered_at).toLocaleDateString('cs-CZ'),
        gradedBy: reg.graded_by ? reg.graded_by.join(', ') : null,
        gradedAt: reg.grade ? new Date(reg.grade.graded_at).toLocaleDateString('cs-CZ') : null
      }));

      setSelectedCourseDetails({
        ...course,
        terms: termsWithGrades
      });
      setSelectedCourse(course);
    } catch (err) {
      console.error('Error loading course details:', err);
    }
  };

  const handleCloseDetails = () => {
    setSelectedCourse(null);
    setSelectedCourseDetails(null);
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

  const activeCourses = enrolledCourses.filter(c => c.status === 'Schválený');
  const totalCompletedTerms = enrolledCourses.reduce((sum, c) => sum + c.completedTerms, 0);
  const averageGrade = enrolledCourses.filter(c => c.overallGrade).length > 0
    ? Math.round(
        enrolledCourses
          .filter(c => c.overallGrade)
          .reduce((sum, c) => sum + c.overallGrade, 0) /
        enrolledCourses.filter(c => c.overallGrade).length
      )
    : 0;

  return (
    <div className="my-courses">
      {/* Summary Statistics */}
      <div className="stats-summary">
        <div className="stat-box">
          <div className="stat-number">{activeCourses.length}</div>
          <div className="stat-label">Aktivní kurzy</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">{totalCompletedTerms}</div>
          <div className="stat-label">Dokončené termíny</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">{averageGrade}</div>
          <div className="stat-label">Průměrné hodnocení</div>
        </div>
      </div>

      {/* Courses List */}
      {enrolledCourses.length === 0 ? (
        <div className="empty-state">
          <p>Nejste zapsaní do žádných kurzů</p>
          <button className="button" onClick={() => navigate('/courses')}>
            Prohlédnout dostupné kurzy
          </button>
        </div>
      ) : (
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

                {course.status === 'Schválený' && course.registrations.length > 0 && (
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
      )}

      {selectedCourse && selectedCourseDetails && (
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
                    <th>Datum registrace</th>
                    <th>Hodnocení</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCourseDetails.terms.length > 0 ? (
                    selectedCourseDetails.terms.map(term => (
                      <tr key={term.id}>
                        <td>{term.name}</td>
                        <td>{term.registeredAt}</td>
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