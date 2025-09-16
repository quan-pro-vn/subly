import http from './index';

export function listShops() {
  return http.get('/shops').then((r) => r.data);
}

export function getShop(id) {
  return http.get(`/shops/${id}`).then((r) => r.data);
}

export function createShop(payload) {
  return http.post('/shops', payload).then((r) => r.data);
}

export function updateShop(id, payload) {
  // Keep consistency with users API style using POST
  return http.post(`/shops/${id}`, payload).then((r) => r.data);
}

export function deleteShop(id) {
  return http.delete(`/shops/${id}`);
}

export function removeShopCustomer(shopId, customerId) {
  return http.delete(`/shops/${shopId}/customers/${customerId}`);
}

export function assignShopCustomer(shopId, payload) {
  // payload expects: { customer_id, role, is_owner }
  return http.post(`/shops/${shopId}/customers`, payload);
}

export function renewShop(id, months, note) {
  return http
    .post(`/shops/${id}/renew`, { months, note })
    .then((r) => r.data);
}

export function listShopRenewals(id) {
  return http.get(`/shops/${id}/renewals`).then((r) => r.data);
}
