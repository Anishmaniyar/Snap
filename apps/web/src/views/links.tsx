"use client";

import { useEffect, useRef, useState } from "react";
import { LinkTable } from "@/components/link-table";
import { sortLinks, statusOf } from "@/lib/format";
import { state, type Link } from "@/state";

interface LinksProps {
  state: any;
  [key: string]: any;
}

export default function Links({ state }: LinksProps) {
  const [search, setSearch] = useState(state.search);
  const [sort, setSort] = useState(state.sort);
  const [filter, setFilter] = useState(state.filter);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
    }
  }, []);

  const visibleLinks = (): Link[] => {
    let rows = state.links.filter((link: Link) => filter === "all" || statusOf(link) === filter);
    if (search) {
      const needle = search.toLowerCase();
      rows = rows.filter((link: any) =>
        link.originalUrl.toLowerCase().includes(needle) || link.shortCode.toLowerCase().includes(needle)
      );
    }
    return sortLinks(rows, sort);
  };

  return (
    <div className="space-y-5.5">
      <div className="title-row flex items-end justify-between gap-4 mb-5">
        <div>
          <h1 className="text-title leading-1.25 font-600 tracking-tight">Your links</h1>
          <p className="sub mt-1 text-faint">{state.links.length} {state.links.length === 1 ? "link" : "links"} in your workspace. Short codes never change; destinations and expiries can be updated.</p>
        </div>
        <div className="actions flex items-center gap-2 flex-wrap">
          <button className="btn primary" data-action="new-link">New link</button>
        </div>
      </div>

      <div className="tabs flex gap-6 border-b border-control mb-4.5" role="tablist" aria-label="Link state">
        {[
          ["all", "All"],
          ["active", "Active"],
          ["expired", "Expired"],
        ].map(([id, label]) => (
          <a
            key={id}
            href={`#/links/${id}`}
            role="tab"
            data-filter={id}
            className={`relative pb-2 text-muted transition-colors hover:text-white ${filter === id ? "text-white" : ""} ${filter === id ? "after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-[-1px] after:h-0.5 after:bg-white" : ""}`}
          >
            {label}
          </a>
        ))}
      </div>

      <div className="toolbar flex items-center gap-2.5 mb-3 flex-wrap">
        <input
          className="input w-[280px] max-w-full h-[38px] px-3 border border-control rounded-lg bg-ground text-white placeholder-faint search"
          id="link-search"
          type="search"
          placeholder="Search links"
          aria-label="Search links"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            state.search = e.target.value;
          }}
        />
        <div className="spacer flex-1"></div>
        <span className="meta text-faint text-xs" id="link-shown">{visibleLinks().length} shown</span>
        <select
          className="input w-auto h-[38px] px-3 border border-control rounded-lg bg-ground text-white"
          id="link-sort"
          aria-label="Sort links"
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            state.sort = e.target.value;
          }}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="code">Short code</option>
        </select>
      </div>

      <div className="panel" id="links-table">
        <LinkTable links={visibleLinks()} />
      </div>
    </div>
  );
}
