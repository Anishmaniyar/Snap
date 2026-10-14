import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 2,
  duration: "30s",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
  },
};

export default function () {
  const response = http.get("http://localhost:8000/health");

  check(response, {
    "status is 200": (r) => r.status === 200,
    "health status is ok": (r) => r.json("status") === "ok",
  });

  sleep(1);
}
