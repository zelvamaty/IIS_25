import React, { useState } from 'react';
import './StudentCourseRegistration.css';

const StudentCourseRegistration = () => {
  const courseDetails = {
    name: 'Webové technologie',
    type: 'Přednáška a cvičení',
    instructor: 'Dr. Jan Novák',
    description: 'Kurz zaměřený na moderní webové technologie včetně HTML5, CSS3, JavaScript a React frameworku. Studenti se naučí vytvářet responzivní webové aplikace.',
    rating: 85,
    price: 500
  };

  const availableTerms = [
    {
      id: 1,
      name: 'Termín 1 - Úvodní přednáška',
      date: '15.03.2025',
      time: '10:00-12:00',
      room: 'A112',
      capacity: '5/30',
      available: true
    },
    {
      id: 2,
      name: 'Termín 2 - HTML a CSS',
      date: '22.03.2025',
      time: '10:00-12:00',
      room: 'A112',
      capacity: '15/30',
      available: false
    },
    {
      id: 3,
      name: 'Termín 3 - JavaScript',
      date: '29.03.2025',
      time: '10:00-12:00',
      room: 'A112',
      capacity: '20/30',
      available: false
    }
  ];

  const [selectedTerm, setSelectedTerm] = useState(null);

  const handleRegister = (termId) => {
    setSelectedTerm(termId);
    console.log('Registering for term:', termId);
  };

  const handleRateCourse = () => {
    console.log('Rate course');
  };

  return (
    <div className="student-course-registration">
      <h1 className="page-title">Detail kurzu</h1>

      <div className="course-detail-card">
        <h2>{courseDetails.name}</h2>
        <div className="course-info">
          <p><strong>Typ:</strong> {courseDetails.type}</p>
          <p><strong>Garant:</strong> {courseDetails.instructor}</p>
          <p><strong>Popis:</strong> {courseDetails.description}</p>
          <p><strong>Celkové hodnocení:</strong> {courseDetails.rating}/100</p>
          <p><strong>Cena:</strong> {courseDetails.price} Kč</p>
        </div>
      </div>

      <h2 className="section-title">Dostupné termíny pro registraci</h2>

      <div className="terms-grid">
        {availableTerms.map(term => (
          <div key={term.id} className="term-card">
            <div className="term-card-header">
              <h3>{term.name}</h3>
            </div>
            <div className="term-card-body">
              <div className="term-info-item">
                <span className="term-icon">📅</span>
                <span>Datum: {term.date}</span>
              </div>
              <div className="term-info-item">
                <span className="term-icon">🕐</span>
                <span>Čas: {term.time}</span>
              </div>
              <div className="term-info-item">
                <span className="term-icon">📍</span>
                <span>Místnost: {term.room}</span>
              </div>
              <div className="term-info-item">
                <span className="term-icon">👥</span>
                <span>Obsazeno: {term.capacity}</span>
              </div>
            </div>
            <div className="term-card-footer">
              {term.available ? (
                <button 
                  className="button button-success full-width"
                  onClick={() => handleRegister(term.id)}
                >
                  Registrovat
                </button>
              ) : (
                <button 
                  className="button full-width"
                  onClick={() => handleRegister(term.id)}
                >
                  Plno - Čekací listina
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="rating-section">
        <h3>Moje hodnocení kurzu</h3>
        <p>Po dokončení všech termínů můžete kurz ohodnotit</p>
        <button className="button button-secondary" onClick={handleRateCourse}>
          Ohodnotit kurz
        </button>
      </div>
    </div>
  );
};

export default StudentCourseRegistration;