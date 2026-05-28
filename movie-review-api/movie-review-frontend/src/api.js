import axios from 'axios'

const API_BASE = 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authApi = {
  signup: (data) => api.post('/users/signup/', data),
  login: (data) => api.post('/users/login/', data),
  me: () => api.get('/users/me/'),
}

export const movieApi = {
  list: (params) => api.get('/movies/', { params }),
  detail: (id) => api.get(`/movies/${id}/`),
}

export const reviewApi = {
  list: (params) => api.get('/reviews/', { params }),
  create: (data) => api.post('/reviews/', data),
  detail: (id) => api.get(`/reviews/${id}/`),
  update: (id, data) => api.patch(`/reviews/${id}/`, data),
  delete: (id) => api.delete(`/reviews/${id}/`),
}

export default api
