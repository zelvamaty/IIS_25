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
      setError('Nepodařilo se načíst kurzy');
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewCourse = () => {
    navigate('/create-course');
  };

  const handleManageCourse = (courseId) => {
    // Přesměrovat na detail kurzu v InstructorCourse
    navigate('/instructor/courses', { state: { selectedCourseId: courseId } });
  };

  const handleApproveCourse = async (id, title) => {
    if (!window.confirm(`Schválit kurz "${title}"?`)) {
      return;
    }

    try {
      await coursesAPI.approveCourse(id);
      alert('Kurz byl schválen');
      await loadCourses();
    } catch (err) {
      alert(err.message || 'Schválení kurzu se nezdařilo');
      console.error('Error approving course:', err);
    }
  };

  const handleRejectCourse = async (id, title) => {
    if (!window.confirm(`Odmítnout kurz "${title}"?`)) {
      return;
    }

    try {
      await coursesAPI.rejectCourse(id);
      alert('Kurz byl odmítnut');
      await loadCourses();
    } catch (err) {
      alert(err.message || 'Odmítnutí kurzu se nezdařilo');
      console.error('Error rejecting course:', err);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Opravdu chcete smazat kurz "${title}"?`)) {
      return;
    }

    try {
      await coursesAPI.deleteCourse(id);
      alert('Kurz byl smazán');
      await loadCourses();
    } catch (err) {
      alert(err.message || 'Smazání kurzu se nezdařilo');
      console.error('Error deleting course:', err);
    }
  };

  const getCourseTypeName = (type) => {
    const typeMap = {
      'LECTURE': 'Přednáška',
      'EXERCISE': 'Cvičení',
      'EXAM': 'Zkouška'
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
          <p>Načítání kurzů...</p>
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
            Zkusit znovu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-courses">
      <div className="page-header">
        <h1 className="page-title">Správa kurzů</h1>
        <button className="button button-success" onClick={handleNewCourse}>
          ➕ Nový kurz
        </button>
      </div>

      {/* Filters */}
      <div className="filter-section">
        <div className="filter-inputs">
          <div className="form-group">
            <label className="form-label">Hledat kurz</label>
            <input
              type="text"
              className="input-field"
              placeholder="Název nebo kód kurzu..."
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
              <option value="">Všechny kurzy</option>
              <option value="approved">Schválené</option>
              <option value="pending">Čekající na schválení</option>
            </select>
          </div>
        </div>
      </div>

     

      {/* Courses Table */}
      {filteredCourses.length === 0 ? (
        <div className="empty-state">
          <p>Žádné kurzy nenalezeny</p>
        </div>
      ) : (
        <div className="courses-table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Kód</th>
                <th>Název</th>
                <th>Garant</th>
                <th>Kapacita</th>
                <th>Cena</th>
                <th>Stav</th>
                <th>Akce</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map(course => (
                <tr key={course.id}>
                  <td><strong>{course.code}</strong></td>
                  <td>{course.title}</td>
                  <td>
                    {course.guarantee 
                      ? `${course.guarantee.first_name} ${course.guarantee.last_name}`
                      : 'Neznámý'}
                  </td>
                  <td>
                    <span className={course.enrolled_count >= course.capacity ? 'capacity-full' : 'capacity-available'}>
                      {course.enrolled_count}/{course.capacity}
                    </span>
                  </td>
                  <td>{course.price} Kč</td>
                  <td>
                    {course.approved ? (
                      <span className="badge badge-success">
                        ✓ Schváleno
                      </span>
                    ) : (
                      <span className="badge badge-warning">
                        ⏳ Čeká na schválení
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="button button-small" 
                        onClick={() => handleManageCourse(course.id)}
                      >
                        ⚙️ Spravovat
                      </button>
                      {!course.approved && (
                        <>
                          <button 
                            className="button button-success button-small" 
                            onClick={() => handleApproveCourse(course.id, course.title)}
                          >
                            ✓ Schválit
                          </button>
                          <button 
                            className="button button-warning button-small" 
                            onClick={() => handleRejectCourse(course.id, course.title)}
                          >
                            ✗ Odmítnout
                          </button>
                        </>
                      )}
                      <button 
                        className="button button-danger button-small" 
                        onClick={() => handleDelete(course.id, course.title)}
                      >
                        🗑️ Smazat
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;