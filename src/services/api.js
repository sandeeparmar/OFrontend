// API service functions for making actual HTTP requests
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };
  
  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  
  return response.json();
}

// Auth API calls
export const authApi = {
  signup: (username, password, role) => {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, password, role }),
    });
  },
  
  signin: (username, password) => {
    return apiRequest('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
  
  getMe: () => {
    return apiRequest('/auth/me');
  },
};

// Ocean Data API calls
export const oceanDataApi = {
  getData: (lat, lon, depth) => {
    return apiRequest(`/ocean/data?lat=${lat}&lon=${lon}&depth=${depth}`);
  },
  
  getNearestData: (lat, lon, depth) => {
    return apiRequest(`/ocean/data/nearest?lat=${lat}&lon=${lon}&depth=${depth}`);
  },
  
  downloadCsv: (params) => {
    return fetch(`${API_BASE_URL}/ocean/data/csv?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },
};

// Chat API calls
export const chatApi = {
  sendQuery: (message) => {
    return apiRequest('/chat/query', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },
};

// Admin API calls
export const adminApi = {
  uploadNetcdf: (file) => {
    const formData = new FormData();
    formData.append('netcdf', file);
    
    return fetch(`${API_BASE_URL}/data/upload-netcdf`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    }).then(response => response.json());
  },
};