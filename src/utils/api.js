/**
 * Centralized API client for MoodBeats backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Get auth token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('moodbeats:token');
};

/**
 * Set auth token in localStorage
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('moodbeats:token', token);
  } else {
    localStorage.removeItem('moodbeats:token');
  }
};

/**
 * Generic API request handler
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // Handle unauthorized errors by clearing token
      if (response.status === 401) {
        setAuthToken(null);
      }
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ============================================
// AUTHENTICATION API
// ============================================

export const authAPI = {
  /**
   * Register a new user
   */
  register: async (userName) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ userName }),
    });

    if (response.data?.token) {
      setAuthToken(response.data.token);
    }

    return response.data;
  },

  /**
   * Login user
   */
  login: async (userName) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ userName }),
    });

    if (response.data?.token) {
      setAuthToken(response.data.token);
    }

    return response.data;
  },

  /**
   * Logout user (clear token)
   */
  logout: () => {
    setAuthToken(null);
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!getAuthToken();
  },
};

// ============================================
// USER API
// ============================================

export const userAPI = {
  /**
   * Get current user profile
   */
  getProfile: async () => {
    const response = await apiRequest('/users/me');
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (updates) => {
    const response = await apiRequest('/users/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.data;
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId) => {
    const response = await apiRequest(`/users/${userId}`);
    return response.data;
  },
};

// ============================================
// GOALS API
// ============================================

export const goalsAPI = {
  /**
   * Get user's weekly goal
   */
  getGoal: async () => {
    const response = await apiRequest('/goals');
    return response.data;
  },

  /**
   * Set weekly goal
   */
  setGoal: async (weeklyGoalMinutes) => {
    const response = await apiRequest('/goals', {
      method: 'POST',
      body: JSON.stringify({ weeklyGoalMinutes }),
    });
    return response.data;
  },

  /**
   * Update weekly goal
   */
  updateGoal: async (weeklyGoalMinutes) => {
    const response = await apiRequest('/goals', {
      method: 'PUT',
      body: JSON.stringify({ weeklyGoalMinutes }),
    });
    return response.data;
  },

  /**
   * Get goal progress
   */
  getProgress: async () => {
    const response = await apiRequest('/goals/progress');
    return response.data;
  },

  /**
   * Delete goal
   */
  deleteGoal: async () => {
    const response = await apiRequest('/goals', {
      method: 'DELETE',
    });
    return response.data;
  },
};

// ============================================
// SESSIONS API
// ============================================

export const sessionsAPI = {
  /**
   * Create a new study session
   */
  createSession: async (sessionData) => {
    const response = await apiRequest('/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
    return response.data;
  },

  /**
   * Get session by ID
   */
  getSession: async (sessionId) => {
    const response = await apiRequest(`/sessions/${sessionId}`);
    return response.data;
  },

  /**
   * Get user's sessions
   */
  getSessions: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/sessions${queryString ? `?${queryString}` : ''}`;
    const response = await apiRequest(endpoint);
    return response.data;
  },

  /**
   * Complete a session
   */
  completeSession: async (sessionId, completionData) => {
    const response = await apiRequest(`/sessions/${sessionId}/complete`, {
      method: 'PUT',
      body: JSON.stringify(completionData),
    });
    return response.data;
  },

  /**
   * Get session history with filters
   */
  getHistory: async (filters = {}) => {
    const queryString = new URLSearchParams(
      Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== '')
    ).toString();
    const endpoint = `/sessions/history${queryString ? `?${queryString}` : ''}`;
    const response = await apiRequest(endpoint);
    return response.data;
  },
};

// ============================================
// HEALTH CHECK API
// ============================================

export const healthAPI = {
  /**
   * Check API health
   */
  check: async () => {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/health`);
    return response.json();
  },
};

export default {
  auth: authAPI,
  user: userAPI,
  goals: goalsAPI,
  sessions: sessionsAPI,
  health: healthAPI,
};
