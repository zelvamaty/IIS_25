import React, { useState } from 'react';
import './InstructorCourse.css';

const InstructorCourse = ({ userRole = 'Garant' }) => {
  const [activeTab, setActiveTab] = useState('terms');
  
  const courseInfo = {
    name: 'Webové technologie',
    type: 'Přednáška',
    capacity: 30,
    registered: 24
  };

  const terms = [
    { id: 1, name: 'Úvodní přednáška', type: 'Přednáška', date: '15.03.2025', time: '10:00-12:00', room: 'A112', capacity: '30/30' },
    { id: 2, name: 'HTML a CSS', type: 'Cvičení', date: '22.03.2025', time: '10:00-12:00', room: 'A112', capacity: '24/30' },
    { id: 3, name: 'JavaScript základy', type: 'Cvičení', date: '29.03.2025', time: '10:00-12:00', room: 'A112', capacity: '28/30' },
    { id: 4, name: 'React framework', type: 'Přednáška', date: '05.04.2025', time: '10:00-12:00', room: 'A112', capacity: '25/30' }
  ];

  const waitingStudents = [
    { id: 1, name: 'Jan Novák', login: 'xnovak01' },
    { id: 2, name: 'Petr Svoboda', login: 'xsvobo02' },
    { id: 3, name: 'Marie Dvořáková', login: 'xdvora03' }
  ];

  const enrolledStudents = [
    { id: 4, name: 'Karel Procházka', login: 'xproch04', rating: 85 },
    { id: 5, name: 'Eva Nováková', login: 'xnovak05', rating: 92 },
    { id: 6, name: 'Tomáš Svoboda', login: 'xsvobo06', rating: 78 },
    { id: 7, name: 'Jana Dvořáková', login: 'xdvora07', rating: null }
  ];

  const handleNewTerm = () => {
    console.log('Create new term');
  };

  const handleTermDetail = (id) => {
    console.log('View term detail:', id);
  };

  const handleApprove = (studentId) => {
    console.log('Approve student:', studentId);
  };

  const handleReject = (studentId) => {
    console.log('Reject student:', studentId);
  };

  const handleRateStudent = (studentId) => {
    console.log('Rate student:', studentId);
  };

  // Určíme, či je užívateľ garant (má všetky práva)
  const isGuarantor = userRole === 'Garant';

  return (
    <div className="instructor-course">
      <div className="course-info-header">
        <div>
          <h1>{courseInfo.name}</h1>
          <p className="course-meta">
            Typ: {courseInfo.type} | Kapacita: {courseInfo.capacity} | 
            Registrováno: {courseInfo.registered}
          </p>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'terms' ? 'active' : ''}`}
          onClick={() => setActiveTab('terms')}
        >
          Termíny
        </button>
        <button 
          className={`tab ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          Studenti
        </button>
        {isGuarantor && (
          <button 
            className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Nastavení
          </button>
        )}
      </div>

      {activeTab === 'terms' && (
        <div className="tab-content">
          <div className="section-header">
            <h2 className="section-title">Seznam termínů</h2>
            {isGuarantor && (
              <button className="button button-success" onClick={handleNewTerm}>
                + Nový termín
              </button>
            )}
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Název</th>
                  <th>Typ</th>
                  <th>Datum</th>
                  <th>Čas</th>
                  <th>Místnost</th>
                  <th>Kapacita</th>
                  <th>Akce</th>
                </tr>
              </thead>
              <tbody>
                {terms.map(term => (
                  <tr key={term.id}>
                    <td>{term.name}</td>
                    <td>{term.type}</td>
                    <td>{term.date}</td>
                    <td>{term.time}</td>
                    <td>{term.room}</td>
                    <td>{term.capacity}</td>
                    <td>
                      <button 
                        className="button button-small"
                        onClick={() => handleTermDetail(term.id)}
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isGuarantor && waitingStudents.length > 0 && (
            <div className="waiting-students">
              <h3>Čekající studenti na schválení ({waitingStudents.length})</h3>
              <div className="waiting-list">
                {waitingStudents.map(student => (
                  <div key={student.id} className="waiting-student-item">
                    <span className="student-info">
                      {student.name} ({student.login})
                    </span>
                    <div className="student-actions">
                      <button 
                        className="button button-success button-small"
                        onClick={() => handleApprove(student.id)}
                      >
                        Schválit
                      </button>
                      <button 
                        className="button button-danger button-small"
                        onClick={() => handleReject(student.id)}
                      >
                        Odmítnout
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'students' && (
        <div className="tab-content">
          <h2 className="section-title">
            {isGuarantor ? 'Registrovaní studenti' : 'Hodnocení studentů'}
          </h2>
          
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Jméno</th>
                  <th>Login</th>
                  <th>Hodnocení</th>
                  <th>Akce</th>
                </tr>
              </thead>
              <tbody>
                {enrolledStudents.map(student => (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>{student.login}</td>
                    <td>
                      {student.rating ? (
                        <span className="badge badge-success">{student.rating}/100</span>
                      ) : (
                        <span className="badge badge-warning">Nehodnoceno</span>
                      )}
                    </td>
                    <td>
                      <button 
                        className="button button-small"
                        onClick={() => handleRateStudent(student.id)}
                      >
                        {student.rating ? 'Upravit hodnocení' : 'Ohodnotit'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isGuarantor && (
            <div className="info-box">
              <p><strong>ℹ️ Info pro garanta:</strong> Můžete vidět všechny studenty a jejich hodnocení. Lektoři mohou studenty hodnotit.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && isGuarantor && (
        <div className="tab-content">
          <h2 className="section-title">Nastavení kurzu</h2>
          
          <div className="settings-section">
            <h3>Správa lektorů</h3>
            <p>Přidání a odebrání lektorů kurzu</p>
            <button className="button">+ Přidat lektora</button>
          </div>

          <div className="settings-section">
            <h3>Parametry kurzu</h3>
            <p>Úprava základních informací o kurzu</p>
            <button className="button">Upravit kurz</button>
          </div>

          <div className="settings-section">
            <h3>Registrace studentů</h3>
            <label className="checkbox-label">
              <input type="checkbox" defaultChecked />
              <span>Automatické schvalování studentů do limitu kapacity</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorCourse;