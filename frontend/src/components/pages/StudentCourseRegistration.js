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

  const handleUnregisterFromTerm = async (registrationId) => {
    try {
      setRegistering(true);
      console.log('Calling API to delete registration:', registrationId);
      const result = await termsAPI.deleteRegistration(registrationId);
      console.log('API response:', result);
      alert('You have successfully unregistered from the term');
      await loadCourseDetails();
    } catch (err) {
      console.error('Full error:', err);
      alert(err.message || 'Unregistering from term failed');
    } finally {
      setRegistering(false);
    }
  };

  const loadCourseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
  
      const courseData = await coursesAPI.getCourseDetail(id);
      setCourse(courseData);
  
      const allTerms = await termsAPI.getTerms();
      const courseTerms = allTerms.filter(t => t.course?.id === parseInt(id));
      setTerms(courseTerms);
  
      try {
        const registrations = await registrationsAPI.getMyRegistrations();
        setMyRegistrations(registrations);
      } catch (err) {
        console.error('Error loading registrations:', err);
      }
  
      try {
        const enrollments = await coursesAPI.getMyCourses();
        
        const courseEnrollment = enrollments.find(e => {
          return e.id === parseInt(id);
        });
        
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
      setError('Failed to load course details');
      console.error('Error loading course:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveCourse = async () => {
    try {
      setRegistering(true);
      await coursesAPI.leaveCourse(id);
      alert('You have successfully left the course');
      navigate('/student/my-courses');
    } catch (err) {
      alert(err.message || 'Leaving course failed');
      console.error('Error leaving course:', err);
    } finally {
      setRegistering(false);
    }
  };

  const handleRegisterTerm = async (termId) => {
    try {
      setRegistering(true);
      await registrationsAPI.registerForTerm(termId);
      alert('You have successfully registered for the term!');
      await loadCourseDetails();
    } catch (err) {
      if (err.message.includes('Already registered')) {
        alert('You are already registered for this term');
      } else {
        alert(err.message || 'Registration for term failed');
      }
      console.error('Error registering for term:', err);
    } finally {
      setRegistering(false);
    }
  };

  const handleEnrollCourse = async () => {
    try {
      setRegistering(true);
      await coursesAPI.enrollCourse(id);
      
      if (course.auto_confirm) {
        alert('You have successfully enrolled in the course!');
      } else {
        alert('Enrollment request has been sent. Wait for guarantor approval.');
      }
      
      navigate('/student/my-courses');
    } catch (err) {
      alert(err.message || 'Course enrollment failed');
      console.error('Error enrolling in course:', err);
    } finally {
      setRegistering(false);
    }
  };

  const getTermTypeName = (type) => {
    const typeMap = {
      'LECTURE': 'Lecture',
      'EXERCISE': 'Exercise',
      'EXAM': 'Exam'
    };
    return typeMap[type] || type;
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US'),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const isTermFull = (term) => {
    return term.registrations_count >= term.capacity;
  };

  const getMyRegistrationForTerm = (termId) => {
    const reg = myRegistrations.find(reg => reg.term === termId);
    return reg;
  };

  const getGradeDisplay = (grade) => {
    if (!grade) return null;
    return (
      <div className="grade-display">
        <span className="grade-label">Grade:</span>
        <span className="grade-value">{grade.value}</span>
        {grade.graded_at && (
          <span className="grade-date">
            ({new Date(grade.graded_at).toLocaleDateString('en-US')})
          </span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="student-course-registration">
        <div className="loading-state">
          <p>Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="student-course-registration">
        <div className="error-state">
          <p>{error || 'Course not found'}</p>
          <button className="button" onClick={() => navigate('/courses')}>
            ← Back to courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-course-registration">
      <button className="button button-secondary" onClick={() => navigate('/courses')}>
        ← Back to course list
      </button>

      <div className="course-detail-card">
        <div className="course-header">
          <h2>{course.title}</h2>
          <span className="course-code">{course.code}</span>
        </div>
        
        <div className="course-info">
          <p><strong>Guarantor:</strong> {course.guarantee 
            ? `${course.guarantee.first_name} ${course.guarantee.last_name}`
            : 'Unknown'}</p>
          
          {course.description && (
            <p><strong>Description:</strong> {course.description}</p>
          )}
          
          <p><strong>Capacity:</strong> {course.enrolled_count}/{course.capacity}</p>
          <p><strong>Price:</strong> {course.price} CZK</p>
          
          {course.auto_confirm && (
            <p className="info-badge">✓ Automatic approval after enrollment</p>
          )}
        </div>

        <div className="course-actions">
          {isEnrolled ? (
            <button 
              className="button button-danger"
              onClick={handleLeaveCourse}
              disabled={registering}
            >
              {registering ? 'Leaving...' : ' Leave Course'}
            </button>
          ) : (
            <button 
              className="button button-success"
              onClick={handleEnrollCourse}
              disabled={registering || course.enrolled_count >= course.capacity}
            >
              {registering ? 'Enrolling...' : ' Enroll in Course'}
            </button>
          )}
        </div>
      </div>

      <h2 className="section-title">Available Terms ({terms.length})</h2>

      {terms.length === 0 ? (
        <div className="empty-state">
          <p>No terms have been created for this course yet</p>
        </div>
      ) : (
        <div className="terms-grid">
          {terms.map(term => {
            console.log('Rendering term:', term);
            const { date, time } = formatDateTime(term.start_time);
            const isFull = isTermFull(term);
            const myRegistration = getMyRegistrationForTerm(term.id);
            const isRegistered = !!myRegistration;
            
            return (
              <div key={term.id} className={`term-card ${isRegistered ? 'registered' : ''}`}>
              <div className="term-card-header">
  <div>
    {term.title ? (
      
      <>
        <h3>{term.title}</h3>
        <p className="term-type">{getTermTypeName(term.type)}</p>
      </>
    ) : (
      <h3>{getTermTypeName(term.type)}</h3>
    )}
  </div>
  <div className="term-badges">
    {isFull && <span className="badge badge-warning">Full</span>}
    {isRegistered && <span className="badge badge-success">✓ Registered</span>}
  </div>
</div>
                
                {term.description && (
                  <div className="term-description">
                    <p>{term.description}</p>
                  </div>
                )}
                
                <div className="term-card-body">
                  <div className="term-info-item">
                    <span className="term-icon">📅</span>
                    <span>Date: {date}</span>
                  </div>
                  <div className="term-info-item">
                    <span className="term-icon">🕐</span>
                    <span>Time: {time}</span>
                  </div>
                  <div className="term-info-item">
                    <span className="term-icon">📍</span>
                    <span>Room: {term.room || 'Not specified'}</span>
                  </div>
                  <div className="term-info-item">
                    <span className="term-icon">👥</span>
                    <span>Occupied: {term.registrations_count || 0}/{term.capacity}</span>
                  </div>

                  {isRegistered && myRegistration.grade && (
                    <div className="term-grade">
                      {getGradeDisplay(myRegistration.grade)}
                    </div>
                  )}
                </div>
                
                <div className="term-card-footer">
                  {isRegistered ? (
                    <button 
                      className="button button-danger full-width"
                      onClick={() => handleUnregisterFromTerm(myRegistration.id)}
                      disabled={registering}
                    >
                      {registering ? 'Unregistering...' : '✗ Unregister'}
                    </button>
                  ) : (
                    term.requires_registration && (
                      <button 
                        className={`button full-width ${isFull ? '' : 'button-success'}`}
                        onClick={() => handleRegisterTerm(term.id)}
                        disabled={registering || isFull}
                      >
                        {isFull ? 'Full' : 'Register'}
                      </button>
                    )
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

export default StudentCourseRegistration;