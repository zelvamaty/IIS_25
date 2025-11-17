import React, { useState } from 'react';
import './PublicCourses.css';

const PublicCourses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  // Mock data
  const courses = [
    {
      id: 1,
      title: 'Webové technologie',
      type: 'Přednáška',
      description: 'Kurz zaměřený na moderní webové technologie včetně HTML5, CSS3, JavaScript a React frameworku.',
      instructor: 'Dr. Jan Novák',
      terms: 15,
      price: 500
    },
    {
      id: 2,
      title: 'Databázové systémy',
      type: 'Cvičení',
      description: 'Praktický kurz práce s SQL databázemi, návrh databázových schémat a optimalizace dotazů.',
      instructor: 'Ing. Marie Svobodová',
      terms: 12,
      price: 450
    },
    {
      id: 3,
      title: 'Síťové technologie',
      type: 'Přednáška',
      description: 'Úvod do počítačových sítí, protokoly TCP/IP, routing, switching a bezpečnost sítí.',
      instructor: 'Prof. Petr Dvořák',
      terms: 10,
      price: 600
    },
    {
      id: 4,
      title: 'Operační systémy',
      type: 'Zkouška',
      description: 'Studium principů operačních systémů, správa procesů, paměti a souborových systémů.',
      instructor: 'Dr. Jana Procházková',
      terms: 8,
      price: 400
    },
    {
      id: 5,
      title: 'Programování v Pythonu',
      type: 'Cvičení',
      description: 'Praktický kurz programování v jazyce Python pro začátečníky i pokročilé.',
      instructor: 'Mgr. Tomáš Černý',
      terms: 20,
      price: 550
    },
    {
      id: 6,
      title: 'Umělá inteligence',
      type: 'Přednáška',
      description: 'Základy strojového učení, neuronové sítě a moderní AI technologie.',
      instructor: 'Dr. Lucie Veselá',
      terms: 14,
      price: 700
    }
  ];

  const handleSearch = () => {
    console.log('Searching:', searchTerm, filterType);
  };

  return (
    <div className="public-courses">
      <h1 className="page-title">Dostupné kurzy</h1>

      <div className="filter-section">
        <h3>Filtr kurzů:</h3>
        <div className="filter-inputs">
          <div className="form-group">
            <input
              type="text"
              className="input-field"
              placeholder="Hledat kurz..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group">
            <select
              className="input-field"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">Všechny typy</option>
              <option value="prednaska">Přednáška</option>
              <option value="cviceni">Cvičení</option>
              <option value="zkouska">Zkouška</option>
            </select>
          </div>
          <button className="button" onClick={handleSearch}>
            Filtrovat
          </button>
        </div>
      </div>

      <div className="courses-grid">
        {courses.map(course => (
          <div key={course.id} className="course-card">
            <div className="course-card-header">
              <h3>{course.title}</h3>
            </div>
            <div className="course-card-body">
              <p><strong>Typ:</strong> {course.type}</p>
              <p><strong>Popis:</strong> {course.description}</p>
              <p><strong>Lektor:</strong> {course.instructor}</p>
              <p><strong>Počet termínů:</strong> {course.terms}</p>
              <p><strong>Cena:</strong> {course.price} Kč</p>
            </div>
            <div className="course-card-footer">
              <button className="button button-secondary">
                Zobrazit detail
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublicCourses;