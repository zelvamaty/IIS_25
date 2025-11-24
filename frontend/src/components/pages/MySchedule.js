import React, { useState, useEffect } from 'react';
import './MySchedule.css';
import { termsAPI, roomsAPI } from '../services/api';

const MySchedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduleEvents, setScheduleEvents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSchedule();
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const roomsData = await roomsAPI.getRooms();
      setRooms(roomsData);
    } catch (err) {
      console.error('Error loading rooms:', err);
    }
  };

  const getRoomName = (roomId) => {
    if (!roomId) return 'Not specified';
    const room = rooms.find(r => r.id === roomId);
    return room ? (room.name || `Room ${room.id}`) : 'Unknown';
  };

  const loadSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await termsAPI.getSchedule();
      
      const transformedEvents = data.map(term => {
        return {
          id: term.id,
          courseName: term.course || 'Untitled',
          termType: getTermTypeName(term.type),
          termTitle: term.title || '',
          termDescription: term.description || '',
          date: term.start_time.split('T')[0],
          startTime: new Date(term.start_time).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
          }),
          endTime: new Date(term.end_time).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
          }),
          roomId: term.room,
          courseCode: '',
          capacity: term.capacity || 0,
          requiresRegistration: term.requires_registration || false
        };
      });
  
      setScheduleEvents(transformedEvents);
    } catch (err) {
      setError('Failed to load schedule');
      console.error('Error loading schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTermTypeName = (type) => {
    const typeMap = {
      'LECTURE': 'Lecture',
      'EXERCISE': 'Exercise',
      'EXAM': 'Exam'
    };
    return typeMap[type] || type;
  };

  const getWeekDays = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay() + 1);
    
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
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
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
          <p>Loading schedule...</p>
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
            Try again
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
            ← Previous week
          </button>
          <button className="button" onClick={goToToday}>
            Today
          </button>
          <button className="button button-secondary" onClick={() => changeWeek(1)}>
            Next week →
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
                        {event.termTitle && (
                          <div className="event-title">{event.termTitle}</div>
                        )}
                        <div className="event-course">{event.courseName}</div>
                        {event.courseCode && (
                          <div className="event-code">{event.courseCode}</div>
                        )}
                        <div className="event-type-badge">
                          {event.termType}
                        </div>
                        <div className="event-details">
                          <span>📍 {getRoomName(event.roomId)}</span>
                        </div>
                        {event.requiresRegistration && (
                          <div className="requires-registration">
                            ✓ Requires registration
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="no-events">
                      {isWeekend ? 'Weekend' : 'No terms'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {upcomingEvents.length > 0 && (
        <div className="upcoming-section">
          <h2 className="section-title">Upcoming Terms</h2>
          <div className="upcoming-list">
            {upcomingEvents.map(event => (
              <div key={event.id} className="upcoming-item">
                <div className="upcoming-date">
                  <div className="upcoming-day">{new Date(event.date).getDate()}</div>
                  <div className="upcoming-month">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                </div>
                <div className="upcoming-info">
                  {event.termTitle && <h4>{event.termTitle}</h4>}
                  <h4>{event.courseName}</h4>
                  <p>{event.termType}</p>
                  <div className="upcoming-details">
                    <span>🕐 {event.startTime} - {event.endTime}</span>
                    <span>📍 {getRoomName(event.roomId)}</span>
                  </div>
                </div>
                <div className="upcoming-type">
                  <span className="badge badge-info">{event.termType}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {scheduleEvents.length === 0 && !loading && (
        <div className="empty-state">
          <p>You have no scheduled terms</p>
        </div>
      )}
    </div>
  );
};

export default MySchedule;