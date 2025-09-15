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

export function removeShopCustomer(shopId, userId) {
  return http.delete(`/shops/${shopId}/customers/${userId}`);
}

export function assignShopCustomer(shopId, payload) {
  return http.post(`/shops/${shopId}/customers`, payload);
}
