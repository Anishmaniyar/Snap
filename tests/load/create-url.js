import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = "http://localhost:8000";

export const options = {
  vus: 50,
  duration: "2m",

  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
  },
};

export function setup() {
  const accessToken = __ENV.ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error("ACCESS_TOKEN is missing. Set it before running k6.");
  }

  return { accessToken };
}

export default function (data) {
  const payload = JSON.stringify({
    originalUrl: `https://example.com/k6-test/${__VU}-${__ITER}`,
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${data.accessToken}`,
    },
  };

  // NOTE: Confirm the actual route in your API.
  // This uses the documented plural route: POST /api/v1/urls
  const response = http.post(`${BASE_URL}/api/v1/urls`, payload, params);

  const passed = check(response, {
    "URL creation returned 200 or 201": (r) =>
      r.status === 200 || r.status === 201,

    "response is valid JSON": (r) => {
      try {
        r.json();
        return true;
      } catch {
        return false;
      }
    },
  });

  if (!passed) {
    console.error(
      `URL creation failed: status=${response.status}, body=${response.body}`,
    );
  }

  sleep(1);
}
