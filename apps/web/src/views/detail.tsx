"use client";

import { useEffect, useRef } from "react";
import { Panel } from "@/components/panel";
import { statusPill } from "@/components/status-pill";
import { escapeHtml } from "@/lib/dom";
import { formatDate, statusOf, shortUrlOf } from "@/lib/format";
import { state, baseUrl } from "@/state";

interface DetailProps {
  state: any;
  baseUrl: string;
  [key: string]: any;
}

export default function Detail({ state, baseUrl }: DetailProps) {
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
  }, []);

  const link = state.links.find((entry: any) => entry.id === state.detailId);
  if (!link) {
    return (
      <div className="space-y-5.5">
        <div className="title-row flex items-end justify-between gap-4 mb-5">
          <div>
            <h1 className="text-title leading-1.25 font-600 tracking-tight">Link</h1>
            <p className="sub mt-1 text-faint">This link isn't in your workspace, or it was deleted.</p>
          </div>
          <div className="actions flex items-center gap-2 flex-wrap">
            <a className="btn" href="#/links">Back to links</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5.5">
      <div className="title-row flex items-end justify-between gap-4 mb-5">
        <div>
          <h1 className="text-title leading-1.25 font-600 tracking-tight">{escapeHtml(link.shortCode)}</h1>
          <p className="sub mt-1 text-faint">The full record, straight from GET /api/v1/urls/:id</p>
        </div>
        <div className="actions flex items-center gap-2 flex-wrap">
          <a className="btn" href="#/links">Back to links</a>
          <button
            className="btn primary"
            data-action="open-original"
            data-url={escapeHtml(link.originalUrl)}
          >
            Open original
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(12,minmax(0,1fr))] gap-3.5 top">
        <Panel classes="span-7" title="Record" meta={statusOf(link)}>
          <dl className="defs grid grid-cols-[180px_minmax(0,1fr)] gap-0">
            <div className="border-b border-rule">
              <dt className="p-3 text-muted">Original URL</dt>
              <dd className="p-3 min-w-0 break-anywhere">
                <a href={escapeHtml(link.originalUrl)} target="_blank" rel="noreferrer">
                  {escapeHtml(link.originalUrl)}
                </a>
              </dd>
            </div>
            <div className="border-b border-rule">
              <dt className="p-3 text-muted">Short URL</dt>
              <dd className="p-3 min-w-0 break-anywhere code font-mono text-xs text-white">
                {escapeHtml(shortUrlOf(link, baseUrl))}
              </dd>
            </div>
            <div className="border-b border-rule">
              <dt className="p-3 text-muted">Status</dt>
              <dd className="p-3">{statusPill(statusOf(link))}</dd>
            </div>
            <div className="border-b border-rule">
              <dt className="p-3 text-muted">Expires</dt>
              <dd className="p-3 min-w-0 break-anywhere">
                {link.expiresAt ? `${formatDate(link.expiresAt)} · ${escapeHtml(link.expiresAt)}` : "-"}
              </dd>
            </div>
            <div className="border-b border-rule">
              <dt className="p-3 text-muted">Created</dt>
              <dd className="p-3 min-w-0 break-anywhere">{formatDate(link.createdAt)}</dd>
            </div>
            <div className="border-b border-rule">
              <dt className="p-3 text-muted">Record id</dt>
              <dd className="p-3 min-w-0 break-anywhere code font-mono text-xs text-white">{escapeHtml(link.id)}</dd>
            </div>
          </dl>
        </Panel>
        <Panel classes="span-5" title="Actions">
          <p className="meta text-faint text-xs mb-3.5">The short code is immutable. Update the destination or the expiry, or soft-delete this record.</p>
          <div className="flex gap-2 flex-wrap">
            <button className="btn" type="button" data-action="edit" data-id={escapeHtml(link.id)}>
              Edit link
            </button>
            <button className="btn danger" type="button" data-action="delete" data-id={escapeHtml(link.id)}>
              Delete link
            </button>
          </div>
          <p className="meta text-faint text-xs mt-4">Deleting sets isActive to false. The row and its short code stay in the database.</p>
        </Panel>
      </div>
    </div>
  );
}
