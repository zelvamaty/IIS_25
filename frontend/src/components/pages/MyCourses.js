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
          <h2 className="section-title"> Pending Approval</h2>
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
                  <p><strong>Guarantor:</strong> {course.guarantee}</p>
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
        <h2 className="section-title"> Approved Courses</h2>
        
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
              <div key={course.id} className="course-card approved">
                <div className="course-card-header">
                  <h3>{course.title}</h3>
                  <span className="course-code">{course.code}</span>
                </div>
                <div className="course-status">
                  <span className="badge badge-success">✓ Approved</span>
                </div>
                <div className="course-card-body">
                  <p><strong>Guarantor:</strong> {course.guarantee}</p>
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