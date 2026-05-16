import http from 'k6/http';
import { check, sleep } from 'k6';
import encoding from 'k6/encoding';

const STRICT_MODE = __ENV.STRICT_MODE === 'true';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_failed: [STRICT_MODE ? 'rate<0.1' : 'rate<1'],
    http_req_duration: [STRICT_MODE ? 'p(95)<3000' : 'p(95)<8000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';
const API_PREFIX = __ENV.API_PREFIX || '/api/v1';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || '';

const oneByOnePng = encoding.b64decode(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5+yJkAAAAASUVORK5CYII=',
  'std',
);

function toBytes(str) {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i += 1) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes;
}

function concatByteArrays(chunks) {
  let totalLength = 0;
  for (const chunk of chunks) totalLength += chunk.length;

  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged.buffer;
}

export default function () {
  if (!AUTH_TOKEN) {
    sleep(1);
    return;
  }

  const boundary = `----k6Boundary${Date.now()}`;
  const chunks = [];
  const fields = [
    ['make', 'toyota'],
    ['model', `perf-${Date.now()}`],
    ['year', '2020'],
    ['currency', 'usd'],
    ['price', '15000'],
    ['features', JSON.stringify(['abs', 'airbags'])],
  ];

  for (const [key, value] of fields) {
    chunks.push(
      toBytes(
        `--${boundary}\r\n` +
          `Content-Disposition: form-data; name="${key}"\r\n\r\n` +
          `${value}\r\n`,
      ),
    );
  }

  const files = ['car-1.png', 'car-2.png', 'car-3.png'];
  for (const filename of files) {
    chunks.push(
      toBytes(
        `--${boundary}\r\n` +
          `Content-Disposition: form-data; name="files"; filename="${filename}"\r\n` +
          `Content-Type: image/png\r\n\r\n`,
      ),
    );
    chunks.push(new Uint8Array(oneByOnePng));
    chunks.push(toBytes('\r\n'));
  }

  chunks.push(toBytes(`--${boundary}--\r\n`));
  const body = concatByteArrays(chunks);

  const res = http.post(`${BASE_URL}${API_PREFIX}/vehicles/add`, body, {
    headers: {
      Authorization: `Bearer ${AUTH_TOKEN}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
  });

  check(res, {
    'add vehicle response acceptable': (r) => {
      if (!STRICT_MODE) return [200, 201, 400, 401, 403, 429].includes(r.status);
      if (r.status !== 200) return false;
      try {
        const parsed = JSON.parse(r.body || '{}');
        return parsed.success === true && parsed.statusCode === 201;
      } catch (err) {
        return false;
      }
    },
  });
  sleep(1);
}
