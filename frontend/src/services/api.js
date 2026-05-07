import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'
const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(res => res, error => {
  if (error.response?.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }
  return Promise.reject(error)
})

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  getUsers: () => api.get('/auth/users')
}

export const inwardAPI = {
  create: (data) => api.post('/inward', data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
  }),
  getAll: (params) => api.get('/inward', { params }),
  getById: (id) => api.get(`/inward/${id}`)
}

export const outwardAPI = {
  create: (data) => api.post('/outward', data),
  getAll: () => api.get('/outward')
}

export const stockAPI = {
  getAll: (params) => api.get('/stock', { params }),
  getAlerts: () => api.get('/stock/alerts')
}

export const billingAPI = {
  calculate: (id) => api.get(`/billing/calculate/${id}`),
  invoice: (id) => api.post(`/billing/invoice/${id}`, {}, { responseType: 'blob' })
}

export const analyticsAPI = {
  dashboard: () => api.get('/analytics/dashboard'),
  monthly: () => api.get('/analytics/monthly')
}

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data)
}

export default api
