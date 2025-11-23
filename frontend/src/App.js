import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
import EditCourse from './components/pages/EditCourse';
import './App.css';

function AppContent() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guestMode, setGuestMode] = useState(false);

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
    const mappedRole = mapRole(userInfo.role);
    if (mappedRole === 'Administrator') {
      navigate('/admin/dashboard');
    } else {
      navigate('/courses');
    }
  };

  const handleSkipLogin = () => {
    setGuestMode(true);
    navigate('/courses');
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
    navigate('/courses');
  };

  const mapRole = (backendRole) => {
    const roleMap = {
      'ADMIN': 'Administrator',
      'USER': 'Student',
      'GUARANTOR': 'Guarantor',
      'LECTURER': 'Lecturer'
    };
    return roleMap[backendRole] || backendRole;
  };

  const mappedUser = user ? {
    ...user,
    name: `${user.first_name} ${user.last_name}`,
    role: mapRole(user.role)
  } : null;

  const getNavigationItems = () => {
    if (!mappedUser) {
      return [
        { label: 'Courses', path: '/courses' }
      ];
    }

    if (mappedUser.role === 'Administrator') {
      return [
        { label: 'Dashboard', path: '/admin/dashboard' },
        { label: 'Courses', path: '/admin/courses' },
        { label: 'Users', path: '/admin/users' },
        { label: 'Rooms', path: '/admin/rooms' },
        { label: 'My Teaching Courses', path: '/instructor/courses' },
        { label: 'Create Course', path: '/create-course' }
      ];
    }

    if (mappedUser.role === 'Guarantor' || mappedUser.role === 'Lecturer') {
      return [
        { label: 'My Profile', path: '/profile' },
        { label: 'My Courses', path: '/instructor/courses' },
        { label: 'Create Course', path: '/create-course' }
      ];
    }

    if (mappedUser.role === 'Student') {
      return [
        { label: 'My Profile', path: '/profile' },
        { label: 'Enrolled Courses', path: '/student/my-courses' },
        { label: 'My Schedule', path: '/student/schedule' },
        { label: 'Available Courses', path: '/courses' },
        { label: 'My Teaching Courses', path: '/instructor/courses' },
        { label: 'Create Course', path: '/create-course' }
      ];
    }

    return [];
  };

  const getDefaultRoute = () => {
    if (!mappedUser) {
      return '/courses';
    }
    
    if (mappedUser.role === 'Administrator') {
      return '/admin/dashboard';
    }
    
    return '/courses';
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!mappedUser && !guestMode) {
    return <Login onLoginSuccess={handleLoginSuccess} onSkipLogin={handleSkipLogin} />;
  }

  return (
    <div className="App">
      <Header user={mappedUser} onLogout={handleLogout} onLogin={handleShowLogin} />
      <Navigation items={getNavigationItems()} />
      
      <Routes>
        <Route path="/edit-course/:id" element={<EditCourse />} />
        <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
        <Route path="/courses" element={<PublicCourses user={mappedUser} onShowLogin={handleShowLogin} />} />
        
        <Route path="/admin/dashboard" element={mappedUser?.role === 'Administrator' ? <AdminDashboard /> : <Navigate to="/courses" />} />
        <Route path="/admin/courses" element={mappedUser?.role === 'Administrator' ? <AdminCourses /> : <Navigate to="/courses" />} />
        <Route path="/admin/users" element={mappedUser?.role === 'Administrator' ? <AdminUsers /> : <Navigate to="/courses" />} />
        <Route path="/admin/rooms" element={mappedUser?.role === 'Administrator' ? <AdminRooms /> : <Navigate to="/courses" />} />
        
        <Route path="/create-course" element={mappedUser ? <CreateCourse /> : <Navigate to="/courses" />} />
        <Route 
          path="/instructor/courses" 
          element={mappedUser ? <InstructorCourse userRole={mappedUser?.role} /> : <Navigate to="/courses" />} 
        />
        
        <Route path="/student/my-courses" element={mappedUser?.role === 'Student' ? <MyCourses /> : <Navigate to="/courses" />} />
        <Route path="/student/schedule" element={mappedUser?.role === 'Student' ? <MySchedule /> : <Navigate to="/courses" />} />
        <Route path="/course/:id" element={mappedUser?.role === 'Student' ? <StudentCourseRegistration /> : <Navigate to="/courses" />} />
        
        <Route path="/profile" element={mappedUser ? <UserProfile user={mappedUser} /> : <Navigate to="/courses" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;