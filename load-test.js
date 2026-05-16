import http from 'k6/http';
import { sleep } from 'k6';
import { check } from 'k6';
import encoding from 'k6/encoding';

const STRICT_MODE = __ENV.STRICT_MODE === 'true';

export const options = {
  scenarios: {
    get_vehicles: {
      executor: 'ramping-vus',
      exec: 'getVehicles',
      startVUs: 2,
      stages: [
        { duration: '30s', target: 10 },
        { duration: '1m', target: 30 },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '15s',
    },
    vehicle_detail: {
      executor: 'ramping-vus',
      exec: 'vehicleDetail',
      startVUs: 1,
      stages: [
        { duration: '30s', target: 5 },
        { duration: '1m', target: 20 },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '15s',
    },
    active_listings_count: {
      executor: 'constant-vus',
      exec: 'activeListingsCount',
      vus: 5,
      duration: '90s',
    },
    add_vehicle: {
      executor: 'constant-vus',
      exec: 'addVehicle',
      vus: 1,
      duration: '45s',
      startTime: '15s',
    },
  },
  thresholds: {
    'http_req_failed{endpoint:get_vehicles}': [STRICT_MODE ? 'rate<0.02' : 'rate<1'],
    'http_req_duration{endpoint:get_vehicles}': [STRICT_MODE ? 'p(95)<600' : 'p(95)<3000'],
    'http_req_failed{endpoint:vehicle_detail}': [STRICT_MODE ? 'rate<0.02' : 'rate<1'],
    'http_req_duration{endpoint:vehicle_detail}': [STRICT_MODE ? 'p(95)<700' : 'p(95)<3000'],
    'http_req_failed{endpoint:active_listings_count}': [STRICT_MODE ? 'rate<0.02' : 'rate<1'],
    'http_req_duration{endpoint:active_listings_count}': [STRICT_MODE ? 'p(95)<500' : 'p(95)<3000'],
    'http_req_failed{endpoint:add_vehicle}': [STRICT_MODE ? 'rate<0.05' : 'rate<1'],
    'http_req_duration{endpoint:add_vehicle}': [STRICT_MODE ? 'p(95)<2500' : 'p(95)<8000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';
const API_PREFIX = __ENV.API_PREFIX || '/api/v1';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || '';
const VEHICLE_ID = __ENV.VEHICLE_ID || '';
const ENABLE_ADD_VEHICLE = __ENV.ENABLE_ADD_VEHICLE === 'true';
const RATE_LIMIT_BYPASS_KEY = __ENV.RATE_LIMIT_BYPASS_KEY || '';

const authHeaders = AUTH_TOKEN
  ? {
      Authorization: `Bearer ${AUTH_TOKEN}`,
      ...(RATE_LIMIT_BYPASS_KEY ? { 'x-load-test-key': RATE_LIMIT_BYPASS_KEY } : {}),
    }
  : {};

const commonHeaders = RATE_LIMIT_BYPASS_KEY
  ? { 'x-load-test-key': RATE_LIMIT_BYPASS_KEY }
  : {};

const oneByOnePng = encoding.b64decode(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5+yJkAAAAASUVORK5CYII=',
  'std',
);

export function getVehicles() {
  const res = http.get(
    `${BASE_URL}${API_PREFIX}/vehicles?includeCount=false&limit=20`,
    {
      headers: commonHeaders,
      tags: { endpoint: 'get_vehicles' },
    },
  );
  check(res, {
    'get vehicles status acceptable': (r) => STRICT_MODE ? r.status === 200 : [200, 429].includes(r.status),
  });
  sleep(1);
}

export function vehicleDetail() {
  if (!VEHICLE_ID) {
    sleep(1);
    return;
  }
  const res = http.get(
    `${BASE_URL}${API_PREFIX}/vehicles/${VEHICLE_ID}`,
    {
      headers: commonHeaders,
      tags: { endpoint: 'vehicle_detail' },
    },
  );
  check(res, {
    'vehicle detail status acceptable': (r) => STRICT_MODE ? r.status === 200 : [200, 404, 429].includes(r.status),
  });
  sleep(1);
}

export function activeListingsCount() {
  if (!AUTH_TOKEN) {
    sleep(1);
    return;
  }
  const res = http.get(
    `${BASE_URL}${API_PREFIX}/vehicles/stats/active-listings-count`,
    {
      headers: authHeaders,
      tags: { endpoint: 'active_listings_count' },
    },
  );
  check(res, {
    'active listings status acceptable': (r) => STRICT_MODE ? r.status === 200 : [200, 401, 403, 429].includes(r.status),
  });
  sleep(1);
}

export function addVehicle() {
  if (!ENABLE_ADD_VEHICLE || !AUTH_TOKEN) {
    sleep(1);
    return;
  }

  const payload = {
    make: 'toyota',
    model: `corolla-${Date.now()}`,
    year: '2020',
    currency: 'usd',
    price: '15000',
    features: JSON.stringify(['abs', 'airbags']),
    files: [
      http.file(oneByOnePng, 'car-1.png', 'image/png'),
      http.file(oneByOnePng, 'car-2.png', 'image/png'),
      http.file(oneByOnePng, 'car-3.png', 'image/png'),
    ],
  };

  const res = http.post(`${BASE_URL}${API_PREFIX}/vehicles/add`, payload, {
    headers: authHeaders,
    tags: { endpoint: 'add_vehicle' },
  });

  check(res, {
    'add vehicle status acceptable': (r) => STRICT_MODE ? [200, 201].includes(r.status) : [200, 201, 400, 401, 403, 429].includes(r.status),
  });
  sleep(1);
}
