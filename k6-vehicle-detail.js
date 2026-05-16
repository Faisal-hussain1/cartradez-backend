import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<800'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';
const API_PREFIX = __ENV.API_PREFIX || '/api/v1';
const VEHICLE_ID = __ENV.VEHICLE_ID;

export default function () {
  const res = http.get(`${BASE_URL}${API_PREFIX}/vehicles/${VEHICLE_ID}`);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
