// src/services/api.js
// URL del servidor en producción (Render)
const API_URL = 'https://dangstoreptc.onrender.com/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

const api = {
  get: (path) => fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    }
  }).then(r => r.json()),
  
  post: (path, body) => fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(body)
  }).then(r => r.json()),
  
  put: (path, body) => fetch(`${API_URL}${path}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(body)
  }).then(r => r.json()),
  
  delete: (path) => fetch(`${API_URL}${path}`, { 
    method: 'DELETE',
    headers: getAuthHeaders()
  }).then(r => r.json())
}

export default api
