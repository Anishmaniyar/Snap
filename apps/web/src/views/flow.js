import { panel } from "../components/panel.js";
import { pipeline, CREATE_STEPS, REDIRECT_STEPS } from "../components/request-pipeline.js";

export const title = "Request flow";

export const render = () => `
  <div class="title-row">
    <div>
      <h1>Request flow</h1>
      <p class="sub">The two paths through the current API, from a browser request to a redirect.</p>
    </div>
    <div class="actions"><a class="btn primary" href="#/overview">Try it</a></div>
  </div>

  <div class="grid top">
    ${panel({
      classes: "span-12",
      title: "Two paths, one router",
      meta: "Express 5 · /api/v1 and /:shortCode",
      body: `<div class="flow-lanes">
        <div class="flow-lane"><h3>Create a link</h3>${pipeline(CREATE_STEPS, "flow-create")}</div>
        <div class="flow-lane"><h3>Follow a link</h3>${pipeline(REDIRECT_STEPS, "flow-redirect")}</div>
      </div>`,
    })}

    ${panel({
      classes: "span-6",
      title: "Routes",
      meta: "mounted under /api/v1",
      body: `<div class="table-wrap"><table>
        <thead><tr><th scope="col">Method</th><th scope="col">Path</th><th scope="col">Auth</th><th scope="col" class="n">Result</th></tr></thead>
        <tbody>
          <tr><td class="code">POST</td><td>/auth/signup</td><td>No</td><td class="n num">201</td></tr>
          <tr><td class="code">POST</td><td>/auth/login</td><td>No</td><td class="n num">200</td></tr>
          <tr><td class="code">POST</td><td>/auth/logout</td><td>No</td><td class="n num">200</td></tr>
          <tr><td class="code">POST</td><td>/urls</td><td>Bearer</td><td class="n num">201</td></tr>
          <tr><td class="code">GET</td><td>/urls</td><td>Bearer</td><td class="n num">200</td></tr>
          <tr><td class="code">GET</td><td>/urls/:id</td><td>Bearer</td><td class="n num">200</td></tr>
          <tr><td class="code">PATCH</td><td>/urls/:id</td><td>Bearer</td><td class="n num">200</td></tr>
          <tr><td class="code">DELETE</td><td>/urls/:id</td><td>Bearer</td><td class="n num">204</td></tr>
        </tbody>
      </table></div>`,
    })}

    ${panel({
      classes: "span-6",
      title: "Data model",
      meta: "PostgreSQL · Prisma",
      body: `<dl class="defs">
        <dt>User</dt><dd class="code">id · name · email · passwordHash · createdAt · updatedAt</dd>
        <dt>Url</dt><dd class="code">id · originalUrl · shortCode · expiresAt · isActive · userId · createdAt · updatedAt</dd>
        <dt>Ownership</dt><dd>userId → User.id, ON DELETE CASCADE. Every authenticated URL query checks the owner.</dd>
        <dt>Uniqueness</dt><dd>shortCode is unique. A collision retries the generated code up to five times; a custom alias returns 409.</dd>
        <dt>Deletion</dt><dd>Soft delete: isActive becomes false. The short code is never released.</dd>
      </dl>`,
    })}

    ${panel({
      classes: "span-12",
      title: "Observability",
      meta: "every request",
      body: `<div class="status-list">
        <div class="status-row"><span class="status-label">X-Request-ID</span><span>UUID from requestLogger, returned on the response</span></div>
        <div class="status-row"><span class="status-label">Access log</span><span>Pino, with password, tokens and authorization headers redacted</span></div>
        <div class="status-row"><span class="status-label">Counters</span><span class="code">http_requests_total</span></div>
        <div class="status-row"><span class="status-label">Latency</span><span class="code">http_request_duration_seconds</span></div>
        <div class="status-row"><span class="status-label">Labels</span><span>method · route · status_code</span></div>
      </div>`,
    })}
  </div>`;
