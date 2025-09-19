import http from './index';

export function listShops(params = {}) {
  const { page = 1, limit = 50, filter = 'all' } = params;
  return http
    .get('/shops', { params: { page, limit, filter } })
    .then((r) => r.data);
}

export function getShopStats() {
  return http.get('/shops/stats').then((r) => r.data);
}

export function restoreShop(id) {
  return http.post(`/shops/${id}/restore`);
}

export function forceDeleteShop(id) {
  return http.delete(`/shops/${id}/force`);
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

export function renewShop(id, payload) {
  // payload can be { months, note } or { next_expired_at, note }
  return http.post(`/shops/${id}/renew`, payload).then((r) => r.data);
}

export function setShopExpiredAt(id, payload) {
  // payload: { new_expired_at, note? }
  return http.post(`/shops/${id}/expired-at`, payload).then((r) => r.data);
}

export function listShopRenewals(id) {
  return http.get(`/shops/${id}/renewals`).then((r) => r.data);
}

export function listShopApiLogs(id, params = {}) {
  const { page = 1, limit = 50 } = params;
  return http.get(`/shops/${id}/api-logs`, { params: { page, limit } }).then((r) => r.data);
}

export function revokeShop(id) {
  return http.post(`/shops/${id}/revoke`).then((r) => r.data);
}

export function notifyNotOver1mNow() {
  return http.post('/shops/notify/not-over-1m').then((r) => r.data);
}

export function listAllApiLogs(params = {}) {
  const { page = 1, limit = 50, domain_param, uuid_param, status, from, to } = params;
  const query = { page, limit };
  if (domain_param) query.domain_param = domain_param;
  if (uuid_param) query.uuid_param = uuid_param;
  if (status && status !== 'all') query.status = status;
  if (from) query.from = from;
  if (to) query.to = to;
  return http.get('/api-logs', { params: query }).then((r) => r.data);
}
