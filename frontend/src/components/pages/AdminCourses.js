import React, { useState } from 'react';
import './AdminCourses.css';

const AdminCourses = () => {
  const [courses] = useState([
    { id: 1, name: 'Webové technologie', type: 'Přednáška', instructor: 'Dr. Novák', capacity: '30/30', status: 'Aktivní' },
    { id: 2, name: 'Databázové systémy', type: 'Cvičení', instructor: 'Ing. Svobodová', capacity: '24/25', status: 'Aktivní' },
    { id: 3, name: 'Síťové technologie', type: 'Přednáška', instructor: 'Prof. Dvořák', capacity: '28/30', status: 'Aktivní' },
    { id: 4, name: 'Programování v Pythonu', type: 'Cvičení', instructor: 'Mgr. Černý', capacity: '20/25', status: 'Aktivní' },
    { id: 5, name: 'Umělá inteligence', type: 'Přednáška', instructor: 'Dr. Veselá', capacity: '15/20', status: 'Neaktivní' }
  ]);

  const handleNewCourse = () => {
    console.log('Create new course');
  };

  const handleEdit = (id) => {
    console.log('Edit course:', id);
  };

  const handleDelete = (id) => {
    console.log('Delete course:', id);
  };

  return (
    <div className="admin-courses">
      <div className="page-header">
        <h1 className="page-title">Správa kurzů</h1>
        <button className="button button-success" onClick={handleNewCourse}>
          + Nový kurz
        </button>
      </div>

      <div className="courses-table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Název</th>
              <th>Typ</th>
              <th>Lektor</th>
              <th>Kapacita</th>
              <th>Stav</th>
              <th>Akce</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(course => (
              <tr key={course.id}>
                <td>{course.name}</td>
                <td>{course.type}</td>
                <td>{course.instructor}</td>
                <td>{course.capacity}</td>
                <td>
                  <span className={`badge ${course.status === 'Aktivní' ? 'badge-success' : 'badge-warning'}`}>
                    {course.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="button button-small" 
                      onClick={() => handleEdit(course.id)}
                    >
                      Upravit
                    </button>
                    <button 
                      className="button button-danger button-small" 
                      onClick={() => handleDelete(course.id)}
                    >
                      Smazat
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="statistics-section">
        <h2 className="section-title">Statistiky</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">24</div>
            <div className="stat-label">Celkem kurzů</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">18</div>
            <div className="stat-label">Aktivní kurzy</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">342</div>
            <div className="stat-label">Registrovaní studenti</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCourses;