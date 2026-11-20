import { kpiStrip } from "../components/kpi-strip.js";
import { createForm } from "../components/link-form.js";
import { panel } from "../components/panel.js";
import { pipeline, CREATE_STEPS, REDIRECT_STEPS } from "../components/request-pipeline.js";
import { linkTable } from "../components/link-table.js";
import { sortLinks } from "../lib/format.js";

export const title = "Overview";

export const render = (ctx) => {
  const { total, active, expired } = ctx.counts();
  const finding = expired > 0
    ? `${expired} expired link still resolves with a 410.`
    : "Every link in this workspace resolves.";
  const recent = sortLinks(ctx.state.links, "newest").slice(0, 3);

  return `
    <div class="title-row">
      <div>
        <h1>Overview</h1>
        <p class="sub">${total} links · ${active} active · ${finding}</p>
      </div>
      <div class="actions">
        <a class="btn" href="#/flow">See the flow</a>
        <button class="btn primary" type="button" data-action="new-link">New link</button>
      </div>
    </div>

    <div style="margin-bottom:var(--gap)">${kpiStrip({ total, active, expired })}</div>

    <div class="grid top">
      ${createForm(ctx.baseUrl)}
      ${panel({
        classes: "span-5",
        title: "This request's path",
        meta: "sample run",
        body: `${pipeline(CREATE_STEPS, "create-pipeline")}
          <p class="meta" style="margin-top:16px">Every request carries an X-Request-ID and is timed into /metrics.</p>`,
      })}
      ${panel({
        classes: "span-8",
        title: "Recent links",
        action: '<a class="card-link" href="#/links">View all links</a>',
        body: linkTable(recent, { compact: true }),
      })}
      ${panel({
        classes: "span-4",
        title: "Follow a link",
        meta: "GET /:shortCode",
        body: `${pipeline(REDIRECT_STEPS, "redirect-pipeline")}
          <p class="meta" style="margin-top:16px">The public route checks isActive and expiry before it answers with a 302.</p>`,
      })}
    </div>`;
};

export const mount = (ctx) => ctx.mountCreateForm();
