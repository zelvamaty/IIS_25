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
      
      const allCourses = await coursesAPI.getCourses();
      
      const myEnrollments = await coursesAPI.getMyCourses();
      const myEnrolledIds = myEnrollments.map(e => e.id);
      const myCourses = allCourses.filter(c => myEnrolledIds.includes(c.id));
      
      const coursesWithRoles = myCourses.map(course => {
        const enrollment = myEnrollments.find(e => e.id === course.id);
        return { ...course, role: enrollment?.role };
      });
      
      setMyCourses(coursesWithRoles);
  
    } catch (err) {
      setError('Failed to load courses');
      console.error('Error loading my courses:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="my-courses">
        <div className="loading-state">
          <p>Loading courses...</p>
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
            Try again
          </button>
        </div>
      </div>
    );
  }

  const approvedCourses = myCourses.filter(c => c.role === 'APPROVED');
  const pendingCourses = myCourses.filter(c => c.role === 'PENDING');

  return (
    <div className="my-courses">
      {pendingCourses.length > 0 && (
        <div className="courses-section">
          <h2 className="section-title">Pending Approval</h2>
          <div className="courses-list">
            {pendingCourses.map(course => (
              <div key={course.id} className="course-card pending">
                <div className="course-card-header">
                  <h3>{course.title}</h3>
                  <span className="course-code">{course.code}</span>
                </div>
                <div className="course-status">
                  <span className="badge badge-warning">Waiting for approval</span>
                </div>
                <div className="course-card-body">
                  <p>
                  <strong>Guarantor:</strong>{' '}
                    {course.guarantee 
                      ? `${course.guarantee.first_name} ${course.guarantee.last_name}`
                      : 'Unknown'
                    }
                  </p>
                </div>
                <div className="course-card-footer">
                  <button 
                    className="button"
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    Course details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="courses-section">
        <h2 className="section-title">Approved Courses</h2>
        
        {approvedCourses.length === 0 ? (
          <div className="empty-state">
            <p>You have no approved courses yet</p>
            <button className="button" onClick={() => navigate('/courses')}>
              Browse available courses
            </button>
          </div>
        ) : (
          <div className="courses-list">
            {approvedCourses.map(course => (
              console.log('Rendering approved course:', course), // Debug log
              <div key={course.id} className="course-card approved">
                <div className="course-card-header">
                  <h3>{course.title}</h3>
                  <span className="course-code">{course.code}</span>
                </div>
                <div className="course-status">
                  <span className="badge badge-success">✓ Approved</span>
                </div>
                <div className="course-card-body">
                  <p>
                  <strong>Guarantor:</strong>{' '}
                    {course.guarantee 
                      ? `${course.guarantee.first_name} ${course.guarantee.last_name}`
                      : 'Unknown'
                    }
                  </p>
                </div>
                <div className="course-card-footer">
                  <button 
                    className="button"
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    Course details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {myCourses.length === 0 && (
        <div className="empty-state">
          <p>You are not enrolled in any courses</p>
          <button className="button" onClick={() => navigate('/courses')}>
            Browse available courses
          </button>
        </div>
      )}
    </div>
  );
};

export default MyCourses;