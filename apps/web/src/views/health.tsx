"use client";

import { useEffect, useRef } from "react";
import { Panel } from "@/components/panel";
import { state } from "@/state";
import { formatTime } from "@/lib/format";
import { escapeHtml } from "@/lib/dom";
import { api } from "@/lib/api";

interface HealthProps {
  refreshHealth: () => void;
  state: any;
  [key: string]: any;
}

export default function Health({ refreshHealth, state }: HealthProps) {
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      refreshHealth();
    }
  }, [refreshHealth]);

  return (
    <div className="space-y-5.5">
      <div className="title-row flex items-end justify-between gap-4 mb-5">
        <div>
          <h1 className="text-title leading-1.25 font-600 tracking-tight">Service health</h1>
          <p className="sub mt-1 text-faint">A live read of GET /health and Prometheus metrics from GET /metrics.</p>
        </div>
        <div className="actions flex items-center gap-2 flex-wrap">
          <button className="btn" type="button" data-action="health-refresh">Refresh</button>
        </div>
      </div>
      <div className="grid grid-cols-[repeat(12,minmax(0,1fr))] gap-3.5 top">
        <Panel classes="span-5" title="Service" meta="GET /health">
          <div className="status-list grid gap-0" id="health-status"></div>
        </Panel>
        <Panel classes="span-7" title="Metrics" meta="GET /metrics · Prometheus text">
          <div id="metrics-wrap"></div>
        </Panel>
      </div>
    </div>
  );
}
