import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './InstructorCourse.css';
import { coursesAPI, termsAPI, usersAPI, roomsAPI, gradesAPI } from '../services/api';

const InstructorCourse = ({ userRole = 'Student' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('courses');
  const [myCourses, setMyCourses] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseTerms, setCourseTerms] = useState([]);
  const [courseEnrollments, setCourseEnrollments] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [showAddLecturerForm, setShowAddLecturerForm] = useState(false);
  const [selectedLecturerId, setSelectedLecturerId] = useState('');
  const [lecturerError, setLecturerError] = useState('');
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [termStudents, setTermStudents] = useState([]);
  const [showGradeForm, setShowGradeForm] = useState(false);
  const [selectedRegistrationId, setSelectedRegistrationId] = useState('');
  const [gradeValue, setGradeValue] = useState('');
  const [gradeError, setGradeError] = useState('');
  const [editingTerm, setEditingTerm] = useState(null);
  const [editTermData, setEditTermData] = useState({
    title: '',
    description: '',
    type: '',
    start_time: '',
    end_time: '',
    room: '',
    capacity: '',
    requires_registration: true
  });
  const [editTermLoading, setEditTermLoading] = useState(false);
  const [editTermError, setEditTermError] = useState('');
  const [termFormData, setTermFormData] = useState({
    title: '',
    description: '',
    type: '',
    start_time: '',
    end_time: '',
    room: '',
    capacity: '30',
    requires_registration: true
  });
  const [termLoading, setTermLoading] = useState(false);
  const [termError, setTermError] = useState('');
  
  const [editCourseData, setEditCourseData] = useState({
    title: '',
    code: '',
    description: '',
    type: '',
    price: '',
    capacity: '',
    auto_confirm: false
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    loadCurrentUserAndCourses();
    loadRooms();
    loadUsers();
  }, []);

  useEffect(() => {
    if (location.state?.selectedCourseId && currentUser) {
      loadCourseDetails(location.state.selectedCourseId);
    }
  }, [location.state, currentUser]);

  const loadRooms = async () => {
    try {
      const roomsData = await roomsAPI.getRooms();
      setRooms(roomsData);
    } catch (err) {
      console.error('Error loading rooms:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const users = await usersAPI.getUsers();
      setAvailableUsers(users);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const handleEditTerm = (term) => {
    console.log('Editing term:', term); // Debug log
    console.log('Term room value:', term.room, 'Type:', typeof term.room); // Debug log
    
    setEditingTerm(term);
    setEditTermData({
      title: term.title || term.name || '',
      description: term.description || '',
      type: term.type,
      start_time: new Date(term.start_time).toISOString().slice(0, 16),
      end_time: new Date(term.end_time).toISOString().slice(0, 16),
      room: term.room || '', // This should be the room ID
      capacity: term.capacity.toString(),
      requires_registration: term.requires_registration
    });
    setActiveTab('edit-term');
  };
  
  const handleUpdateTerm = async (e) => {
    e.preventDefault();
    setEditTermLoading(true);
    setEditTermError('');
  
    try {
      const termData = {
        name: editTermData.title || 'default_term_name',  
        type: editTermData.type,
        start_time: new Date(editTermData.start_time).toISOString(),
        end_time: new Date(editTermData.end_time).toISOString(),
        capacity: parseInt(editTermData.capacity),
        requires_registration: editTermData.requires_registration,
        description: editTermData.description || ''
      };
  
      if (editTermData.room) {
        termData.room = parseInt(editTermData.room);
      } else {
        termData.room = null;
      }
  
      await termsAPI.updateTerm(editingTerm.id, termData);
      alert('Term has been successfully updated!');
      
      setEditingTerm(null);
      setEditTermData({
        title: '',
        description: '',
        type: '',
        start_time: '',
        end_time: '',
        room: '',
        capacity: '',
        requires_registration: true
      });
      
      await loadCourseDetails(selectedCourse.id);
      setActiveTab('terms');
    } catch (err) {
      setEditTermError(err.message || 'Updating term failed');
      console.error('Error updating term:', err);
    } finally {
      setEditTermLoading(false);
    }
  };
  
  const handleEditTermFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditTermData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setEditTermError('');
  };

  const loadCurrentUserAndCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user = await usersAPI.getCurrentUser();
      setCurrentUser(user);
      
      const allCourses = await coursesAPI.getCourses();
      
      const instructorCourses = allCourses.filter(course => {
        const isGuarantee = course.guarantee?.id === user.id;
        const isLecturer = course.lecturers?.some(l => l.id === user.id);
        return isGuarantee || isLecturer;
      });

      setMyCourses(instructorCourses);
    } catch (err) {
      setError('Failed to load courses');
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTermStudents = async (termId) => {
    try {
      const students = await termsAPI.getTermStudents(termId);
      setTermStudents(students);
    } catch (err) {
      console.error('Error loading term students:', err);
      setTermStudents([]);
    }
  };
  
  const handleViewTermDetail = async (term) => {
    setSelectedTerm(term);
    await loadTermStudents(term.id);
    setActiveTab('term-detail');
  };
  
  const handleBackToTerms = () => {
    setSelectedTerm(null);
    setTermStudents([]);
    setShowGradeForm(false);
    setActiveTab('terms');
  };
  
  const handleAddGrade = async (e) => {
    e.preventDefault();
    setGradeError('');
  
    if (!selectedRegistrationId || !gradeValue) {
      setGradeError('Fill in all fields');
      return;
    }
  
    try {
      const gradeData = {
        registration: parseInt(selectedRegistrationId),
        value: parseFloat(gradeValue)
      };
      
      await gradesAPI.createGrade(gradeData);
      
      alert('Grade has been successfully added!');
      setShowGradeForm(false);
      setSelectedRegistrationId('');
      setGradeValue('');
      await loadTermStudents(selectedTerm.id);
    } catch (err) {
      setGradeError(err.message || 'Adding grade failed');
      console.error('Error adding grade:', err);
    }
  };
  
  const handleDeleteGrade = async (gradeId) => {
    if (!window.confirm('Do you really want to delete this grade?')) {
      return;
    }
  
    try {
      await gradesAPI.deleteGrade(gradeId);
      alert('Grade has been deleted');
      await loadTermStudents(selectedTerm.id);
    } catch (err) {
      alert(err.message || 'Deleting grade failed');
      console.error('Error deleting grade:', err);
    }
  };
  
  const handleUpdateGrade = async (gradeId, newValue) => {
    if (!window.confirm('Do you really want to change this grade?')) {
      return;
    }
  
    try {
      await gradesAPI.updateGrade(gradeId, { value: parseFloat(newValue) });
      alert('Grade has been changed');
      await loadTermStudents(selectedTerm.id);
    } catch (err) {
      alert(err.message || 'Changing grade failed');
      console.error('Error updating grade:', err);
    }
  };

  const handleAddLecturer = async (e) => {
    e.preventDefault();
    setLecturerError('');
  
    if (!selectedLecturerId) {
      setLecturerError('Select a lecturer');
      return;
    }
  
    try {
      await coursesAPI.addLecturer(selectedCourse.id, parseInt(selectedLecturerId));
      alert('Lecturer has been successfully added');
      setShowAddLecturerForm(false);
      setSelectedLecturerId('');
      await loadCourseDetails(selectedCourse.id);
    } catch (err) {
      setLecturerError(err.message || 'Adding lecturer failed');
      console.error('Error adding lecturer:', err);
    }
  };
  
  const handleRemoveLecturer = async (lecturerId) => {
    if (!window.confirm('Do you really want to remove this lecturer?')) {
      return;
    }
  
    try {
      await coursesAPI.removeLecturer(selectedCourse.id, lecturerId);
      alert('Lecturer has been removed');
      await loadCourseDetails(selectedCourse.id);
    } catch (err) {
      alert(err.message || 'Removing lecturer failed');
      console.error('Error removing lecturer:', err);
    }
  };

  const loadCourseDetails = async (courseId) => {
    try {
      setLoading(true);
      setError(null);
      
      const course = await coursesAPI.getCourseDetail(courseId);
      setSelectedCourse(course);
      
      const allTerms = await termsAPI.getTerms();
      const courseTerms = allTerms.filter(t => t.course?.id === courseId);
      setCourseTerms(courseTerms);
      
      try {
        const students = await coursesAPI.getEnrollments(courseId);
        
        const enrollments = students.map(student => ({
          id: student.enrollment_id,
          student: {
            id: student.id,
            username: student.username,
            first_name: student.first_name,
            last_name: student.last_name,
            email: student.email || ''
          },
          approved: student.role === 'APPROVED' || !student.role, 
          role: student.role || 'APPROVED', 
          enrolled_at: student.enrolled_at || new Date().toISOString()
        }));
        setCourseEnrollments(enrollments);
      } catch (err) {
        console.log('Error loading students:', err);
        setCourseEnrollments([]);
      }
      
      setActiveTab('terms');
    } catch (err) {
      setError('Failed to load course details');
      console.error('Error loading course details:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTermFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTermFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setTermError('');
  };
  
  const handleDeleteRegistration = async (registrationId) => {
    if (!window.confirm('Do you really want to remove the student from this term?')) {
      return;
    }
  
    try {
      await termsAPI.deleteRegistration(registrationId);
      alert('Student has been removed from the term');
      await loadTermStudents(selectedTerm.id);
    } catch (err) {
      alert(err.message || 'Removing student from term failed');
      console.error('Error deleting registration:', err);
    }
  };

  const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleRemoveStudent = async (enrollmentId) => {
    if (!selectedCourse) return;
    
    if (!window.confirm('Do you really want to remove the student from the course? This action is irreversible.')) {
      return;
    }
    
    try {
      await coursesAPI.removeStudent(selectedCourse.id, enrollmentId);
      alert('Student has been removed from the course');
      await loadCourseDetails(selectedCourse.id);
    } catch (err) {
      alert(err.message || 'Removing student failed');
      console.error('Error removing student:', err);
    }
  };
  
  const handleCreateTerm = async (e) => {
    e.preventDefault();
    setTermLoading(true);
    setTermError('');

    try {
      const termData = {
        course_id: selectedCourse.id,
        name: termFormData.title || 'default_term_name',  
        type: termFormData.type,
        start_time: new Date(termFormData.start_time).toISOString(),
        end_time: new Date(termFormData.end_time).toISOString(),
        capacity: parseInt(termFormData.capacity),
        requires_registration: termFormData.requires_registration,
        description: termFormData.description || ''
      };

      if (termFormData.room) {
        termData.room = parseInt(termFormData.room);
      }

      await termsAPI.createTerm(termData);
      alert('Term has been successfully created!');
      
      setTermFormData({
        title: '',
        description: '',
        type: '',
        start_time: '',
        end_time: '',
        room: '',
        capacity: '30',
        requires_registration: true
      });
      
      await loadCourseDetails(selectedCourse.id);
      setActiveTab('terms');
    } catch (err) {
      setTermError(err.message || 'Creating term failed');
      console.error('Error creating term:', err);
    } finally {
      setTermLoading(false);
    }
  };

  const handleDeleteTerm = async (termId) => {
    if (!window.confirm('Do you really want to delete this term?')) {
      return;
    }

    try {
      await termsAPI.deleteTerm(termId);
      alert('Term has been deleted');
      await loadCourseDetails(selectedCourse.id);
    } catch (err) {
      alert(err.message || 'Deleting term failed');
      console.error('Error deleting term:', err);
    }
  };

  const handleApproveEnrollment = async (enrollmentId) => {
    if (!selectedCourse) return;
    
    try {
      await coursesAPI.approveEnrollment(selectedCourse.id, enrollmentId);
      alert('Student has been successfully approved');
      await loadCourseDetails(selectedCourse.id);
    } catch (err) {
      alert(err.message || 'Approving student failed');
      console.error('Error approving enrollment:', err);
    }
  };

  const handleRejectEnrollment = async (enrollmentId) => {
    if (!selectedCourse) return;
    
    try {
      await coursesAPI.rejectEnrollment(selectedCourse.id, enrollmentId);
      alert('Student has been rejected');
      await loadCourseDetails(selectedCourse.id);
    } catch (err) {
      alert(err.message || 'Rejecting student failed');
      console.error('Error rejecting enrollment:', err);
    }
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setCourseEnrollments([]);
    setActiveTab('courses');
  };

  const getRoomName = (roomId) => {
    if (!roomId) return 'Unknown';
    const room = rooms.find(r => r.id === roomId);
    return room ? (room.name || `Room ${room.id}`) : 'Not specified';
  };

  const isGuarantor = selectedCourse && currentUser && selectedCourse.guarantee?.id === currentUser.id;
  const isLecturer = selectedCourse && currentUser && selectedCourse.lecturers?.some(l => l.id === currentUser.id);
  const isAdmin = currentUser?.role === 'ADMIN';
  const canManageCourse = isGuarantor || isAdmin;
  const canGradeStudents = isGuarantor || isLecturer || isAdmin;
  
  const pendingEnrollments = courseEnrollments.filter(e => e.role === 'PENDING');
  const approvedEnrollments = courseEnrollments.filter(e => e.role === 'APPROVED');

  if (loading && !currentUser) {
    return (
      <div className="instructor-course">
        <div className="loading-state">
          <p>Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error && myCourses.length === 0) {
    return (
      <div className="instructor-course">
        <div className="error-state">
          <p>{error}</p>
          <button className="button" onClick={loadCurrentUserAndCourses}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!selectedCourse) {
    return (
      <div className="instructor-course">
        
        {myCourses.length === 0 ? (
          <div className="empty-state">
            <p>You don't have any courses as guarantor or lecturer yet</p>
            <button className="button" onClick={() => navigate('/create-course')}>
              Create Course
            </button>
          </div>
        ) : (
          <div className="courses-list">
            {myCourses.map(course => (
              <div key={course.id} className="course-item">
                <div className="course-header">
                  <div className="course-title-section">
                    <h3>{course.title}</h3>
                    <span className="course-code">{course.code}</span>
                    {!course.approved ? (
                      <span className="badge badge-warning">
                         Waiting for administrator approval
                      </span>
                    ) : (
                      <span className="badge badge-success">
                        ✓ Approved
                      </span>
                    )}
                  </div>
                </div>

                <div className="course-body">
                  <div className="course-info-row">
                    <span><strong>Guarantor:</strong> {course.guarantee 
                      ? `${course.guarantee.first_name} ${course.guarantee.last_name}`
                      : 'Unknown'}</span>
                    <span><strong>Capacity:</strong> {course.enrolled_count}/{course.capacity}</span>
                  </div>

                  <div className="course-info-row">
                    <span><strong>Price:</strong> {course.price} CZK</span>
                    {course.auto_confirm && (
                      <span className="badge badge-info">✓ Automatic confirmation</span>
                    )}
                  </div>

                  {course.description && (
                    <p className="course-description">{course.description}</p>
                  )}

                  <button 
                    className="button"
                    onClick={() => loadCourseDetails(course.id)}
                  >
                    Manage Course
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="instructor-course">
      <div className="course-info-header">
        <button className="button button-secondary" onClick={handleBackToCourses}>
          ← Back to course list
        </button>
        <div>
          <h1>{selectedCourse.title}</h1>
          <p className="course-meta">
            Code: {selectedCourse.code} | Capacity: {selectedCourse.capacity} | 
            Registered: {selectedCourse.enrolled_count}
          </p>
          {!selectedCourse.approved && (
            <p className="warning-message">
              ⚠️ Course is waiting for administrator approval
            </p>
          )}
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'terms' ? 'active' : ''}`}
          onClick={() => setActiveTab('terms')}
        >
          Terms ({courseTerms.length})
        </button>
        <button 
          className={`tab ${activeTab === 'enrollments' ? 'active' : ''}`}
          onClick={() => setActiveTab('enrollments')}
        >
          Enrollments ({approvedEnrollments.length})
        </button>
        {canManageCourse && (
          <button 
            className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending ({pendingEnrollments.length})
          </button>
        )}
        {canManageCourse && (
          <button 
            className={`tab ${activeTab === 'lecturers' ? 'active' : ''}`}
            onClick={() => setActiveTab('lecturers')}
          >
            Lecturers ({selectedCourse.lecturers?.length || 0})
          </button>
        )}
        {canManageCourse && (
          <button 
            className={`tab ${activeTab === 'edit-course' ? 'active' : ''}`}
            onClick={() => {
              setEditCourseData({
                title: selectedCourse.title,
                code: selectedCourse.code,
                description: selectedCourse.description || '',
                type: selectedCourse.type || '',
                price: selectedCourse.price.toString(),
                capacity: selectedCourse.capacity.toString(),
                auto_confirm: selectedCourse.auto_confirm
              });
              setActiveTab('edit-course');
            }}
          >
            Edit Course
          </button>
        )}
      </div>

      {activeTab === 'terms' && (
        <div className="tab-content">
          <div className="section-header">
            <h2 className="section-title">Course Terms</h2>
            {canManageCourse && (
              <button 
                className="button button-success"
                onClick={() => setActiveTab('create-term')}
              >
                + Create Term
              </button>
            )}
          </div>

          {courseTerms.length === 0 ? (
            <div className="empty-state">
              <p>No terms have been created yet</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Date and Time</th>
                    <th>Room</th>
                    <th>Capacity</th>
                    <th>Registrations</th>
                   
                  </tr>
                </thead>
                <tbody>
                  {courseTerms.map(term => (
                    <tr key={term.id}>
                      <td>
                        {term.title && <div><strong>{term.title}</strong></div>}
                        {getTermTypeName(term.type)}
                      </td>
                      <td>
                        {new Date(term.start_time).toLocaleString('en-US', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td>{getRoomName(term.room)}</td>
                      <td>{term.capacity}</td>
                      <td>{term.registrations_count || 0}</td>
                      {(canManageCourse || isLecturer) && (
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              className="button button-small"
                              onClick={() => handleViewTermDetail(term)}
                            >
                              Detail
                            </button>
                            {canManageCourse && (
                              <>
                                <button 
                                  className="button button-small"
                                  onClick={() => handleEditTerm(term)}
                                >
                                  Edit
                                </button>
                                <button 
                                  className="button button-danger button-small"
                                  onClick={() => handleDeleteTerm(term.id)}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'term-detail' && selectedTerm && (canManageCourse || isLecturer) && (
        <div className="tab-content">
          <div className="section-header">
            <h2 className="section-title">
              Term Detail - {getTermTypeName(selectedTerm.type)}
            </h2>
            <button 
              className="button button-secondary"
              onClick={handleBackToTerms}
            >
              ← Back to terms
            </button>
          </div>

          <div className="term-info-box">
            <p><strong>Date:</strong> {new Date(selectedTerm.start_time).toLocaleString('en-US')}</p>
            <p><strong>Room:</strong> {getRoomName(selectedTerm.room)}</p>
            <p><strong>Capacity:</strong> {selectedTerm.registrations_count || 0}/{selectedTerm.capacity}</p>
            {selectedTerm.title && <p><strong>Title:</strong> {selectedTerm.title}</p>}
            {selectedTerm.description && <p><strong>Description:</strong> {selectedTerm.description}</p>}
          </div>

          <div className="section-header">
            <h3>Registered Students ({termStudents.length})</h3>
            {!showGradeForm && canGradeStudents && (
              <button 
                className="button button-success"
                onClick={() => setShowGradeForm(true)}
              >
                + Add Grade
              </button>
            )}
          </div>

          {showGradeForm && (
            <div className="grade-form-container">
              <h4>Add Grade to Student</h4>
              
              {gradeError && (
                <div className="error-message">{gradeError}</div>
              )}

              <form onSubmit={handleAddGrade} className="grade-form">
                <div className="form-group">
                  <label className="form-label">Student *</label>
                  <select
                    className="input-field"
                    value={selectedRegistrationId}
                    onChange={(e) => setSelectedRegistrationId(e.target.value)}
                    required
                  >
                    <option value="">-- Select student --</option>
                    {termStudents
                      .filter(s => !s.grade)
                      .map(student => (
                        <option 
                          key={student.registration_id} 
                          value={student.registration_id}
                        >
                          {truncateText(`${student.first_name} ${student.last_name}`, 25)} ({truncateText(student.username, 15)})
                        </option>
                      ))
                    }
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Grade (0-100) *</label>
                  <input
                    type="number"
                    className="input-field"
                    min="0"
                    max="100"
                    step="0.5"
                    value={gradeValue}
                    onChange={(e) => setGradeValue(e.target.value)}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="button button-success">
                    ✓ Add Grade
                  </button>
                  <button 
                    type="button" 
                    className="button button-secondary"
                    onClick={() => {
                      setShowGradeForm(false);
                      setSelectedRegistrationId('');
                      setGradeValue('');
                      setGradeError('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {termStudents.length === 0 ? (
            <div className="empty-state">
              <p>No one is registered for this term yet</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Registration</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {termStudents.map(student => (
                    <tr key={student.registration_id}>
                      <td>
                        {truncateText(`${student.first_name} ${student.last_name}`, 30)}
                        <br />
                        <small style={{ color: '#64748b' }}>({student.username})</small>
                      </td>
                      <td>
                        {new Date(student.registered_at).toLocaleDateString('en-US')}
                      </td>
                      <td>
                        {student.grade ? (
                          <div>
                            <strong style={{ color: '#3b82f6', fontSize: '18px' }}>
                              {student.grade}
                            </strong>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>Not graded</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {student.grade && student.grade_id && (
                            <>
                              <button 
                                className="button button-small"
                                onClick={() => {
                                  const newValue = prompt('New grade (0-100):', student.grade);
                                  if (newValue && !isNaN(parseFloat(newValue))) {
                                    handleUpdateGrade(student.grade_id, newValue);
                                  }
                                }}
                              >
                                Edit Grade
                              </button>
                              <button 
                                className="button button-danger button-small"
                                onClick={() => handleDeleteGrade(student.grade_id)}
                              >
                                Delete Grade
                              </button>
                            </>
                          )}
                          {canManageCourse && (
                            <button 
                              className="button button-danger button-small"
                              onClick={() => handleDeleteRegistration(student.registration_id)}
                            >
                              Remove from Term
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'create-term' && canManageCourse && (
        <div className="tab-content">
          <div className="section-header">
            <h2 className="section-title">Create New Term</h2>
          </div>

          <form onSubmit={handleCreateTerm} className="term-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Term Title</label>
                <input
                  type="text"
                  name="title"
                  className="input-field"
                  placeholder="e.g., Week 1 - Introduction"
                  value={termFormData.title}
                  onChange={handleTermFormChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Term Description *</label>
                <textarea
                  name="description"
                  className="input-field textarea"
                  rows="3"
                  placeholder="Additional details about this term..."
                  value={termFormData.description}
                  onChange={handleTermFormChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Term Type *</label>
                <select
                  name="type"
                  className="input-field"
                  value={termFormData.type}
                  onChange={handleTermFormChange}
                  required
                >
                  <option value="">Select type</option>
                  <option value="LECTURE">Lecture</option>
                  <option value="EXERCISE">Exercise</option>
                  <option value="EXAM">Exam</option>
                </select>
              </div>
            </div>

            <div className="form-row two-columns">
              <div className="form-group">
                <label className="form-label">Start Date and Time *</label>
                <input
                  type="datetime-local"
                  name="start_time"
                  className="input-field"
                  value={termFormData.start_time}
                  onChange={handleTermFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Date and Time *</label>
                <input
                  type="datetime-local"
                  name="end_time"
                  className="input-field"
                  value={termFormData.end_time}
                  onChange={handleTermFormChange}
                  required
                />
              </div>
            </div>

            <div className="form-row two-columns">
              <div className="form-group">
                <label className="form-label">Room</label>
                <select
                  name="room"
                  className="input-field"
                  value={termFormData.room}
                  onChange={handleTermFormChange}
                >
                  <option value="">No room</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.name || `Room ${room.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Capacity *</label>
                <input
                  type="number"
                  name="capacity"
                  className="input-field"
                  min="1"
                  value={termFormData.capacity}
                  onChange={handleTermFormChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="requires_registration"
                    checked={termFormData.requires_registration}
                    onChange={handleTermFormChange}
                  />
                  Requires student registration
                </label>
              </div>
            </div>

            {termError && (
              <div className="error-message">
                {termError}
              </div>
            )}

            <div className="form-actions">
              <button 
                type="submit" 
                className="button button-success"
                disabled={termLoading}
              >
                {termLoading ? 'Creating...' : 'Create Term'}
              </button>
              <button 
                type="button" 
                className="button button-secondary"
                onClick={() => setActiveTab('terms')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'edit-term' && canManageCourse && editingTerm && (
        <div className="tab-content">
          <div className="section-header">
            <h2 className="section-title">Edit Term</h2>
          </div>

          {editTermError && (
            <div className="error-message">
              {editTermError}
            </div>
          )}

          <form onSubmit={handleUpdateTerm} className="term-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Term Title *</label>
                <input
                  type="text"
                  name="title"
                  className="input-field"
                  placeholder="e.g., Week 1 - Introduction"
                  value={editTermData.title}
                  onChange={handleEditTermFormChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Term Description</label>
                <textarea
                  name="description"
                  className="input-field textarea"
                  rows="3"
                  placeholder="Additional details about this term..."
                  value={editTermData.description}
                  onChange={handleEditTermFormChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Term Type *</label>
                <select
                  name="type"
                  className="input-field"
                  value={editTermData.type}
                  onChange={handleEditTermFormChange}
                  required
                >
                  <option value="">Select type</option>
                  <option value="LECTURE">Lecture</option>
                  <option value="EXERCISE">Exercise</option>
                  <option value="EXAM">Exam</option>
                </select>
              </div>
            </div>

            <div className="form-row two-columns">
              <div className="form-group">
                <label className="form-label">Start Date and Time *</label>
                <input
                  type="datetime-local"
                  name="start_time"
                  className="input-field"
                  value={editTermData.start_time}
                  onChange={handleEditTermFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Date and Time *</label>
                <input
                  type="datetime-local"
                  name="end_time"
                  className="input-field"
                  value={editTermData.end_time}
                  onChange={handleEditTermFormChange}
                  required
                />
              </div>
            </div>

            <div className="form-row two-columns">
              <div className="form-group">
                <label className="form-label">Room</label>
                <select
                  name="room"
                  className="input-field"
                  value={editTermData.room}
                  onChange={handleEditTermFormChange}
                >
                  <option value="">No room</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.name || `Room ${room.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Capacity *</label>
                <input
                  type="number"
                  name="capacity"
                  className="input-field"
                  min="1"
                  value={editTermData.capacity}
                  onChange={handleEditTermFormChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="requires_registration"
                    checked={editTermData.requires_registration}
                    onChange={handleEditTermFormChange}
                  />
                  Requires student registration
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="button button-success"
                disabled={editTermLoading}
              >
                {editTermLoading ? '⏳ Updating...' : '✓ Update Term'}
              </button>
              <button 
                type="button" 
                className="button button-secondary"
                onClick={() => {
                  setEditingTerm(null);
                  setActiveTab('terms');
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'enrollments' && (
        <div className="tab-content">
          <h2 className="section-title">Approved Students</h2>
          
          {approvedEnrollments.length === 0 ? (
            <div className="empty-state">
              <p>No approved students yet</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Enrollment Date</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedEnrollments.map(enrollment => (
                    <tr key={enrollment.id}>
                      <td>
                        {enrollment.student 
                          ? truncateText(`${enrollment.student.first_name} ${enrollment.student.last_name}`, 30)
                          : 'Unknown'}
                      </td>
                      <td>
                        {new Date(enrollment.enrolled_at).toLocaleDateString('en-US')}
                      </td>
                      {(canManageCourse || isLecturer) && (
                        <td>
                          {canManageCourse && (
                            <button 
                              className="button button-danger button-small"
                              onClick={() => handleRemoveStudent(enrollment.id)}
                            >
                              Remove from Course
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'lecturers' && canManageCourse && (
        <div className="tab-content">
          <div className="section-header">
            <h2 className="section-title">Course Lecturers</h2>
            {!showAddLecturerForm && (
              <button 
                className="button button-success"
                onClick={() => setShowAddLecturerForm(true)}
              >
                + Add Lecturer
              </button>
            )}
          </div>

          {showAddLecturerForm && (
            <div className="add-lecturer-form">
              <h3>Add Lecturer</h3>
              
              {lecturerError && (
                <div className="error-message">
                  {lecturerError}
                </div>
              )}

              <form onSubmit={handleAddLecturer}>
                <div className="form-group">
                  <label className="form-label">Select User *</label>
                  <select
                    className="input-field"
                    value={selectedLecturerId}
                    onChange={(e) => setSelectedLecturerId(e.target.value)}
                    required
                  >
                    <option value="">-- Select lecturer --</option>
                    {availableUsers
                      .filter(u => 
                        u.id !== selectedCourse.guarantee?.id && 
                        !selectedCourse.lecturers?.some(l => l.id === u.id) &&  
                        u.role !== 'ADMIN' 
                      )
                      .map(user => (
                        <option key={user.id} value={user.id}>
                          {user.first_name} {user.last_name} ({user.username})
                        </option>
                      ))
                    }
                  </select>
                </div>

                <div className="form-actions">
                  <button type="submit" className="button button-success">
                    Add Lecturer
                  </button>
                  <button 
                    type="button" 
                    className="button button-secondary"
                    onClick={() => {
                      setShowAddLecturerForm(false);
                      setSelectedLecturerId('');
                      setLecturerError('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {selectedCourse.lecturers && selectedCourse.lecturers.length > 0 ? (
            <div className="lecturers-list">
              <h3>Lecturers List</h3>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Username</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCourse.lecturers.map(lecturer => (
                      <tr key={lecturer.id}>
                        <td>{lecturer.first_name} {lecturer.last_name}</td>
                        <td>{lecturer.username}</td>
                        <td>{lecturer.email || '-'}</td>
                        <td>
                          <button 
                            className="button button-danger button-small"
                            onClick={() => handleRemoveLecturer(lecturer.id)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="">
              <p>The course doesn't have any lecturers yet</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'pending' && canManageCourse && (
        <div className="tab-content">
          <h2 className="section-title">Students Waiting for Approval</h2>
          
          {pendingEnrollments.length === 0 ? (
            <div className="">
              <p>No students are waiting for approval</p>
            </div>
          ) : (
            <div className="waiting-list">
              {pendingEnrollments.map(enrollment => (
                <div key={enrollment.id} className="waiting-student-item">
                  <span className="student-info">
                    {enrollment.student 
                      ? `${truncateText(`${enrollment.student.first_name} ${enrollment.student.last_name}`, 25)} (${truncateText(enrollment.student.username, 15)})`
                      : 'Unknown'}
                  </span>
                  <div className="student-actions">
                    <button 
                      className="button button-success button-small"
                      onClick={() => handleApproveEnrollment(enrollment.id)}
                    >
                      ✓ Approve
                    </button>
                    <button 
                      className="button button-danger button-small"
                      onClick={() => handleRejectEnrollment(enrollment.id)}
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'edit-course' && canManageCourse && (
        <div className="tab-content">
          {editError && (
            <div className="error-message">
              {editError}
            </div>
          )}

          <form onSubmit={async (e) => {
            e.preventDefault();
            setEditLoading(true);
            setEditError('');

            try {
              const courseData = {
                code: editCourseData.code,
                title: editCourseData.title,
                description: editCourseData.description,
                type: editCourseData.type,
                price: parseFloat(editCourseData.price),
                capacity: parseInt(editCourseData.capacity),
                auto_confirm: editCourseData.auto_confirm
              };

              await coursesAPI.updateCourse(selectedCourse.id, courseData);
              alert('Course has been successfully updated!');
              await loadCourseDetails(selectedCourse.id);
              setActiveTab('terms');
            } catch (err) {
              setEditError(err.message || 'Updating course failed');
              console.error('Error updating course:', err);
            } finally {
              setEditLoading(false);
            }
          }} className="course-form">
            <div className="form-section">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Course Title *</label>
                  <input
                    type="text"
                    name="title"
                    className="input-field"
                    value={editCourseData.title}
                    onChange={(e) => setEditCourseData(prev => ({...prev, title: e.target.value}))}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Course Code *</label>
                  <input
                    type="text"
                    name="code"
                    className="input-field"
                    value={editCourseData.code}
                    onChange={(e) => setEditCourseData(prev => ({...prev, code: e.target.value}))}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Course Type *</label>
                  <select
                    name="type"
                    className="input-field"
                    value={editCourseData.type}
                    onChange={(e) => setEditCourseData(prev => ({...prev, type: e.target.value}))}
                    required
                  >
                    <option value="">-- Select type --</option>
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

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Course Description</label>
                  <textarea
                    name="description"
                    className="input-field textarea"
                    rows="4"
                    value={editCourseData.description}
                    onChange={(e) => setEditCourseData(prev => ({...prev, description: e.target.value}))}
                  />
                </div>
              </div>

              <div className="form-row two-columns">
                <div className="form-group">
                  <label className="form-label">Price (CZK) *</label>
                  <input
                    type="number"
                    name="price"
                    className="input-field"
                    min="0"
                    step="0.01"
                    value={editCourseData.price}
                    onChange={(e) => setEditCourseData(prev => ({...prev, price: e.target.value}))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Capacity *</label>
                  <input
                    type="number"
                    name="capacity"
                    className="input-field"
                    min="1"
                    value={editCourseData.capacity}
                    onChange={(e) => setEditCourseData(prev => ({...prev, capacity: e.target.value}))}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="auto_confirm"
                      checked={editCourseData.auto_confirm}
                      onChange={(e) => setEditCourseData(prev => ({...prev, auto_confirm: e.target.checked}))}
                    />
                    Automatic student confirmation
                  </label>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="button button-success"
                disabled={editLoading}
              >
                {editLoading ? 'Saving changes...' : 'Save Changes'}
              </button>
              <button 
                type="button" 
                className="button button-secondary"
                onClick={() => setActiveTab('terms')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const getTermTypeName = (type) => {
  const typeMap = {
    'LECTURE': 'Lecture',
    'EXERCISE': 'Exercise',
    'EXAM': 'Exam'
  };
  return typeMap[type] || type;
};

export default InstructorCourse;
