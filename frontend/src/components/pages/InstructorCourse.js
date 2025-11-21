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
  
  // Term form state
  const [termFormData, setTermFormData] = useState({
    type: '',
    start_time: '',
    end_time: '',
    room: '',
    capacity: '30',
    requires_registration: true
  });
  const [termLoading, setTermLoading] = useState(false);
  const [termError, setTermError] = useState('');

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
      setError('Nepodařilo se načíst kurzy');
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTermStudents = async (termId) => {
    try {
      const students = await termsAPI.getTermStudents(termId);
      console.log('RAW Term students from API:', JSON.stringify(students, null, 2));
      
      // DEBUG - skontroluj či majú registration_id
      students.forEach(s => {
        console.log(`Student ${s.first_name}: has registration_id? ${!!s.registration_id}, value: ${s.registration_id}`);
      });
      
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
  
    console.log('Selected Registration ID:', selectedRegistrationId); // DEBUG
    console.log('Grade Value:', gradeValue); // DEBUG
  
    if (!selectedRegistrationId || !gradeValue) {
      setGradeError('Vyplňte všechna pole');
      return;
    }
  
    try {
      const gradeData = {
        registration: parseInt(selectedRegistrationId),
        value: parseFloat(gradeValue)
      };
      
      console.log('Sending grade data:', gradeData); // DEBUG
      
      await gradesAPI.createGrade(gradeData);
      
      alert('Hodnocení bylo úspěšně přidáno!');
      setShowGradeForm(false);
      setSelectedRegistrationId('');
      setGradeValue('');
      await loadTermStudents(selectedTerm.id);
    } catch (err) {
      setGradeError(err.message || 'Přidání hodnocení se nezdařilo');
      console.error('Error adding grade:', err);
    }
  };
  
  const handleUpdateGrade = async (gradeId, newValue) => {
    if (!window.confirm('Opravdu chcete změnit hodnocení?')) {
      return;
    }
  
    try {
      await gradesAPI.updateGrade(gradeId, { value: parseFloat(newValue) });
      alert('Hodnocení bylo změněno');
      await loadTermStudents(selectedTerm.id);
    } catch (err) {
      alert(err.message || 'Změna hodnocení se nezdařila');
      console.error('Error updating grade:', err);
    }
  };

  const handleAddLecturer = async (e) => {
    e.preventDefault();
    setLecturerError('');
  
    if (!selectedLecturerId) {
      setLecturerError('Vyberte lektora');
      return;
    }
  
    try {
      await coursesAPI.addLecturer(selectedCourse.id, parseInt(selectedLecturerId));
      alert('Lektor byl úspěšně přidán');
      setShowAddLecturerForm(false);
      setSelectedLecturerId('');
      await loadCourseDetails(selectedCourse.id);
    } catch (err) {
      setLecturerError(err.message || 'Přidání lektora se nezdařilo');
      console.error('Error adding lecturer:', err);
    }
  };
  
  const handleRemoveLecturer = async (lecturerId) => {
    if (!window.confirm('Opravdu chcete odebrat tohoto lektora?')) {
      return;
    }
  
    try {
      await coursesAPI.removeLecturer(selectedCourse.id, lecturerId);
      alert('Lektor byl odebrán');
      await loadCourseDetails(selectedCourse.id);
    } catch (err) {
      alert(err.message || 'Odebrání lektora se nezdařilo');
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
        
        const enrollments = students
          .filter(student => student.role !== 'REJECTED')
          .map(student => ({
            id: student.enrollment_id,
            student: {
              id: student.id,
              username: student.username,
              first_name: student.first_name,
              last_name: student.last_name,
              email: student.email || ''
            },
            approved: student.role === 'APPROVED',
            role: student.role,
            enrolled_at: new Date().toISOString()
          }));
        
        setCourseEnrollments(enrollments);
      } catch (err) {
        console.log('Error loading students:', err);
        setCourseEnrollments([]);
      }
      
      setActiveTab('terms');
    } catch (err) {
      setError('Nepodařilo se načíst detail kurzu');
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

  const handleCreateTerm = async (e) => {
    e.preventDefault();
    setTermLoading(true);
    setTermError('');

    try {
      const termData = {
        course_id: selectedCourse.id,
        type: termFormData.type,
        start_time: new Date(termFormData.start_time).toISOString(),
        end_time: new Date(termFormData.end_time).toISOString(),
        capacity: parseInt(termFormData.capacity),
        requires_registration: termFormData.requires_registration
      };

      if (termFormData.room) {
        termData.room = parseInt(termFormData.room);
      }

      await termsAPI.createTerm(termData);
      alert('Termín byl úspěšně vytvořen!');
      
      setTermFormData({
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
      setTermError(err.message || 'Vytvoření termínu se nezdařilo');
      console.error('Error creating term:', err);
    } finally {
      setTermLoading(false);
    }
  };

  const handleDeleteTerm = async (termId) => {
    if (!window.confirm('Opravdu chcete smazat tento termín?')) {
      return;
    }

    try {
      await termsAPI.deleteTerm(termId);
      alert('Termín byl smazán');
      await loadCourseDetails(selectedCourse.id);
    } catch (err) {
      alert(err.message || 'Smazání termínu se nezdařilo');
      console.error('Error deleting term:', err);
    }
  };

  const handleApproveEnrollment = async (enrollmentId) => {
    if (!selectedCourse) return;
    
    try {
      await coursesAPI.approveEnrollment(selectedCourse.id, enrollmentId);
      alert('Student byl úspěšně schválen');
      await loadCourseDetails(selectedCourse.id);
    } catch (err) {
      alert(err.message || 'Schválení studenta se nezdařilo');
      console.error('Error approving enrollment:', err);
    }
  };

  const handleRejectEnrollment = async (enrollmentId) => {
    if (!selectedCourse) return;
    
    try {
      await coursesAPI.rejectEnrollment(selectedCourse.id, enrollmentId);
      alert('Student byl odmítnut');
      await loadCourseDetails(selectedCourse.id);
    } catch (err) {
      alert(err.message || 'Odmítnutí studenta se nezdařilo');
      console.error('Error rejecting enrollment:', err);
    }
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setCourseEnrollments([]);
    setActiveTab('courses');
  };

  const getRoomName = (roomId) => {
    if (!roomId) return 'Neurčeno';
    const room = rooms.find(r => r.id === roomId);
    return room ? (room.name || `Místnost ${room.id}`) : 'Neurčeno';
  };

  const isGuarantor = selectedCourse && currentUser && selectedCourse.guarantee?.id === currentUser.id;
  const isAdmin = currentUser?.role === 'ADMIN';
  const canManageCourse = isGuarantor || isAdmin;
  
  const pendingEnrollments = courseEnrollments.filter(e => e.role === 'PENDING');
  const approvedEnrollments = courseEnrollments.filter(e => e.role === 'APPROVED');

  if (loading && !currentUser) {
    return (
      <div className="instructor-course">
        <div className="loading-state">
          <p>Načítání kurzů...</p>
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
            Zkusit znovu
          </button>
        </div>
      </div>
    );
  }

  if (!selectedCourse) {
    return (
      <div className="instructor-course">
        <h1 className="page-title">Moje výukové kurzy</h1>
        
        {myCourses.length === 0 ? (
          <div className="empty-state">
            <p>Zatím nemáte žádné kurzy jako garant nebo lektor</p>
            <button className="button" onClick={() => navigate('/create-course')}>
              Vytvořit kurz
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
                        ⏳ Čeká na schválení administrátorem
                      </span>
                    ) : (
                      <span className="badge badge-success">
                        ✓ Schváleno
                      </span>
                    )}
                  </div>
                </div>

                <div className="course-body">
                  <div className="course-info-row">
                    <span><strong>Garant:</strong> {course.guarantee 
                      ? `${course.guarantee.first_name} ${course.guarantee.last_name}`
                      : 'Neznámý'}</span>
                    <span><strong>Kapacita:</strong> {course.enrolled_count}/{course.capacity}</span>
                  </div>

                  <div className="course-info-row">
                    <span><strong>Cena:</strong> {course.price} Kč</span>
                    {course.auto_confirm && (
                      <span className="badge badge-info">✓ Automatické potvrzení</span>
                    )}
                  </div>

                  {course.description && (
                    <p className="course-description">{course.description}</p>
                  )}

                  <button 
                    className="button"
                    onClick={() => loadCourseDetails(course.id)}
                  >
                    Spravovat kurz
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
          ← Zpět na seznam kurzů
        </button>
        <div>
          <h1>{selectedCourse.title}</h1>
          <p className="course-meta">
            Kód: {selectedCourse.code} | Kapacita: {selectedCourse.capacity} | 
            Registrováno: {selectedCourse.enrolled_count}
          </p>
          {!selectedCourse.approved && (
            <p className="warning-message">
              ⚠️ Kurz čeká na schválení administrátorem
            </p>
          )}
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'terms' ? 'active' : ''}`}
          onClick={() => setActiveTab('terms')}
        >
          Termíny ({courseTerms.length})
        </button>
        <button 
          className={`tab ${activeTab === 'enrollments' ? 'active' : ''}`}
          onClick={() => setActiveTab('enrollments')}
        >
          Zápisy ({approvedEnrollments.length})
        </button>
        {canManageCourse && (
          <button 
            className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Čekající ({pendingEnrollments.length})
          </button>
        )}
        {canManageCourse && (
          <button 
            className={`tab ${activeTab === 'lecturers' ? 'active' : ''}`}
            onClick={() => setActiveTab('lecturers')}
          >
            Lektoři ({selectedCourse.lecturers?.length || 0})
          </button>
        )}
      </div>

      {activeTab === 'terms' && (
        <div className="tab-content">
          <div className="section-header">
            <h2 className="section-title">Termíny kurzu</h2>
            {canManageCourse && (
              <button 
                className="button button-success"
                onClick={() => setActiveTab('create-term')}
              >
                + Vytvořit termín
              </button>
            )}
          </div>

          {courseTerms.length === 0 ? (
            <div className="empty-state">
              <p>Zatím nejsou vytvořené žádné termíny</p>
              {canManageCourse && (
                <button 
                  className="button button-success"
                  onClick={() => setActiveTab('create-term')}
                >
                  + Vytvořit první termín
                </button>
              )}
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Typ</th>
                    <th>Datum a čas</th>
                    <th>Místnost</th>
                    <th>Kapacita</th>
                    <th>Registrací</th>
                    {canManageCourse && <th>Akce</th>}
                  </tr>
                </thead>
                <tbody>
                  {courseTerms.map(term => (
                    <tr key={term.id}>
                      <td>{getTermTypeName(term.type)}</td>
                      <td>
                        {new Date(term.start_time).toLocaleString('cs-CZ', {
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
                      {canManageCourse && (
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              className="button button-small"
                              onClick={() => handleViewTermDetail(term)}
                            >
                              Detail
                            </button>
                            <button 
                              className="button button-danger button-small"
                              onClick={() => handleDeleteTerm(term.id)}
                            >
                              Smazat
                            </button>
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

      {activeTab === 'term-detail' && selectedTerm && canManageCourse && (
        <div className="tab-content">
          <div className="section-header">
            <h2 className="section-title">
              Detail termínu - {getTermTypeName(selectedTerm.type)}
            </h2>
            <button 
              className="button button-secondary"
              onClick={handleBackToTerms}
            >
              ← Zpět na termíny
            </button>
          </div>

          <div className="term-info-box">
            <p><strong>Datum:</strong> {new Date(selectedTerm.start_time).toLocaleString('cs-CZ')}</p>
            <p><strong>Místnost:</strong> {getRoomName(selectedTerm.room)}</p>
            <p><strong>Kapacita:</strong> {selectedTerm.registrations_count || 0}/{selectedTerm.capacity}</p>
          </div>

          <div className="section-header">
            <h3>Registrovaní studenti ({termStudents.length})</h3>
            {!showGradeForm && (
              <button 
                className="button button-success"
                onClick={() => setShowGradeForm(true)}
              >
                + Přidat hodnocení
              </button>
            )}
          </div>

          {showGradeForm && (
            <div className="grade-form-container">
              <h4>Přidat hodnocení studentovi</h4>
              
              {gradeError && (
                <div className="error-message">{gradeError}</div>
              )}

              <form onSubmit={handleAddGrade} className="grade-form">
                <div className="form-group">
                  <label className="form-label">Student *</label>
                  <select
  className="input-field"
  value={selectedRegistrationId}
  onChange={(e) => {
    console.log('Selected value:', e.target.value); // DEBUG
    setSelectedRegistrationId(e.target.value);
  }}
  required
>
  <option value="">-- Vyberte studenta --</option>
  {termStudents
    .filter(s => !s.grade)
    .map(student => (
      <option 
        key={student.registration_id} 
        value={student.registration_id}  // ✅ TOTO MUSÍ BYŤ registration_id
      >
        {student.first_name} {student.last_name} ({student.username})
      </option>
    ))
  }
</select>
                </div>

                <div className="form-group">
                  <label className="form-label">Hodnocení (0-100) *</label>
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
                    ✓ Přidat hodnocení
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
                    Zrušit
                  </button>
                </div>
              </form>
            </div>
          )}

          {termStudents.length === 0 ? (
            <div className="empty-state">
              <p>Na tento termín není zatím nikdo zaregistrován</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Registrace</th>
                    <th>Hodnocení</th>
                    <th>Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {termStudents.map(student => (
                    <tr key={student.registration_id}>
                      <td>
                        {student.first_name} {student.last_name}
                        <br />
                        <small style={{ color: '#64748b' }}>({student.username})</small>
                      </td>
                      <td>
                        {new Date(student.registered_at).toLocaleDateString('cs-CZ')}
                      </td>
                      <td>
  {student.grade ? (
    <div>
      <strong style={{ color: '#3b82f6', fontSize: '18px' }}>
        {student.grade}
      </strong>
    </div>
  ) : (
    <span style={{ color: '#94a3b8' }}>Nehodnoceno</span>
  )}
</td>
                      <td>
  {student.grade && (
    <button 
      className="button button-small"
      onClick={() => {
        const newValue = prompt('Nové hodnocení (0-100):', student.grade);
        if (newValue) {
          // Musíme nájsť grade ID - backend to nevracia, tak použijeme registration_id
          alert('Úprava známky zatím nefunguje - backend nevracia grade.id');
          // TODO: Backend musí vrátiť aj grade.id na úpravu
        }
      }}
    >
      Upravit
    </button>
  )}
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
            <h2 className="section-title">Vytvořit nový termín</h2>
            <button 
              className="button button-secondary"
              onClick={() => setActiveTab('terms')}
            >
              ← Zpět
            </button>
          </div>

          <form onSubmit={handleCreateTerm} className="term-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Typ termínu *</label>
                <select
                  name="type"
                  className="input-field"
                  value={termFormData.type}
                  onChange={handleTermFormChange}
                  required
                >
                  <option value="">Vyberte typ</option>
                  <option value="LECTURE">Přednáška</option>
                  <option value="EXERCISE">Cvičení</option>
                  <option value="EXAM">Zkouška</option>
                </select>
              </div>
            </div>

            <div className="form-row two-columns">
              <div className="form-group">
                <label className="form-label">Datum a čas začátku *</label>
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
                <label className="form-label">Datum a čas konce *</label>
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
                <label className="form-label">Místnost</label>
                <select
                  name="room"
                  className="input-field"
                  value={termFormData.room}
                  onChange={handleTermFormChange}
                >
                  <option value="">Bez místnosti</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.name || `Místnost ${room.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Kapacita *</label>
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
                  Vyžaduje registraci studentů
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
                {termLoading ? '⏳ Vytvářím...' : '✓ Vytvořit termín'}
              </button>
              <button 
                type="button" 
                className="button button-secondary"
                onClick={() => setActiveTab('terms')}
              >
                Zrušit
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'enrollments' && (
        <div className="tab-content">
          <h2 className="section-title">Schválení studenti</h2>
          
          {approvedEnrollments.length === 0 ? (
            <div className="empty-state">
              <p>Zatím nejsou žádní schválení studenti</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Datum zápisu</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedEnrollments.map(enrollment => (
                    <tr key={enrollment.id}>
                      <td>
                        {enrollment.student 
                          ? `${enrollment.student.first_name} ${enrollment.student.last_name}`
                          : 'Neznámý'}
                      </td>
                      <td>{enrollment.student?.email || '-'}</td>
                      <td>
                        {new Date(enrollment.enrolled_at).toLocaleDateString('cs-CZ')}
                      </td>
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
            <h2 className="section-title">Lektoři kurzu</h2>
            {!showAddLecturerForm && (
              <button 
                className="button button-success"
                onClick={() => setShowAddLecturerForm(true)}
              >
                + Přidat lektora
              </button>
            )}
          </div>

          {showAddLecturerForm && (
            <div className="add-lecturer-form">
              <h3>Přidat lektora</h3>
              
              {lecturerError && (
                <div className="error-message">
                  {lecturerError}
                </div>
              )}

              <form onSubmit={handleAddLecturer}>
                <div className="form-group">
                  <label className="form-label">Vyberte uživatele *</label>
                  <select
                    className="input-field"
                    value={selectedLecturerId}
                    onChange={(e) => setSelectedLecturerId(e.target.value)}
                    required
                  >
                    <option value="">-- Vyberte lektora --</option>
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
                    ✓ Přidat lektora
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
                    Zrušit
                  </button>
                </div>
              </form>
            </div>
          )}

          {selectedCourse.lecturers && selectedCourse.lecturers.length > 0 ? (
            <div className="lecturers-list">
              <h3>Seznam lektorů</h3>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Jméno</th>
                      <th>Uživatelské jméno</th>
                      <th>Email</th>
                      <th>Akce</th>
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
                            Odebrat
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>Kurz zatím nemá žádné lektory</p>
            </div>
          )}

          <div className="info-box">
            <p><strong>ℹ️ Info:</strong> Lektoři mohou hodnotit studenty a spravovat termíny kurzu.</p>
          </div>
        </div>
      )}

      {activeTab === 'pending' && canManageCourse && (
        <div className="tab-content">
          <h2 className="section-title">Čekající studenti na schválení</h2>
          
          {pendingEnrollments.length === 0 ? (
            <div className="empty-state">
              <p>Žádní studenti nečekají na schválení</p>
            </div>
          ) : (
            <div className="waiting-list">
              {pendingEnrollments.map(enrollment => (
                <div key={enrollment.id} className="waiting-student-item">
                  <span className="student-info">
                    {enrollment.student 
                      ? `${enrollment.student.first_name} ${enrollment.student.last_name} (${enrollment.student.username})`
                      : 'Neznámý'}
                  </span>
                  <div className="student-actions">
                    <button 
                      className="button button-success button-small"
                      onClick={() => handleApproveEnrollment(enrollment.id)}
                    >
                      ✓ Schválit
                    </button>
                    <button 
                      className="button button-danger button-small"
                      onClick={() => handleRejectEnrollment(enrollment.id)}
                    >
                      ✗ Odmítnout
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const getTermTypeName = (type) => {
  const typeMap = {
    'LECTURE': 'Přednáška',
    'EXERCISE': 'Cvičení',
    'EXAM': 'Zkouška'
  };
  return typeMap[type] || type;
};

export default InstructorCourse;