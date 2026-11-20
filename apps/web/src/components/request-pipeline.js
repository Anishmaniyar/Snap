import { $, escapeHtml } from "../lib/dom.js";

export const CREATE_STEPS = [
  ["POST /api/v1/urls", "browser"],
  ["express.json → requestLogger → metricsMiddleware", "app.ts"],
  ["authenticate: Bearer JWT, then user lookup", "401"],
  ["validateRequest: Zod body schema", "400"],
  ["urlService: code generation and collision retry", "409"],
  ["urlRepository → Prisma → PostgreSQL", "INSERT"],
  ["Response with shortUrl", "201"],
];

export const REDIRECT_STEPS = [
  ["GET /:shortCode", "browser"],
  ["redirectToOriginalUrl", "controller"],
  ["isActive and expiresAt checks", "404 / 410"],
  ["findByShortCode → Prisma → PostgreSQL", "SELECT"],
  ["Location: originalUrl", "302"],
];

export const pipeline = (steps, id) => `
  <div class="pipeline" id="${id}" aria-label="Request steps">
    ${steps.map(([name, code]) => `
      <div class="step" data-state="idle">
        <span class="step-mark"></span>
        <span class="step-name">${escapeHtml(name)}</span>
        <span class="step-code">${escapeHtml(code)}</span>
      </div>`).join("")}
  </div>`;

export const renderPipeline = (steps, id) => {
  const node = $(`#${id}`);
  if (!node) return;
  node.innerHTML = steps.map(([name, code]) => `
    <div class="step" data-state="idle">
      <span class="step-mark"></span>
      <span class="step-name">${escapeHtml(name)}</span>
      <span class="step-code">${escapeHtml(code)}</span>
    </div>`).join("");
};

export const runPipeline = async (id, work) => {
  const nodes = [...$(`#${id}`).children];
  for (const node of nodes) node.dataset.state = "idle";
  for (const node of nodes) {
    node.dataset.state = "active";
    await new Promise((resolve) => setTimeout(resolve, 90));
    node.dataset.state = "done";
  }
  return work();
};
