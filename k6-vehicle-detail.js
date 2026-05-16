import http from 'k6/http';
import { check, sleep } from 'k6';

const STRICT_MODE = __ENV.STRICT_MODE === 'true';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_failed: [STRICT_MODE ? 'rate<0.05' : 'rate<1'],
    http_req_duration: [STRICT_MODE ? 'p(95)<800' : 'p(95)<3000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';
const API_PREFIX = __ENV.API_PREFIX || '/api/v1';
const VEHICLE_ID = __ENV.VEHICLE_ID || '';
const RATE_LIMIT_BYPASS_KEY = __ENV.RATE_LIMIT_BYPASS_KEY || '';

export default function () {
  if (!VEHICLE_ID) {
    sleep(1);
    return;
  }

  const headers = RATE_LIMIT_BYPASS_KEY
    ? { 'x-load-test-key': RATE_LIMIT_BYPASS_KEY }
    : undefined;
  const res = http.get(`${BASE_URL}${API_PREFIX}/vehicles/${VEHICLE_ID}`, headers ? {headers} : undefined);
  check(res, {
    'vehicle detail status acceptable': (r) =>
      STRICT_MODE ? r.status === 200 : [200, 404, 429].includes(r.status),
  });
  sleep(1);
}
