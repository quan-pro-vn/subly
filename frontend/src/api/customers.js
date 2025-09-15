import http from './index';

export function listCustomers() {
  return http.get('/customers').then((r) => r.data);
}

export function getCustomer(id) {
  return http.get(`/customers/${id}`).then((r) => r.data);
}

export function deleteCustomer(id) {
  return http.delete(`/customers/${id}`);
}

export function listCustomersByShop(shopUUID) {
  return http
    .get(`/customers`, { params: { shop_uuid: shopUUID } })
    .then((r) => r.data);
}
