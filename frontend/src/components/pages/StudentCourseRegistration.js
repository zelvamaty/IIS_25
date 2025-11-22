import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './StudentCourseRegistration.css';
import { coursesAPI, termsAPI, registrationsAPI } from '../services/api';

const StudentCourseRegistration = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [terms, setTerms] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [myEnrollment, setMyEnrollment] = useState(null);
  useEffect(() => {
    loadCourseDetails();
  }, [id]);

  const loadCourseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
  
      const courseData = await coursesAPI.getCourseDetail(id);
      setCourse(courseData);
      console.log('Course data:', courseData); // DEBUG
  
      const allTerms = await termsAPI.getTerms();
      const courseTerms = allTerms.filter(t => t.course?.id === parseInt(id));
      setTerms(courseTerms);
  
      // Načítaj moje registrácie
      try {
        const registrations = await registrationsAPI.getMyRegistrations();
        setMyRegistrations(registrations);
      } catch (err) {
        console.error('Error loading registrations:', err);
      }
  
      // Zisti či som zapísaný v kurze
    // Zisti či som zapísaný v kurze
try {
  const enrollments = await coursesAPI.getMyCourses(); // ✅ Použite getMyCourses namiesto getMyEnrollments
  console.log('My enrollments:', enrollments); // DEBUG
  console.log('Looking for course ID:', parseInt(id)); // DEBUG
  
  const courseEnrollment = enrollments.find(e => {
    console.log('Checking enrollment:', e, 'course ID:', e.id); // ✅ OPRAVENÉ - použite e.id nie e.course?.id
    return e.id === parseInt(id);
  });
  
  console.log('Found enrollment:', courseEnrollment); // DEBUG
  
  if (courseEnrollment) {
    setIsEnrolled(true);
    setMyEnrollment(courseEnrollment);
  } else {
    setIsEnrolled(false);
    setMyEnrollment(null);
  }
} catch (err) {
  console.error('Error checking enrollment:', err);
  setIsEnrolled(false);
  setMyEnrollment(null);
}
  
    } catch (err) {
      setError('Nepodařilo se načíst detail kurzu');
      console.error('Error loading course:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveCourse = async () => {
    if (!window.confirm(`Opravdu chcete ukončit kurz "${course.title}"? Tato akce je nevratná.`)) {
      return;
    }
  
    try {
      setRegistering(true);
      await coursesAPI.leaveCourse(id);
      alert('Úspěšně jste ukončili kurz');
      navigate('/student/my-courses');
    } catch (err) {
      alert(err.message || 'Ukončení kurzu se nezdařilo');
      console.error('Error leaving course:', err);
    } finally {
      setRegistering(false);
    }
  };

  const handleRegisterTerm = async (termId) => {
    if (!window.confirm('Opravdu se chcete registrovat na tento termín?')) {
      return;
    }

    try {
      setRegistering(true);
      await registrationsAPI.registerForTerm(termId);
      alert('Úspěšně jste se zaregistrovali na termín!');
      await loadCourseDetails();
    } catch (err) {
      if (err.message.includes('Already registered')) {
        alert('Již jste registrováni na tento termín');
      } else {
        alert(err.message || 'Registrace na termín se nezdařila');
      }
      console.error('Error registering for term:', err);
    } finally {
      setRegistering(false);
    }
  };

  const handleEnrollCourse = async () => {
    if (!window.confirm(`Opravdu se chcete zapsat do kurzu "${course.title}"?`)) {
      return;
    }

    try {
      setRegistering(true);
      await coursesAPI.enrollCourse(id);
      
      if (course.auto_confirm) {
        alert('Úspěšně jste se zapsali do kurzu!');
      } else {
        alert('Žádost o zápis byla odeslána. Čekejte na schválení garantem.');
      }
      
      navigate('/student/my-courses');
    } catch (err) {
      alert(err.message || 'Zápis do kurzu se nezdařil');
      console.error('Error enrolling in course:', err);
    } finally {
      setRegistering(false);
    }
  };

  const getTermTypeName = (type) => {
    const typeMap = {
      'LECTURE': 'Přednáška',
      'EXERCISE': 'Cvičení',
      'EXAM': 'Zkouška'
    };
    return typeMap[type] || type;
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('cs-CZ'),
      time: date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const isTermFull = (term) => {
    return term.registrations_count >= term.capacity;
  };

  const getMyRegistrationForTerm = (termId) => {
    return myRegistrations.find(reg => reg.term === termId);
  };

  const getGradeDisplay = (grade) => {
    if (!grade) return null;
    return (
      <div className="grade-display">
        <span className="grade-label">Hodnocení:</span>
        <span className="grade-value">{grade.value}</span>
        {grade.graded_at && (
          <span className="grade-date">
            ({new Date(grade.graded_at).toLocaleDateString('cs-CZ')})
          </span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="student-course-registration">
        <div className="loading-state">
          <p>Načítání detailu kurzu...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="student-course-registration">
        <div className="error-state">
          <p>{error || 'Kurz nebyl nalezen'}</p>
          <button className="button" onClick={() => navigate('/courses')}>
            ← Zpět na kurzy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-course-registration">
      <button className="button button-secondary" onClick={() => navigate('/courses')}>
        ← Zpět na seznam kurzů
      </button>


      <div className="course-detail-card">
        <div className="course-header">
          <h2>{course.title}</h2>
          <span className="course-code">{course.code}</span>
        </div>
        
        <div className="course-info">
          <p><strong>Garant:</strong> {course.guarantee 
            ? `${course.guarantee.first_name} ${course.guarantee.last_name}`
            : 'Neznámý'}</p>
          
          {course.description && (
            <p><strong>Popis:</strong> {course.description}</p>
          )}
          
          <p><strong>Kapacita:</strong> {course.enrolled_count}/{course.capacity}</p>
          <p><strong>Cena:</strong> {course.price} Kč</p>
          
          {course.auto_confirm && (
            <p className="info-badge">✓ Automatické schválení po zápisu</p>
          )}
        </div>
        <div className="course-actions">
  {isEnrolled ? (
    <button 
      className="button button-danger"
      onClick={handleLeaveCourse}
      disabled={registering}
    >
      {registering ? '⏳ Ukončuji...' : '🚪 Ukončit kurz'}
    </button>
  ) : (
    <button 
      className="button button-success"
      onClick={handleEnrollCourse}
      disabled={registering || course.enrolled_count >= course.capacity}
    >
      {registering ? '⏳ Zapisuji...' : '📝 Zapsat se do k]urzu'}
    </button>
  )}
</div>
      </div>

      <h2 className="section-title">Dostupné termíny ({terms.length})</h2>

      {terms.length === 0 ? (
        <div className="empty-state">
          <p>Pro tento kurz zatím nejsou vytvořené žádné termíny</p>
        </div>
      ) : (
        <div className="terms-grid">
          {terms.map(term => {
            const { date, time } = formatDateTime(term.start_time);
            const isFull = isTermFull(term);
            const myRegistration = getMyRegistrationForTerm(term.id);
            const isRegistered = !!myRegistration;
            
            return (
              <div key={term.id} className={`term-card ${isRegistered ? 'registered' : ''}`}>
                <div className="term-card-header">
                  <h3>{getTermTypeName(term.type)}</h3>
                  {isFull && <span className="badge badge-warning">Plno</span>}
                  {isRegistered && <span className="badge badge-success">✓ Registrován</span>}
                </div>
                
                <div className="term-card-body">
                  <div className="term-info-item">
                    <span className="term-icon">📅</span>
                    <span>Datum: {date}</span>
                  </div>
                  <div className="term-info-item">
                    <span className="term-icon">🕐</span>
                    <span>Čas: {time}</span>
                  </div>
                  <div className="term-info-item">
                    <span className="term-icon">📍</span>
                    <span>Místnost: {term.room || 'Neurčeno'}</span>
                  </div>
                  <div className="term-info-item">
                    <span className="term-icon">👥</span>
                    <span>Obsazeno: {term.registrations_count || 0}/{term.capacity}</span>
                  </div>

                  {/* Zobraz hodnotenie ak existuje */}
                  {isRegistered && myRegistration.grade && (
                    <div className="term-grade">
                      {getGradeDisplay(myRegistration.grade)}
                    </div>
                  )}
                </div>
                
                {term.requires_registration && !isRegistered && (
                  <div className="term-card-footer">
                    <button 
                      className={`button full-width ${isFull ? '' : 'button-success'}`}
                      onClick={() => handleRegisterTerm(term.id)}
                      disabled={registering}
                    >
                      {isFull ? '📋 Čekací listina' : '✓ Registrovat'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentCourseRegistration;