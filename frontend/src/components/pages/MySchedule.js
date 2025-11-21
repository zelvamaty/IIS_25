import React, { useState, useEffect } from 'react';
import './MySchedule.css';
import { termsAPI } from '../services/api';

const MySchedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduleEvents, setScheduleEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await termsAPI.getSchedule();
      
      // Transform API data to match component format
      const transformedEvents = data.map(term => ({
        id: term.id,
        courseName: term.course?.title || 'Bez názvu',
        termName: getTermTypeName(term.type),
        date: term.start_time.split('T')[0], // Extract date from ISO string
        startTime: new Date(term.start_time).toLocaleTimeString('cs-CZ', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        endTime: new Date(term.end_time).toLocaleTimeString('cs-CZ', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        room: term.room || 'Neznámá',
        type: getTermTypeName(term.type),
        instructor: term.course?.guarantee 
          ? `${term.course.guarantee.first_name} ${term.course.guarantee.last_name}`
          : 'Neznámý',
        courseCode: term.course?.code || '',
        capacity: term.capacity,
        requiresRegistration: term.requires_registration
      }));

      setScheduleEvents(transformedEvents);
    } catch (err) {
      setError('Nepodařilo se načíst rozvrh');
      console.error('Error loading schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTermTypeName = (type) => {
    const typeMap = {
      'LECTURE': 'Přednáška',
      'EXERCISE': 'Cvičení',
      'EXAM': 'Zkouška'
    };
    return typeMap[type] || type;
  };

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

  const getUpcomingEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return scheduleEvents
      .filter(event => new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
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

  if (loading) {
    return (
      <div className="my-schedule">
        <div className="loading-state">
          <p>Načítání rozvrhu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-schedule">
        <div className="error-state">
          <p>{error}</p>
          <button className="button" onClick={loadSchedule}>
            Zkusit znovu
          </button>
        </div>
      </div>
    );
  }

  const weekDays = getWeekDays();
  const { monthName, year } = formatDate(currentDate);
  const upcomingEvents = getUpcomingEvents();

  return (
    <div className="my-schedule">
      <div className="schedule-header">
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
                        {event.courseCode && (
                          <div className="event-code">{event.courseCode}</div>
                        )}
                        <div className="event-term">{event.termName}</div>
                        <div className="event-details">
                          <span>📍 Místnost {event.room}</span>
                          <span>👨‍🏫 {event.instructor}</span>
                        </div>
                        {event.requiresRegistration && (
                          <div className="requires-registration">
                            ✓ Vyžaduje registraci
                          </div>
                        )}
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
      {upcomingEvents.length > 0 && (
        <div className="upcoming-section">
          <h2 className="section-title">Nadcházející termíny</h2>
          <div className="upcoming-list">
            {upcomingEvents.map(event => (
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
                    <span>📍 Místnost {event.room}</span>
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
      )}

      {scheduleEvents.length === 0 && !loading && (
        <div className="empty-state">
          <p>Nemáte žádné naplánované termíny</p>
        </div>
      )}
    </div>
  );
};

export default MySchedule;