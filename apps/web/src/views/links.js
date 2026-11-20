import { linkTable } from "../components/link-table.js";
import { sortLinks } from "../lib/format.js";
import { $, $$ } from "../lib/dom.js";

export const title = "Links";

const visibleLinks = (ctx) => {
  const { state } = ctx;
  let rows = state.links.filter((link) => state.filter === "all" || linkStatus(link) === state.filter);
  if (state.search) {
    const needle = state.search.toLowerCase();
    rows = rows.filter((link) => link.originalUrl.toLowerCase().includes(needle) || link.shortCode.toLowerCase().includes(needle));
  }
  return sortLinks(rows, state.sort);
};

const linkStatus = (link) => {
  if (!link.isActive) return "inactive";
  if (link.expiresAt && new Date(link.expiresAt) <= new Date()) return "expired";
  return "active";
};

export const render = (ctx) => {
  const rows = visibleLinks(ctx);
  return `
    <div class="title-row">
      <div>
        <h1>Links</h1>
        <p class="sub">${ctx.state.links.length} links in this workspace. Short codes are immutable.</p>
      </div>
      <div class="actions"><button class="btn primary" type="button" data-action="new-link">New link</button></div>
    </div>

    <div class="tabs" role="tablist" aria-label="Link state">
      ${[["all", "All"], ["active", "Active"], ["expired", "Expired"]].map(([id, label]) => `
        <a href="#/links/${id}" role="tab" data-filter="${id}" ${ctx.state.filter === id ? 'aria-selected="true"' : 'aria-selected="false"'}>${label}</a>`).join("")}
    </div>

    <div class="toolbar">
      <input class="input search" id="link-search" type="search" placeholder="Search links" aria-label="Search links" value="${ctx.state.search.replace(/"/g, "&quot;")}">
      <div class="spacer"></div>
      <span class="meta" id="link-shown">${rows.length} shown</span>
      <select class="input" id="link-sort" aria-label="Sort links">
        <option value="newest" ${ctx.state.sort === "newest" ? "selected" : ""}>Newest first</option>
        <option value="oldest" ${ctx.state.sort === "oldest" ? "selected" : ""}>Oldest first</option>
        <option value="code" ${ctx.state.sort === "code" ? "selected" : ""}>Short code</option>
      </select>
    </div>

    <div class="panel" id="links-table">${linkTable(rows)}</div>`;
};

export const mount = (ctx) => {
  const refreshTable = () => {
    $("#links-table").innerHTML = linkTable(visibleLinks(ctx));
    $("#link-shown").textContent = `${visibleLinks(ctx).length} shown`;
  };
  $("#link-search")?.addEventListener("input", (event) => {
    ctx.state.search = event.target.value;
    refreshTable();
  });
  $("#link-sort")?.addEventListener("change", (event) => {
    ctx.state.sort = event.target.value;
    refreshTable();
  });
  $$("[data-filter]").forEach((tab) => {
    tab.addEventListener("click", () => {
      ctx.state.filter = tab.dataset.filter;
      ctx.state.search = "";
    });
  });
};
