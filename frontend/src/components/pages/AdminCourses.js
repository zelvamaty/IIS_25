import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminCourses.css';
import { coursesAPI } from '../services/api';

const AdminCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFields, setExpandedFields] = useState({});

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await coursesAPI.getCourses();
      setCourses(data);
    } catch (err) {
      setError('Failed to load courses');
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFieldExpansion = (courseId, field) => {
    const key = `${courseId}-${field}`;
    setExpandedFields(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const truncateText = (text, maxLength = 20) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const isFieldExpanded = (courseId, field) => {
    return expandedFields[`${courseId}-${field}`];
  };

  const handleNewCourse = () => {
    navigate('/create-course');
  };

  const handleManageCourse = (courseId) => {
    navigate('/instructor/courses', { state: { selectedCourseId: courseId } });
  };

  const handleApproveCourse = async (id, title) => {
    if (!window.confirm(`Approve course "${title}"?`)) {
      return;
    }

    try {
      await coursesAPI.approveCourse(id);
      alert('Course has been approved');
      await loadCourses();
    } catch (err) {
      alert(err.message || 'Approving course failed');
      console.error('Error approving course:', err);
    }
  };

  const handleRejectCourse = async (id, title) => {
    if (!window.confirm(`Reject course "${title}"?`)) {
      return;
    }

    try {
      await coursesAPI.rejectCourse(id);
      alert('Course has been rejected');
      await loadCourses();
    } catch (err) {
      alert(err.message || 'Rejecting course failed');
      console.error('Error rejecting course:', err);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Do you really want to delete course "${title}"?`)) {
      return;
    }

    try {
      await coursesAPI.deleteCourse(id);
      alert('Course has been deleted');
      await loadCourses();
    } catch (err) {
      alert(err.message || 'Deleting course failed');
      console.error('Error deleting course:', err);
    }
  };

  const getCourseTypeName = (type) => {
    const typeMap = {
      'LECTURE': 'Lecture',
      'EXERCISE': 'Exercise',
      'EXAM': 'Exam'
    };
    return typeMap[type] || type;
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === '' ||
      (filterStatus === 'approved' && course.approved) ||
      (filterStatus === 'pending' && !course.approved);
    
    return matchesSearch && matchesStatus;
  });

  const totalCourses = courses.length;
  const approvedCourses = courses.filter(c => c.approved).length;
  const pendingCourses = courses.filter(c => !c.approved).length;
  const totalStudents = courses.reduce((sum, c) => sum + (c.enrolled_count || 0), 0);

  if (loading) {
    return (
      <div className="admin-courses">
        <div className="loading-state">
          <p>Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-courses">
        <div className="error-state">
          <p>{error}</p>
          <button className="button" onClick={loadCourses}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-courses">
      <div className="filter-section">
        <div className="filter-inputs">
          <div className="form-group">
            <label className="form-label">Search Course</label>
            <input
              type="text"
              className="input-field"
              placeholder="Course name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="input-field"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Courses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending Approval</option>
            </select>
          </div>
        </div>
      </div>

      <div className="action-bar">
        <button className="button button-success button-small" onClick={handleNewCourse}>
          New Course
        </button>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="empty-state">
          <p>No courses found</p>
        </div>
      ) : (
        <div className="courses-table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Guarantor</th>
                <th>Capacity</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map(course => {
                const guarantorName = course.guarantee 
                  ? `${course.guarantee.first_name} ${course.guarantee.last_name}`
                  : 'Unknown';
                const isGuarantorLong = guarantorName.length > 20;
                
                const courseTitle = course.title || '';
                const isTitleLong = courseTitle.length > 30;

                return (
                  <tr key={course.id}>
                    <td><strong>{course.code}</strong></td>
                    <td>
                      <div className="expandable-cell">
                        <span>
                          {isFieldExpanded(course.id, 'title') || !isTitleLong
                            ? courseTitle
                            : truncateText(courseTitle, 30)}
                        </span>
                        {isTitleLong && (
                          <button 
                            className="expand-button"
                            onClick={() => toggleFieldExpansion(course.id, 'title')}
                          >
                            {isFieldExpanded(course.id, 'title') ? 'Show less' : 'Show more'}
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="expandable-cell">
                        <span>
                          {isFieldExpanded(course.id, 'guarantor') || !isGuarantorLong
                            ? guarantorName
                            : truncateText(guarantorName, 20)}
                        </span>
                        {isGuarantorLong && (
                          <button 
                            className="expand-button"
                            onClick={() => toggleFieldExpansion(course.id, 'guarantor')}
                          >
                            {isFieldExpanded(course.id, 'guarantor') ? 'Show less' : 'Show more'}
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={course.enrolled_count >= course.capacity ? 'capacity-full' : 'capacity-available'}>
                        {course.enrolled_count}/{course.capacity}
                      </span>
                    </td>
                    <td>{course.price} CZK</td>
                    <td>
                      {course.approved ? (
                        <span className="badge badge-success">
                          Approved
                        </span>
                      ) : (
                        <span className="badge badge-warning">
                          Pending
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="button button-small" 
                          onClick={() => handleManageCourse(course.id)}
                        >
                          Manage
                        </button>
                        {!course.approved ? (
                          <>
                            <button 
                              className="button button-success button-small" 
                              onClick={() => handleApproveCourse(course.id, course.title)}
                            >
                              Approve
                            </button>
                            <button 
                              className="button button-warning button-small" 
                              onClick={() => handleRejectCourse(course.id, course.title)}
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <button 
                            className="button button-danger button-small" 
                            onClick={() => handleDelete(course.id, course.title)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;