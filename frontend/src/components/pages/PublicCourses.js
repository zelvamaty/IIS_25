import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PublicCourses.css';
import { coursesAPI } from '../services/api';

const PublicCourses = ({ user, onShowLogin }) => {  // Pridané onShowLogin prop
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  const [availableTypes, setAvailableTypes] = useState([]);
  useEffect(() => {
    loadCourses();
  }, []);
  const getTypeName = (type) => {
    const typeMap = {
      'HARDWARE': 'Hardware',
      'OS': 'Operating Systems',
      'AI': 'Artificial Intelligence',
      'WEB': 'Web Development',
      'SECURITY': 'Security',
      'NETWORKS': 'Networks',
      'OTHER': 'Other'
    };
    return typeMap[type] || type;
  };
  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await coursesAPI.getCourses();
      const approvedCourses = data.filter(course => course.approved);
      setCourses(approvedCourses);
      
      // Extrahuj unikátne typy kurzov
      const types = [...new Set(approvedCourses.map(c => c.type).filter(Boolean))];
      setAvailableTypes(types);
      
      console.log('Courses:', approvedCourses); // DEBUG
      console.log('Available types:', types); // DEBUG
    } catch (err) {
      setError('Nepodařilo se načíst kurzy. Zkuste to prosím později.');
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    if (!user) {
      // Guest user trying to enroll - show login
      if (onShowLogin) {
        onShowLogin();
      } else {
        alert('Pro zápis do kurzu se musíte přihlásit');
      }
      return;
    }

    try {
      setEnrollingCourseId(courseId);
      await coursesAPI.enrollInCourse(courseId);
      alert('Úspěšně jste se zapsali do kurzu!');
      await loadCourses();
    } catch (err) {
      console.error('Error enrolling in course:', err);
      alert(err.message || 'Zápis do kurzu se nezdařil');
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filterType || course.type === filterType;
    
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="public-courses">
        <div className="loading-state">
          <p>Načítání kurzů...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-courses">
        <div className="error-state">
          <p>{error}</p>
          <button className="button" onClick={loadCourses}>
            Zkusit znovu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="public-courses">
      <div className="filter-section">
        <h3>Filtr kurzů:</h3>
        <div className="filter-inputs">
          <div className="form-group">
            <label className="form-label">Hledat kurz</label>
            <input
              type="text"
              className="input-field"
              placeholder="Zadejte název nebo kód kurzu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group">
  <label className="form-label">Typ kurzu</label>
  <select
    className="input-field"
    value={filterType}
    onChange={(e) => setFilterType(e.target.value)}
  >
    <option value="">Všechny typy</option>
    <option value="HARDWARE">Hardware</option>
    <option value="OS">Operating Systems</option>
    <option value="AI">Artificial Intelligence</option>
    <option value="WEB">Web Development</option>
    <option value="SECURITY">Security</option>
    <option value="NETWORKS">Networks</option>
    <option value="OTHER">Other</option>
  </select>
</div>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="empty-state">
          <p>Žádné kurzy nenalezeny</p>
        </div>
      ) : (
        <div className="courses-grid">
          {filteredCourses.map(course => {
            const isFull = course.enrolled_count >= course.capacity;
            const isEnrolling = enrollingCourseId === course.id;

            return (
              <div key={course.id} className="course-card">
                <div className="course-card-header">
                  <h3>{course.title}</h3>
                  <span className="course-code">{course.code}</span>
                </div>
                <div className="course-card-body">
                {course.type && (
  <p>
    <strong>Typ:</strong> {getTypeName(course.type)}
  </p>
)}
                  <p>
                    <strong>Popis:</strong> {course.description || 'Bez popisu'}
                  </p>
                  <p>
                    <strong>Garant:</strong>{' '}
                    {course.guarantee 
                      ? `${course.guarantee.first_name} ${course.guarantee.last_name}`
                      : 'Neznámý'
                    }
                  </p>
                  {course.lecturers && course.lecturers.length > 0 && (
                    <p>
                      <strong>Lektoři:</strong>{' '}
                      {course.lecturers.map(l => `${l.first_name} ${l.last_name}`).join(', ')}
                    </p>
                  )}
                  <p>
                    <strong>Kapacita:</strong>{' '}
                    <span className={isFull ? 'capacity-full' : 'capacity-available'}>
                      {course.enrolled_count}/{course.capacity} míst
                    </span>
                  </p>
                  <p>
                    <strong>Cena:</strong> {course.price} Kč
                  </p>
                  {course.auto_confirm && (
                    <p className="auto-confirm-badge">
                      ✓ Automatické potvrzení
                    </p>
                  )}
                </div>
                <div className="course-card-footer">
                  {user ? (
                    <button 
                      className={`button ${isFull ? 'button-disabled' : 'button-success'}`}
                      onClick={() => handleEnroll(course.id)}
                      disabled={isFull || isEnrolling}
                    >
                      {isEnrolling ? '⏳ Zapisuji...' : isFull ? '❌ Obsazeno' : '✓ Zapsat se do kurzu'}
                    </button>
                  ) : (
                    <button 
                      className="button button-secondary"
                      onClick={() => handleEnroll(course.id)}
                    >
                      🔒 Přihlásit se pro zápis
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PublicCourses;