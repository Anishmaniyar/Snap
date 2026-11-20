import { escapeHtml } from "../lib/dom.js";
import { formatDate, statusOf } from "../lib/format.js";
import { statusPill } from "./status-pill.js";

export const linkTable = (links, options = {}) => {
  const { compact = false, empty = "No links in this view." } = options;

  if (!links.length) {
    return `<div class="empty">${escapeHtml(empty)}<span class="hint">Create a link or try another filter.</span></div>`;
  }

  if (compact) {
    return `
      <div class="table-wrap"><table>
        <thead><tr><th scope="col">Link</th><th scope="col">Status</th><th scope="col">Expires</th><th scope="col" class="n">Created</th></tr></thead>
        <tbody>${links.map((link) => `
          <tr>
            <td class="primary-cell" data-label="Link"><a class="truncate" href="#/links/${escapeHtml(link.id)}">${escapeHtml(link.originalUrl)}</a><span class="sub code">${escapeHtml(link.shortCode)}</span></td>
            <td data-label="Status">${statusPill(statusOf(link))}</td>
            <td data-label="Expires">${formatDate(link.expiresAt)}</td>
            <td class="n num" data-label="Created">${formatDate(link.createdAt)}</td>
          </tr>`).join("")}</tbody>
      </table></div>`;
  }

  return `
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">Link</th><th scope="col">Short code</th><th scope="col">Status</th><th scope="col">Expires</th><th scope="col" class="n">Created</th><th scope="col" class="n">Actions</th></tr></thead>
      <tbody>${links.map((link) => `
        <tr>
          <td class="primary-cell" data-label="Link"><a class="truncate" href="#/links/${escapeHtml(link.id)}">${escapeHtml(link.originalUrl)}</a></td>
          <td data-label="Short code"><span class="code">${escapeHtml(link.shortCode)}</span></td>
          <td data-label="Status">${statusPill(statusOf(link))}</td>
          <td data-label="Expires">${formatDate(link.expiresAt)}</td>
          <td class="n num" data-label="Created">${formatDate(link.createdAt)}</td>
          <td class="n row-actions-cell" data-label="Actions">
            <div class="row-actions">
              <button class="icon-btn" type="button" data-action="copy" data-id="${escapeHtml(link.id)}" aria-label="Copy short URL for ${escapeHtml(link.shortCode)}"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2"/><path d="M13 5H5a2 2 0 0 0-2 2v8"/></svg></button>
              <button class="icon-btn" type="button" data-action="edit" data-id="${escapeHtml(link.id)}" aria-label="Edit ${escapeHtml(link.shortCode)}"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true"><path d="M13.5 3.5 16.5 6.5M3 17l3.5-.8L16 6.7a2 2 0 0 0-2.8-2.8L3.7 13.4 3 17Z"/></svg></button>
              <button class="icon-btn" type="button" data-action="delete" data-id="${escapeHtml(link.id)}" aria-label="Delete ${escapeHtml(link.shortCode)}"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true"><path d="M4 6h12M8 6V4h4v2M6 6l.7 10h6.6L14 6M8.5 9v4M11.5 9v4"/></svg></button>
            </div>
          </td>
        </tr>`).join("")}</tbody>
    </table></div>`;
};
