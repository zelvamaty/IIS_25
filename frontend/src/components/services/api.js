const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Get auth token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Token ${token}` })
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = 'API request failed';
    try {
      const error = await response.json();
      if (error.detail) {
        errorMessage = error.detail;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'object') {
        const errors = Object.entries(error)
          .map(([field, messages]) => {
            if (Array.isArray(messages)) {
              return `${field}: ${messages.join(', ')}`;
            }
            return `${field}: ${messages}`;
          })
          .join('; ');
        errorMessage = errors || 'Chyba validace';
      }
    } catch (e) {
      console.error('Error parsing error response:', e);
    }
    throw new Error(errorMessage);
  }
  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }
  return response.json();
};

// ============================================
// 1. AUTH API
// ============================================
export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/registration/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  // Login
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await handleResponse(response);
    // Save token to localStorage
    if (data.key) {
      localStorage.setItem('token', data.key);
    }
    return data;
  },
  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/users/me/`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Logout
  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout/`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    localStorage.removeItem('token');
    return handleResponse(response);
  }
};

// ============================================
// 2. USERS API
// ============================================
export const usersAPI = {
  getUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users/`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  changeUserPassword: async (userId, passwordData) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/change_users_password/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(passwordData)
    });
    const result = await handleResponse(response);
    return result;
  },
  // Get current user details
  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/users/me/`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Update user
  updateUser: async (id, userData) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}/patch_user/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}/delete_user/`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await fetch(`${API_BASE_URL}/users/change_password/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(passwordData)
    });
    return handleResponse(response);
  },

  // Get user dashboard stats
  getUserDashboard: async (id) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}/dashboard/`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// ============================================
// 3. COURSES API
// ============================================
export const coursesAPI = {
  // Get all courses
  getCourses: async () => {
    const response = await fetch(`${API_BASE_URL}/courses/`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  // Remove student from course completely
removeStudent: async (courseId, enrollmentId) => {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/delete_student/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    body: JSON.stringify({ enrollment_id: enrollmentId })
  });
  return handleResponse(response);
},
leaveCourse: async (courseId) => {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/leave_course/`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
},

  // Get course detail
  getCourseDetail: async (id) => {
    const response = await fetch(`${API_BASE_URL}/courses/${id}/`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Create course
  createCourse: async (courseData) => {
    const response = await fetch(`${API_BASE_URL}/courses/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData)
    });
    return handleResponse(response);
  },

  // Update course
  updateCourse: async (id, courseData) => {
    const response = await fetch(`${API_BASE_URL}/courses/${id}/patch_course/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData)
    });
    return handleResponse(response);
  },

  // Delete course
  deleteCourse: async (id) => {
    const response = await fetch(`${API_BASE_URL}/courses/${id}/delete_course/`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  getMyCourses: async () => {
    const response = await fetch(`${API_BASE_URL}/courses/my_courses/`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  getMyEnrollments: async () => {
    const response = await fetch(`${API_BASE_URL}/courses/my_courses/`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Approve course (admin)
  approveCourse: async (id) => {
    const response = await fetch(`${API_BASE_URL}/courses/${id}/approve/`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Reject course (admin)
  rejectCourse: async (id) => {
    const response = await fetch(`${API_BASE_URL}/courses/${id}/reject/`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Add lecturer to course
  addLecturer: async (courseId, lecturerId) => {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/add_lecturer/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ lecturer_id: lecturerId })
    });
    return handleResponse(response);
  },

  // Remove lecturer from course
  removeLecturer: async (courseId, lecturerId) => {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/remove_lecturer/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ lecturer_id: lecturerId })
    });
    return handleResponse(response);
  },

  // Enroll in course
  enrollInCourse: async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/enroll/`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  getEnrollments: async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/list_students/`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  approveEnrollment: async (courseId, enrollmentId) => {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/approve_enrollment/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ enrollment_id: enrollmentId })
    });
    return handleResponse(response);
  },
  
  rejectEnrollment: async (courseId, enrollmentId) => {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/reject_enrollment/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ enrollment_id: enrollmentId })
    });
    return handleResponse(response);
  },

  // List students in course
  listStudents: async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/list_students/`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// ============================================
// 4. ROOMS API
// ============================================
export const roomsAPI = {
  // Get all rooms
  getRooms: async () => {
    const response = await fetch(`${API_BASE_URL}/rooms/`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Create room (admin only)
  createRoom: async (roomData) => {
    const response = await fetch(`${API_BASE_URL}/rooms/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(roomData)
    });
    return handleResponse(response);
  },

  // Update room (admin only)
  updateRoom: async (id, roomData) => {
    const response = await fetch(`${API_BASE_URL}/rooms/${id}/patch_room/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(roomData)
    });
    return handleResponse(response);
  },

  // Delete room (admin only)
  deleteRoom: async (id) => {
    const response = await fetch(`${API_BASE_URL}/rooms/${id}/delete_room/`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// ============================================
// 5. TERMS API
// ============================================
export const termsAPI = {
  // Get all terms
  getTerms: async () => {
    const response = await fetch(`${API_BASE_URL}/terms/`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getTermStudents: async (termId) => {
    const response = await fetch(`${API_BASE_URL}/terms/${termId}/list_registered_students/`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
// Delete registration from term
deleteRegistration: async (registrationId) => {
  const response = await fetch(`${API_BASE_URL}/registrations/${registrationId}/`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
},
  // Create term
  createTerm: async (termData) => {
    const response = await fetch(`${API_BASE_URL}/terms/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(termData)
    });
    return handleResponse(response);
  },

  // Update term (admin only)
  updateTerm: async (id, termData) => {
    const response = await fetch(`${API_BASE_URL}/terms/${id}/patch_term/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(termData)
    });
    return handleResponse(response);
  },

  // Delete term (admin only)
  deleteTerm: async (id) => {
    const response = await fetch(`${API_BASE_URL}/terms/${id}/delete_term/`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get student schedule
  getSchedule: async () => {
    const response = await fetch(`${API_BASE_URL}/terms/schedule/`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  registerTerm: async (termId) => {
    const response = await fetch(`${API_BASE_URL}/terms/${termId}/register/`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }};

// ============================================
// 6. REGISTRATIONS API
// ============================================
export const registrationsAPI = {
  // Get my registrations
  getMyRegistrations: async () => {
    const response = await fetch(`${API_BASE_URL}/registrations/`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Register for term
  registerForTerm: async (termId) => {
    const response = await fetch(`${API_BASE_URL}/registrations/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ term_id: termId })  
    });
    return handleResponse(response);
  },

  // Unregister from term
  unregisterFromTerm: async (registrationId) => {
    const response = await fetch(`${API_BASE_URL}/registrations/${registrationId}/delete_registration/`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// ============================================
// 7. GRADES API
// ============================================
export const gradesAPI = {
  getGrades: async () => {
    const response = await fetch(`${API_BASE_URL}/grades/`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  deleteGrade: async (gradeId) => {
    const response = await fetch(`${API_BASE_URL}/grades/${gradeId}/`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  // Create grade
  createGrade: async (gradeData) => {
    const response = await fetch(`${API_BASE_URL}/grades/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(gradeData)
    });
    return handleResponse(response);
  },

  // Update grade
  updateGrade: async (gradeId, gradeData) => {
    const response = await fetch(`${API_BASE_URL}/grades/${gradeId}/patch_grade/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(gradeData)
    });
    return handleResponse(response);
  }
};
// Export all APIs
export default {
  auth: authAPI,
  users: usersAPI,
  courses: coursesAPI,
  rooms: roomsAPI,
  terms: termsAPI,
  registrations: registrationsAPI,
  grades: gradesAPI
};