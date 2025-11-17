import React, { useState } from 'react';
import './MySchedule.css';

const MySchedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'

  // Mock schedule data
  const scheduleEvents = [
    {
      id: 1,
      courseName: 'Webové technologie',
      termName: 'React framework',
      date: '2025-03-19',
      startTime: '10:00',
      endTime: '12:00',
      room: 'A112',
      type: 'Přednáška',
      instructor: 'Dr. Jan Novák'
    },
    {
      id: 2,
      courseName: 'Databázové systémy',
      termName: 'SQL pokročilé',
      date: '2025-03-19',
      startTime: '14:00',
      endTime: '16:00',
      room: 'B205',
      type: 'Cvičení',
      instructor: 'Ing. Marie Svobodová'
    },
    {
      id: 3,
      courseName: 'Webové technologie',
      termName: 'Deployment',
      date: '2025-03-21',
      startTime: '10:00',
      endTime: '12:00',
      room: 'A112',
      type: 'Přednáška',
      instructor: 'Dr. Jan Novák'
    },
    {
      id: 4,
      courseName: 'Umělá inteligence',
      termName: 'Neural Networks',
      date: '2025-03-22',
      startTime: '13:00',
      endTime: '15:00',
      room: 'C301',
      type: 'Přednáška',
      instructor: 'Dr. Lucie Veselá'
    }
  ];

  const getWeekDays = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay() + 1); // Monday
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return scheduleEvents.filter(event => event.date === dateStr);
  };

  const formatDate = (date) => {
    const days = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
    const months = ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 
                    'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'];
    return {
      dayName: days[date.getDay()],
      dayNumber: date.getDate(),
      monthName: months[date.getMonth()],
      year: date.getFullYear()
    };
  };

  const changeWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const weekDays = getWeekDays();
  const { monthName, year } = formatDate(currentDate);

  return (
    <div className="my-schedule">
      <div className="schedule-header">
        <h1 className="page-title">Můj rozvrh</h1>
        
        <div className="schedule-controls">
          <button className="button button-secondary" onClick={() => changeWeek(-1)}>
            ← Předchozí týden
          </button>
          <button className="button" onClick={goToToday}>
            Dnes
          </button>
          <button className="button button-secondary" onClick={() => changeWeek(1)}>
            Následující týden →
          </button>
        </div>
        
        <div className="current-period">
          <h2>{monthName} {year}</h2>
        </div>
      </div>

      <div className="schedule-content">
        <div className="week-view">
          {weekDays.map((day, index) => {
            const { dayName, dayNumber } = formatDate(day);
            const events = getEventsForDate(day);
            const isToday = day.toDateString() === new Date().toDateString();
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;

            return (
              <div 
                key={index} 
                className={`day-column ${isToday ? 'today' : ''} ${isWeekend ? 'weekend' : ''}`}
              >
                <div className="day-header">
                  <div className="day-name">{dayName}</div>
                  <div className={`day-number ${isToday ? 'today-badge' : ''}`}>
                    {dayNumber}
                  </div>
                </div>

                <div className="day-events">
                  {events.length > 0 ? (
                    events.map(event => (
                      <div key={event.id} className="event-card">
                        <div className="event-time">
                          {event.startTime} - {event.endTime}
                        </div>
                        <div className="event-course">{event.courseName}</div>
                        <div className="event-term">{event.termName}</div>
                        <div className="event-details">
                          <span>📍 {event.room}</span>
                          <span>👨‍🏫 {event.instructor}</span>
                        </div>
                        <div className="event-type-badge">
                          {event.type}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-events">
                      {isWeekend ? 'Víkend' : 'Žádné termíny'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming events list */}
      <div className="upcoming-section">
        <h2 className="section-title">Nadcházející termíny</h2>
        <div className="upcoming-list">
          {scheduleEvents.slice(0, 5).map(event => (
            <div key={event.id} className="upcoming-item">
              <div className="upcoming-date">
                <div className="upcoming-day">{new Date(event.date).getDate()}</div>
                <div className="upcoming-month">
                  {new Date(event.date).toLocaleDateString('cs-CZ', { month: 'short' })}
                </div>
              </div>
              <div className="upcoming-info">
                <h4>{event.courseName}</h4>
                <p>{event.termName}</p>
                <div className="upcoming-details">
                  <span>🕐 {event.startTime} - {event.endTime}</span>
                  <span>📍 {event.room}</span>
                  <span>👨‍🏫 {event.instructor}</span>
                </div>
              </div>
              <div className="upcoming-type">
                <span className="badge badge-info">{event.type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MySchedule;