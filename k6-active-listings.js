import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<700'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';
const API_PREFIX = __ENV.API_PREFIX || '/api/v1';
const AUTH_TOKEN = __ENV.AUTH_TOKEN;

export default function () {
  const res = http.get(`${BASE_URL}${API_PREFIX}/vehicles/stats/active-listings-count`, {
    headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
  });
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
