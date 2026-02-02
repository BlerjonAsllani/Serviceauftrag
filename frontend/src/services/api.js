import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost/Projekt/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response Interceptor
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response || error);
    return Promise.reject(error);
  }
);

// Auth
export const login = (benutzername, passwort) => {
  return api.post('/auth/login.php', { benutzername, passwort });
};

export const logout = () => {
  return api.post('/auth/logout.php');
};

export const checkAuth = () => {
  return api.get('/auth/check.php');
};

// Aufträge
export const getAuftraege = (status = '', search = '') => {
  let url = '/auftraege/list.php?';
  if (status) url += `status=${status}&`;
  if (search) url += `search=${search}`;
  return api.get(url);
};

export const getAuftrag = (id) => {
  return api.get(`/auftraege/get.php?id=${id}`);
};

export const erstellenAuftrag = (data) => {
  return api.post('/auftraege/create.php', data);
};

export const getMitarbeiter = () => {
  return api.get('/auftraege/mitarbeiter.php');
};

export const disponierenAuftrag = (data) => {
  return api.post('/auftraege/disponieren.php', data);
};

export const erstellenRapport = (data) => {
  return api.post('/auftraege/rapport.php', data);
};

export const freigebenAuftrag = (auftragId) => {
  return api.post('/auftraege/freigeben.php', { auftragId });
};

export const verrechnenAuftrag = (data) => {
  return api.post('/auftraege/verrechnen.php', data);
};

export default api;