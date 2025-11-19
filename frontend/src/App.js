import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/common/Header';
import Navigation from './components/common/Navigation';
import PublicCourses from './components/pages/PublicCourses';
import AdminCourses from './components/pages/AdminCourses';
import AdminUsers from './components/pages/AdminUsers';
import CreateCourse from './components/pages/CreateCourse';
import InstructorCourse from './components/pages/InstructorCourse';
import StudentCourseRegistration from './components/pages/StudentCourseRegistration';
import MyCourses from './components/pages/MyCourses';
import MySchedule from './components/pages/MySchedule';
import UserProfile from './components/pages/UserProfile';
import AdminDashboard from './components/pages/AdminDashboard';
import AdminRooms from './components/pages/AdminRooms';



import './App.css';

function App() {
  const [user, setUser] = useState(null);
  // Options: null, 
  // { name: 'Jan Novák', role: 'Student' },
  // { name: 'Jan Novák', role: 'Administrátor' },
  // { name: 'Jan Novák', role: 'Garant' },
  // { name: 'Jan Novák', role: 'Lektor' }

  const handleLogin = () => {
    // Mock login - cycle through different user roles for demo
    if (!user) {
      setUser({ name: 'Jan Novák', role: 'Student' });
    } else if (user.role === 'Student') {
      setUser({ name: 'Jan Novák', role: 'Garant' });
    } else if (user.role === 'Garant') {
      setUser({ name: 'Jan Novák', role: 'Lektor' });
    } else if (user.role === 'Lektor') {
      setUser({ name: 'Jan Novák', role: 'Administrátor' });
    } else {
      setUser(null);
    }
  };

  const handleLogout = () => {
    if (!user) {
      setUser({ name: 'Jan Novák', role: 'Student' });
    } else if (user.role === 'Student') {
      setUser({ name: 'Jan Novák', role: 'Garant' });
    } else if (user.role === 'Garant') {
      setUser({ name: 'Jan Novák', role: 'Lektor' });
    } else if (user.role === 'Lektor') {
      setUser({ name: 'Jan Novák', role: 'Administrátor' });
    } else {
      setUser(null); 
    }
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    if (!user) {
      return [
        // { label: 'Domů', path: '/' },
        { label: 'Kurzy', path: '/courses' },
        // { label: 'O systému', path: '/about' }
      ];
    }

    if (user.role === 'Administrátor') {
      return [
        { label: 'Dashboard', path: '/admin/dashboard' },
        { label: 'Kurzy', path: '/admin/courses' },
        { label: 'Uživatelé', path: '/admin/users' },
        { label: 'Místnosti', path: '/admin/rooms' }
      ];
    }

    if (user.role === 'Garant' || user.role === 'Lektor') {
      return [
        { label: 'Můj profil', path: '/profile' },
        { label: 'Moje kurzy', path: '/instructor/courses' },
        { label: 'Založit kurz', path: '/create-course' }
      ];
    }

    if (user.role === 'Student') {
      return [
        { label: 'Můj profil', path: '/profile' },
        { label: 'Moje kurzy', path: '/student/my-courses' },
        { label: 'Můj rozvrh', path: '/student/schedule' },
        { label: 'Dostupné kurzy', path: '/courses' }
      ];
    }

    return [];
  };

  return (
    <Router>
      <div className="App">
        <Header user={user} onLogin={handleLogin} onLogout={handleLogout} />
        <Navigation items={getNavigationItems()} />
        
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicCourses />} />
          <Route path="/courses" element={<PublicCourses />} />
          <Route path="/about" element={<div className="container"><h1>O systému</h1><p>Informace o systému...</p></div>} />
          
          {/* Admin routes */}
          <Route path="/admin/dashboard" element={user?.role === 'Administrátor' ? <AdminDashboard /> : <Navigate to="/" />} />
          <Route path="/admin/courses" element={user?.role === 'Administrátor' ? <AdminCourses /> : <Navigate to="/" />} />
          <Route path="/admin/users" element={user?.role === 'Administrátor' ? <AdminUsers /> : <Navigate to="/" />} />
          <Route path="/admin/rooms" element={user?.role === 'Administrátor' ? <AdminRooms /> : <Navigate to="/" />} />
          
          {/* Instructor/Guarantor routes */}
          <Route path="/create-course" element={user?.role === 'Garant' || user?.role === 'Lektor' ? <CreateCourse /> : <Navigate to="/" />} />
          <Route path="/instructor/courses" element={user?.role === 'Garant' || user?.role === 'Lektor' ? <InstructorCourse userRole={user?.role} /> : <Navigate to="/" />} />
          
          {/* Student routes */}
          <Route path="/student/my-courses" element={user?.role === 'Student' ? <MyCourses /> : <Navigate to="/" />} />
          <Route path="/student/schedule" element={user?.role === 'Student' ? <MySchedule /> : <Navigate to="/" />} />
          <Route path="/course/:id" element={user?.role === 'Student' ? <StudentCourseRegistration /> : <Navigate to="/" />} />
          
          {/* Common routes */}
          <Route path="/profile" element={user ? <UserProfile user={user} /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;