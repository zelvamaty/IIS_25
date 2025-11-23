import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PublicCourses.css';
import { coursesAPI } from '../services/api';

const PublicCourses = ({ user, onShowLogin }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  const [availableTypes, setAvailableTypes] = useState([]);
  const [myEnrolledCourses, setMyEnrolledCourses] = useState([]);

  useEffect(() => {
    loadCourses();
    if (user) {
      loadMyEnrollments();
    }
  }, [user]);

  const loadMyEnrollments = async () => {
    try {
      const enrollments = await coursesAPI.getMyCourses();
      setMyEnrolledCourses(enrollments.map(e => e.id));
    } catch (err) {
      console.error('Error loading enrollments:', err);
    }
  };

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
      
      const types = [...new Set(approvedCourses.map(c => c.type).filter(Boolean))];
      setAvailableTypes(types);
    } catch (err) {
      setError('Failed to load courses. Please try again later.');
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    if (!user) {
      if (onShowLogin) {
        onShowLogin();
      } else {
        alert('You must be logged in to enroll in a course');
      }
      return;
    }

    try {
      setEnrollingCourseId(courseId);
      await coursesAPI.enrollInCourse(courseId);
      alert('Successfully enrolled in the course!');
      await loadCourses();
      await loadMyEnrollments();
    } catch (err) {
      console.error('Error enrolling in course:', err);
      alert(err.message || 'Course enrollment failed');
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
          <p>Loading courses...</p>
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
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="public-courses">
      <div className="filter-section">
        <h3>Filter courses:</h3>
        <div className="filter-inputs">
          <div className="form-group">
            <label className="form-label">Search course</label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter course name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Course type</label>
            <select
              className="input-field"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All types</option>
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
          <p>No courses found</p>
        </div>
      ) : (
        <div className="courses-grid">
          {filteredCourses.map(course => {
            const isFull = course.enrolled_count >= course.capacity;
            const isEnrolling = enrollingCourseId === course.id;
            const isEnrolled = myEnrolledCourses.includes(course.id);

            return (
              <div key={course.id} className="course-card">
                <div className="course-card-header">
                  <h3>{course.title}</h3>
                  <span className="course-code">{course.code}</span>
                </div>
                <div className="course-card-body">
                  {course.type && (
                    <p>
                      <strong>Type:</strong> {getTypeName(course.type)}
                    </p>
                  )}
                  <p>
                    <strong>Description:</strong> {course.description || 'No description'}
                  </p>
                  <p>
                    <strong>Guarantor:</strong>{' '}
                    {course.guarantee 
                      ? `${course.guarantee.first_name} ${course.guarantee.last_name}`
                      : 'Unknown'
                    }
                  </p>
                  {course.lecturers && course.lecturers.length > 0 && (
                    <p>
                      <strong>Lecturers:</strong>{' '}
                      {course.lecturers.map(l => `${l.first_name} ${l.last_name}`).join(', ')}
                    </p>
                  )}
                  <p>
                    <strong>Capacity:</strong>{' '}
                    <span className={isFull ? 'capacity-full' : 'capacity-available'}>
                      {course.enrolled_count}/{course.capacity} seats
                    </span>
                  </p>
                  <p>
                    <strong>Price:</strong> {course.price} CZK
                  </p>
                  {course.auto_confirm && (
                    <p className="auto-confirm-badge">
                      ✓ Auto confirmation
                    </p>
                  )}
                </div>
                <div className="course-card-footer">
                  {user ? (
                    isEnrolled ? (
                      <button 
                        className="button button-info"
                        disabled
                      >
                        ✓ Already enrolled
                      </button>
                    ) : (
                      <button 
                        className={`button ${isFull ? 'button-disabled' : 'button-success'}`}
                        onClick={() => handleEnroll(course.id)}
                        disabled={isFull || isEnrolling}
                      >
                        {isEnrolling ? '⏳ Enrolling...' : isFull ? 'Full' : '✓ Enroll in course'}
                      </button>
                    )
                  ) : (
                    <button 
                      className="button button-secondary"
                      onClick={() => handleEnroll(course.id)}
                    >
                      🔒 Login to enroll
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