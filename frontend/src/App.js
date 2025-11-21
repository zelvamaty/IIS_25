import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/common/Header';
import Navigation from './components/common/Navigation';
import Login from './components/pages/Login';
import PublicCourses from './components/pages/PublicCourses';
import AdminCourses from './components/pages/AdminCourses';
import AdminUsers from './components/pages/AdminUsers';
import AdminDashboard from './components/pages/AdminDashboard';
import AdminRooms from './components/pages/AdminRooms';
import CreateCourse from './components/pages/CreateCourse';
import InstructorCourse from './components/pages/InstructorCourse';
import StudentCourseRegistration from './components/pages/StudentCourseRegistration';
import MyCourses from './components/pages/MyCourses';
import MySchedule from './components/pages/MySchedule';
import UserProfile from './components/pages/UserProfile';
import { authAPI } from './components/services/api';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guestMode, setGuestMode] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userInfo = await authAPI.getCurrentUser();
          setUser(userInfo);
        } catch (err) {
          console.error('Auth check failed:', err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (userInfo) => {
    setUser(userInfo);
  };

  const handleSkipLogin = () => {
    setGuestMode(true);
  };

  const handleShowLogin = () => {
    setGuestMode(false);
    setUser(null);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    setUser(null);
    setGuestMode(false);
  };

  // Map role from backend to frontend
  const mapRole = (backendRole) => {
    const roleMap = {
      'ADMIN': 'Administrátor',
      'USER': 'Student',
      'GUARANTOR': 'Garant',
      'LECTURER': 'Lektor'
    };
    return roleMap[backendRole] || backendRole;
  };

  const mappedUser = user ? {
    ...user,
    name: `${user.first_name} ${user.last_name}`,
    role: mapRole(user.role)
  } : null;

  // Navigation items based on user role
  const getNavigationItems = () => {
    if (!mappedUser) {
      return [
        { label: 'Kurzy', path: '/courses' }
      ];
    }

    if (mappedUser.role === 'Administrátor') {
      return [
        { label: 'Dashboard', path: '/admin/dashboard' },
        { label: 'Kurzy', path: '/admin/courses' },
        { label: 'Uživatelé', path: '/admin/users' },
        { label: 'Místnosti', path: '/admin/rooms' }
      ];
    }

    if (mappedUser.role === 'Garant' || mappedUser.role === 'Lektor') {
      return [
        { label: 'Můj profil', path: '/profile' },
        { label: 'Moje kurzy', path: '/instructor/courses' },
        { label: 'Založit kurz', path: '/create-course' }
      ];
    }

    if (mappedUser.role === 'Student') {
      return [
        { label: 'Můj profil', path: '/profile' },
        { label: 'Zapsané kurzy', path: '/student/my-courses' },  // Premenované
        { label: 'Můj rozvrh', path: '/student/schedule' },
        { label: 'Dostupné kurzy', path: '/courses' },
        { label: 'Moje výukové kurzy', path: '/instructor/courses' }, // PRIDANÉ - kurzy kde som Garant
        { label: 'Vytvořit kurz', path: '/create-course' }
      ];
    }

    return [];
  };

  if (loading) {
    return <div className="loading">Načítání...</div>;
  }

  // If not logged in AND not in guest mode, show login page
  if (!mappedUser && !guestMode) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<Login onLoginSuccess={handleLoginSuccess} onSkipLogin={handleSkipLogin} />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="App">
        <Header user={mappedUser} onLogout={handleLogout} onLogin={handleShowLogin} />
        <Navigation items={getNavigationItems()} />
        
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicCourses user={mappedUser} onShowLogin={handleShowLogin} />} />
          <Route path="/courses" element={<PublicCourses user={mappedUser} onShowLogin={handleShowLogin} />} />
          
          {/* Admin routes */}
          <Route path="/admin/dashboard" element={mappedUser?.role === 'Administrátor' ? <AdminDashboard /> : <Navigate to="/" />} />
          <Route path="/admin/courses" element={mappedUser?.role === 'Administrátor' ? <AdminCourses /> : <Navigate to="/" />} />
          <Route path="/admin/users" element={mappedUser?.role === 'Administrátor' ? <AdminUsers /> : <Navigate to="/" />} />
          <Route path="/admin/rooms" element={mappedUser?.role === 'Administrátor' ? <AdminRooms /> : <Navigate to="/" />} />
          
          <Route path="/create-course" element={mappedUser ? <CreateCourse /> : <Navigate to="/" />} />

          {/* Instructor/Guarantor routes */}
          <Route path="/instructor/courses" element={mappedUser ? <InstructorCourse userRole={mappedUser?.role} /> : <Navigate to="/" />} />
          
          {/* Student routes */}
          <Route path="/student/my-courses" element={mappedUser?.role === 'Student' ? <MyCourses /> : <Navigate to="/" />} />
          <Route path="/student/schedule" element={mappedUser?.role === 'Student' ? <MySchedule /> : <Navigate to="/" />} />
          <Route path="/course/:id" element={mappedUser?.role === 'Student' ? <StudentCourseRegistration /> : <Navigate to="/" />} />
          
          {/* Common routes */}
          <Route path="/profile" element={mappedUser ? <UserProfile user={mappedUser} /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;