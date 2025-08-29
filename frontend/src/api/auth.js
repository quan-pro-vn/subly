import http from './index';

export function login(email, password) {
  return http.post('/auth/login', { email, password }).then((r) => r.data);
}

export function register(email, password) {
  return http.post('/auth/register', { email, password });
}

export function logout() {
  return http.post('/auth/logout');
}

export function getMe() {
  return http.get('/auth/me').then((r) => r.data);
}
