# Performance Testing Runbook

This project uses `k6` and the main script at `load-test.js` to test hot vehicle endpoints:

- `GET /api/v1/vehicles`
- `GET /api/v1/vehicles/:id`
- `GET /api/v1/vehicles/stats/active-listings-count`
- `POST /api/v1/vehicles/add`

## 1) Install k6

Use any official install method for your OS, then verify:

```bash
k6 version
```

## 2) Required environment variables

- `BASE_URL` (default: `http://localhost:5000`)
- `API_PREFIX` (default: `/api/v1`)
- `AUTH_TOKEN` required for auth-only endpoints
- `VEHICLE_ID` required for vehicle detail endpoint
- `ENABLE_ADD_VEHICLE=true` to include add-vehicle load

## 3) Low-cost stability run (recommended first)

```bash
$env:BASE_URL="http://localhost:5000"
$env:AUTH_TOKEN="<jwt-token>"
$env:VEHICLE_ID="<existing-vehicle-id>"
k6 run .\load-test.js
```

`add_vehicle` is disabled by default, which keeps costs and DB writes lower.

## 4) Include add-vehicle endpoint

```bash
$env:ENABLE_ADD_VEHICLE="true"
k6 run .\load-test.js
```

## 5) Cost and stability guidance

- Keep `add_vehicle` at low VUs unless you test storage/upload capacity intentionally.
- Reuse one valid `VEHICLE_ID` with stable seed data.
- Start with the built-in stages, then increase gradually.
- Monitor DB CPU, memory, and connection pool while running k6.
- Treat threshold failures by endpoint tag first, not global averages.

