import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let csrfToken: string | null = null;

export const fetchCsrfToken = async () => {
  try {
    const response = await axios.get(`${API_URL}/csrf-token`, { withCredentials: true });
    csrfToken = response.data.token;
    return csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
};

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add CSRF token for state-changing methods
  if (config.method && !['get', 'head', 'options'].includes(config.method.toLowerCase())) {
    if (!csrfToken) {
      await fetchCsrfToken();
    }
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

export const studentService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string; classId?: string }) => {
    const response = await api.get('/students', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/students', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/students/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },
};

export const classService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
    const response = await api.get('/classes', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/classes/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/classes', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/classes/${id}`, data);
    return response.data;
  },
  archive: async (id: string) => {
    const response = await api.post(`/classes/${id}/archive`);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/classes/${id}`);
    return response.data;
  },
  enrollStudent: async (classId: string, studentId: string) => {
    const response = await api.post(`/classes/${classId}/enroll`, { studentId });
    return response.data;
  },
  unenrollStudent: async (classId: string, studentId: string) => {
    const response = await api.delete(`/classes/${classId}/enroll/${studentId}`);
    return response.data;
  },
};

export const assignmentService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; classId?: string }) => {
    const response = await api.get('/assignments', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/assignments/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/assignments', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/assignments/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/assignments/${id}`);
    return response.data;
  },
  submit: async (id: string, fileUrl?: string) => {
    const response = await api.post(`/assignments/${id}/submit`, { fileUrl });
    return response.data;
  },
  grade: async (assignmentId: string, studentId: string, score: number) => {
    const response = await api.put(`/assignments/${assignmentId}/grade/${studentId}`, { score });
    return response.data;
  },
};

export const testService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; classId?: string }) => {
    const response = await api.get('/tests', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/tests/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/tests', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/tests/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/tests/${id}`);
    return response.data;
  },
  grade: async (testId: string, studentId: string, marks: number) => {
    const response = await api.post(`/tests/${testId}/grade`, { studentId, marks });
    return response.data;
  },
  export: async (testId: string) => {
    const response = await api.get(`/tests/${testId}/export`, { responseType: 'blob' });
    return response.data;
  },
};

export const dashboardService = {
  getData: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },
  getQuickActions: async () => {
    const response = await api.get('/dashboard/quick-actions');
    return response.data;
  },
};

export const analyticsService = {
  getStudentAnalytics: async (studentId: string) => {
    const response = await api.get(`/analytics/student/${studentId}`);
    return response.data;
  },
  getClassAnalytics: async (classId: string) => {
    const response = await api.get(`/analytics/class/${classId}`);
    return response.data;
  },
  getOverview: async () => {
    const response = await api.get('/analytics/overview');
    return response.data;
  },
};

export const researchService = {
  getAll: async (params?: { search?: string; stage?: string; status?: string }) => {
    const response = await api.get('/research', { params });
    return response.data;
  },
  getByStudentId: async (studentId: string) => {
    const response = await api.get(`/research/student/${studentId}`);
    return response.data;
  },
  update: async (data: { studentId: string; stage: string; status: string; remarks?: string }) => {
    const response = await api.post('/research', data);
    return response.data;
  },
};

export const userService = {
  getAll: async (params?: { page?: number; limit?: number; role?: string; search?: string }) => {
    const response = await api.get('/users', { params });
    return response.data;
  },
  getTeachers: async () => {
    const response = await api.get('/users/teachers');
    return response.data;
  },
};

export default api;