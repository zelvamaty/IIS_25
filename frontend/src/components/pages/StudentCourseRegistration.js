import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './StudentCourseRegistration.css';
import { coursesAPI, termsAPI } from '../services/api';

const StudentCourseRegistration = () => {
  const { id } = useParams(); // ID kurzu z URL
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    loadCourseDetails();
  }, [id]);

  const loadCourseDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load course details
      const courseData = await coursesAPI.getCourseDetail(id);
      setCourse(courseData);

      // Load all terms and filter for this course
      const allTerms = await termsAPI.getTerms();
      const courseTerms = allTerms.filter(t => t.course?.id === parseInt(id));
      setTerms(courseTerms);

    } catch (err) {
      setError('Nepodařilo se načíst detail kurzu');
      console.error('Error loading course:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterTerm = async (termId) => {
    if (!window.confirm('Opravdu se chcete registrovat na tento termín?')) {
      return;
    }

    try {
      setRegistering(true);
      await termsAPI.registerTerm(termId);
      alert('Úspěšně jste se zaregistrovali na termín!');
      await loadCourseDetails(); // Reload to get updated capacity
    } catch (err) {
      alert(err.message || 'Registrace na termín se nezdařila');
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
    return term.registered_count >= term.capacity;
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

      <h1 className="page-title">Detail kurzu</h1>

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
          <button 
            className="button button-success"
            onClick={handleEnrollCourse}
            disabled={registering || course.enrolled_count >= course.capacity}
          >
            {registering ? '⏳ Zapisuji...' : '📝 Zapsat se do kurzu'}
          </button>
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
            
            return (
              <div key={term.id} className="term-card">
                <div className="term-card-header">
                  <h3>{getTermTypeName(term.type)}</h3>
                  {isFull && <span className="badge badge-warning">Plno</span>}
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
                    <span>Obsazeno: {term.registered_count || 0}/{term.capacity}</span>
                  </div>
                </div>
                
                {term.requires_registration && (
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