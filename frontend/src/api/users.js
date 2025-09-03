import http from './index';

export function listUsers() {
  return http.get('/users').then((r) => r.data);
}

export function getUser(id) {
  return http.get(`/users/${id}`).then((r) => r.data);
}

export function createUser(payload) {
  return http.post('/users', payload).then((r) => r.data);
}

export function updateUser(id, payload) {
  return http.post(`/users/${id}`, payload).then((r) => r.data);
}

export function deleteUser(id) {
  return http.delete(`/users/${id}`);
}
