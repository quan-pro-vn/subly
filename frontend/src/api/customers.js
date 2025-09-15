import http from './index';

export function listCustomers() {
  return http.get('/customers').then((r) => r.data);
}

export function getCustomer(id) {
  return http.get(`/customers/${id}`).then((r) => r.data);
}
