import { panel } from "../components/panel.js";
import { statusPill } from "../components/status-pill.js";
import { escapeHtml } from "../lib/dom.js";
import { formatDate, statusOf, shortUrlOf } from "../lib/format.js";

export const title = "Link";

export const render = (ctx) => {
  const link = ctx.state.links.find((entry) => entry.id === ctx.state.detailId);
  if (!link) {
    return `
      <div class="title-row"><div><h1>Link</h1><p class="sub">This link is not in the current workspace.</p></div>
      <div class="actions"><a class="btn" href="#/links">Back to links</a></div></div>`;
  }

  return `
    <div class="title-row">
      <div>
        <h1>${escapeHtml(link.shortCode)}</h1>
        <p class="sub">One record from GET /api/v1/urls/:id</p>
      </div>
      <div class="actions">
        <a class="btn" href="#/links">Back to links</a>
        <button class="btn primary" type="button" data-action="open-original" data-url="${escapeHtml(link.originalUrl)}">Open original</button>
      </div>
    </div>

    <div class="grid top">
      ${panel({
        classes: "span-7",
        title: "Record",
        meta: statusOf(link),
        body: `<dl class="defs">
          <dt>Original URL</dt><dd><a href="${escapeHtml(link.originalUrl)}" target="_blank" rel="noreferrer">${escapeHtml(link.originalUrl)}</a></dd>
          <dt>Short URL</dt><dd class="code">${escapeHtml(shortUrlOf(link, ctx.baseUrl))}</dd>
          <dt>Status</dt><dd>${statusPill(statusOf(link))}</dd>
          <dt>Expires</dt><dd>${link.expiresAt ? `${formatDate(link.expiresAt)} · ${escapeHtml(link.expiresAt)}` : "-"}</dd>
          <dt>Created</dt><dd>${formatDate(link.createdAt)}</dd>
          <dt>Record id</dt><dd class="code">${escapeHtml(link.id)}</dd>
        </dl>`,
      })}
      ${panel({
        classes: "span-5",
        title: "Actions",
        body: `<p class="meta" style="margin-bottom:14px">The short code is immutable. Update the destination or the expiry, or soft-delete this record.</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn" type="button" data-action="edit" data-id="${escapeHtml(link.id)}">Edit link</button>
            <button class="btn danger" type="button" data-action="delete" data-id="${escapeHtml(link.id)}">Delete link</button>
          </div>
          <p class="meta" style="margin-top:16px">Deleting sets isActive to false. The row and its short code stay in the database.</p>`,
      })}
    </div>`;
};
