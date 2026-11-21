"use client";

import { Panel } from "@/components/panel";
import { Pipeline, CREATE_STEPS, REDIRECT_STEPS } from "@/components/request-pipeline";

interface FlowProps {
  [key: string]: any;
}

export default function Flow({}: FlowProps) {
  return (
    <div className="space-y-5.5">
      <div className="title-row flex items-end justify-between gap-4 mb-5">
        <div>
          <h1 className="text-title leading-1.25 font-600 tracking-tight">How a request travels</h1>
          <p className="sub mt-1 text-faint">Two paths through one Express router &mdash; an authenticated write and a public redirect. No account needed to look.</p>
        </div>
        <div className="actions flex items-center gap-2 flex-wrap">
          <a className="btn primary" href="#/signin">Create a link</a>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(12,minmax(0,1fr))] gap-3.5 top">
        <Panel classes="span-12" title="Two paths, one router" meta="Express 5 · /api/v1 and /:shortCode">
          <div className="flow-lanes grid grid-cols-[1fr_1fr] gap-3.5">
            <div className="flow-lane bg-raised rounded-[12px] p-4">
              <h3 className="text-body font-600 mb-3">Create a link</h3>
              <Pipeline steps={CREATE_STEPS} id="flow-create" />
            </div>
            <div className="flow-lane bg-raised rounded-[12px] p-4">
              <h3 className="text-body font-600 mb-3">Follow a link</h3>
              <Pipeline steps={REDIRECT_STEPS} id="flow-redirect" />
            </div>
          </div>
        </Panel>

        <Panel classes="span-6" title="Routes" meta="mounted under /api/v1">
          <div className="table-wrap overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th scope="col" className="h-9 px-3 text-left font-400 text-xs text-muted border-b border-rule whitespace-nowrap">Method</th>
                  <th scope="col" className="h-9 px-3 text-left font-400 text-xs text-muted border-b border-rule whitespace-nowrap">Path</th>
                  <th scope="col" className="h-9 px-3 text-left font-400 text-xs text-muted border-b border-rule whitespace-nowrap">Auth</th>
                  <th scope="col" className="n h-9 px-3 text-right font-400 text-xs text-muted border-b border-rule whitespace-nowrap">Result</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="code p-3.5 min-h-[14px] border-b border-rule align-middle font-mono text-xs text-white">POST</td><td className="p-3.5 min-h-[14px] border-b border-rule align-middle">/auth/signup</td><td className="p-3.5 min-h-[14px] border-b border-rule align-middle">No</td><td className="n num p-3.5 min-h-[14px] border-b border-rule align-middle text-right font-mono text-xs text-white">201</td></tr>
                <tr><td className="code p-3.5 min-h-[14px] border-b border-rule align-middle font-mono text-xs text-white">POST</td><td className="p-3.5 min-h-[14px] border-b border-rule align-middle">/auth/login</td><td className="p-3.5 min-h-[14px] border-b border-rule align-middle">No</td><td className="n num p-3.5 min-h-[14px] border-b border-rule align-middle text-right font-mono text-xs text-white">200</td></tr>
                <tr><td className="code p-3.5 min-h-[14px] border-b border-rule align-middle font-mono text-xs text-white">POST</td><td className="p-3.5 min-h-[14px] border-b border-rule align-middle">/auth/logout</td><td className="p-3.5 min-h-[14px] border-b border-rule align-middle">No</td><td className="n num p-3.5 min-h-[14px] border-b border-rule align-middle text-right font-mono text-xs text-white">200</td></tr>
                <tr><td className="code p-3.5 min-h-[14px] border-b border-rule align-middle font-mono text-xs text-white">POST</td><td className="p-3.5 min-h-[14px] border-b border-rule align-middle">/urls</td><td className="p-3.5 min-h-[14px] border-b border-rule align-middle">Bearer</td><td className="n num p-3.5 min-h-[14px] border-b border-rule align-middle text-right font-mono text-xs text-white">201</td></tr>
                <tr><td className="code p-3.5 min-h-[14px] border-b border-rule align-middle font-mono text-xs text-white">GET</td><td className="p-3.5 min-h-[14px] border-b border-rule align-middle">/urls</td><td className="p-3.5 min-h-[14px] border-b border-rule align-middle">Bearer</td><td className="n num p-3.5 min-h-[14px] border-b border-rule align-middle text-right font-mono text-xs text-white">200</td></tr>
                <tr><td className="code p-3.5 min-h-[14px] border-b border-rule align-middle font-mono text-xs text-white">GET</td><td className="p-3.5 min-h-[14px] border-b border-rule align-middle">/urls/:id</td><td className="p-3.5 min-h-[14px] border-b border-rule align-middle">Bearer</td><td className="n num p-3.5 min-h-[14px] border-b border-rule align-middle text-right font-mono text-xs text-white">200</td></tr>
                <tr><td className="code p-3.5 min-h-[14px] border-b border-rule align-middle font-mono text-xs text-white">PATCH</td><td className="p-3.5 min-h-[14px] border-b border-rule align-middle">/urls/:id</td><td className="p-3.5 min-h-[14px] border-b border-rule align-middle">Bearer</td><td className="n num p-3.5 min-h-[14px] border-b border-rule align-middle text-right font-mono text-xs text-white">200</td></tr>
                <tr><td className="code p-3.5 min-h-[14px] border-b border-rule align-middle font-mono text-xs text-white">DELETE</td><td className="p-3.5 min-h-[14px] border-b border-rule align-middle">/urls/:id</td><td className="p-3.5 min-h-[14px] border-b border-rule align-middle">Bearer</td><td className="n num p-3.5 min-h-[14px] border-b border-rule align-middle text-right font-mono text-xs text-white">204</td></tr>
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel classes="span-6" title="Data model" meta="PostgreSQL · Prisma">
          <dl className="defs grid grid-cols-[180px_minmax(0,1fr)] gap-0">
            <div className="border-b border-rule">
              <dt className="p-3 text-muted">User</dt>
              <dd className="p-3 min-w-0 break-anywhere code font-mono text-xs text-white">id · name · email · passwordHash · createdAt · updatedAt</dd>
            </div>
            <div className="border-b border-rule">
              <dt className="p-3 text-muted">Url</dt>
              <dd className="p-3 min-w-0 break-anywhere code font-mono text-xs text-white">id · originalUrl · shortCode · expiresAt · isActive · userId · createdAt · updatedAt</dd>
            </div>
            <div className="border-b border-rule">
              <dt className="p-3 text-muted">Ownership</dt>
              <dd className="p-3 min-w-0 break-anywhere text-faint text-xs">userId → User.id, ON DELETE CASCADE. Every authenticated URL query checks the owner.</dd>
            </div>
            <div className="border-b border-rule">
              <dt className="p-3 text-muted">Uniqueness</dt>
              <dd className="p-3 min-w-0 break-anywhere text-faint text-xs">shortCode is unique. A collision retries the generated code up to five times; a custom alias returns 409.</dd>
            </div>
            <div className="border-b border-rule">
              <dt className="p-3 text-muted">Deletion</dt>
              <dd className="p-3 min-w-0 break-anywhere text-faint text-xs">Soft delete: isActive becomes false. The short code is never released.</dd>
            </div>
          </dl>
        </Panel>

        <Panel classes="span-12" title="Observability" meta="every request">
          <div className="status-list grid gap-0">
            <div className="status-row flex items-center justify-between gap-3 min-h-[42px] border-b border-rule">
              <span className="status-label text-muted">X-Request-ID</span>
              <span className="text-faint text-xs">UUID from requestLogger, returned on the response</span>
            </div>
            <div className="status-row flex items-center justify-between gap-3 min-h-[42px] border-b border-rule">
              <span className="status-label text-muted">Access log</span>
              <span className="text-faint text-xs">Pino, with password, tokens and authorization headers redacted</span>
            </div>
            <div className="status-row flex items-center justify-between gap-3 min-h-[42px] border-b border-rule">
              <span className="status-label text-muted">Counters</span>
              <span className="code font-mono text-xs text-white">http_requests_total</span>
            </div>
            <div className="status-row flex items-center justify-between gap-3 min-h-[42px] border-b border-rule">
              <span className="status-label text-muted">Latency</span>
              <span className="code font-mono text-xs text-white">http_request_duration_seconds</span>
            </div>
            <div className="status-row flex items-center justify-between gap-3 min-h-[42px] border-b border-rule">
              <span className="status-label text-muted">Labels</span>
              <span className="text-faint text-xs">method · route · status_code</span>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
