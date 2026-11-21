"use client";

import { useEffect, useRef } from "react";
import { KPIStrip } from "@/components/kpi-strip";
import { CreateForm } from "@/components/link-form";
import { Panel } from "@/components/panel";
import { LinkTable } from "@/components/link-table";
import { Pipeline, CREATE_STEPS, REDIRECT_STEPS } from "@/components/request-pipeline";
import { sortLinks } from "@/lib/format";
import type { Link } from "@/state";

interface OverviewProps {
  state: any;
  baseUrl: string;
  counts: () => any;
  refreshView: () => void;
  mountCreateForm: () => void;
  [key: string]: any;
}

export default function Overview({ state, baseUrl, counts, refreshView, mountCreateForm }: OverviewProps) {
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      mountCreateForm();
    }
  }, [mountCreateForm]);

  const { total, active, expired } = counts();
  const finding = expired > 0
    ? `${expired} expired link still resolves with a 410.`
    : "Every link in this workspace resolves.";
  const recent: Link[] = sortLinks<Link>(state.links, "newest").slice(0, 3);

  return (
    <div className="space-y-5.5">
      <div className="title-row flex items-end justify-between gap-4 mb-5">
        <div>
          <h1 className="text-title leading-1.25 font-600 tracking-tight">Your workspace</h1>
          <p className="sub mt-1 text-faint">{total} {total === 1 ? "link" : "links"} · {active} active · {finding}</p>
        </div>
        <div className="actions flex items-center gap-2 flex-wrap">
          <a href="#/flow" className="btn">See the flow</a>
          <button className="btn primary" data-action="new-link">New link</button>
        </div>
      </div>

      <div className="mb-5.5">
        <KPIStrip total={total} active={active} expired={expired} />
      </div>

      <div className="grid grid-cols-[repeat(12,minmax(0,1fr))] gap-3.5 top">
        <CreateForm baseUrl={baseUrl} />
        <Panel
          classes="span-5"
          title="This request's path"
          meta="live pipeline"
        >
          <div>
            <Pipeline steps={CREATE_STEPS} id="create-pipeline" />
            <p className="meta mt-4 text-faint text-xs">Every request carries an X-Request-ID and is timed into /metrics.</p>
          </div>
        </Panel>
        <Panel
          classes="span-8"
          title="Recent links"
          action={<a className="card-link" href="#/links">View all links</a>}
        >
          <LinkTable links={recent} compact={true} />
        </Panel>
        <Panel
          classes="span-4"
          title="Follow a link"
          meta="GET /:shortCode"
        >
          <div>
            <Pipeline steps={REDIRECT_STEPS} id="redirect-pipeline" />
            <p className="meta mt-4 text-faint text-xs">The public route checks isActive and expiry before it answers with a 302.</p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
