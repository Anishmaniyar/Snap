import { panel } from "../components/panel.js";

export const title = "Health";

export const render = () => `
  <div class="title-row">
    <div>
      <h1>Health</h1>
      <p class="sub">Live state from GET /health and GET /metrics.</p>
    </div>
    <div class="actions"><button class="btn" type="button" data-action="health-refresh">Refresh</button></div>
  </div>
  <div class="grid top">
    ${panel({
      classes: "span-5",
      title: "Service",
      meta: "GET /health",
      body: '<div class="status-list" id="health-status"></div>',
    })}
    ${panel({
      classes: "span-7",
      title: "Metrics",
      meta: "GET /metrics · Prometheus text",
      body: '<div id="metrics-wrap"></div>',
    })}
  </div>`;

export const mount = (ctx) => ctx.refreshHealth();
