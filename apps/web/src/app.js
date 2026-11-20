import { state, baseUrl, counts, useSample, saveSession, clearSession, setMode } from "./state.js";
import { api } from "./lib/api.js";
import { $, $$, setText, setHtml, escapeHtml } from "./lib/dom.js";
import { formatDate, formatTime, toIso, toLocalInput, statusOf, shortUrlOf } from "./lib/format.js";
import { shell } from "./components/shell.js";
import { dialogs } from "./components/dialogs.js";
import { CREATE_STEPS, renderPipeline, runPipeline } from "./components/request-pipeline.js";
import { linkTable } from "./components/link-table.js";
import * as overview from "./views/overview.js";
import * as links from "./views/links.js";
import * as detail from "./views/detail.js";
import * as flow from "./views/flow.js";
import * as health from "./views/health.js";
import * as signin from "./views/signin.js";

const views = { overview, links, detail, flow, health, signin };

const ctx = {
  state,
  baseUrl,
  counts,
  refreshView: () => render(),
  mountCreateForm,
  mountAuthForm,
  refreshHealth,
};

const parseRoute = () => {
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  const first = parts[0] || "overview";
  if (first === "links" && parts[1] && !["all", "active", "expired"].includes(parts[1])) {
    return { view: "detail", title: "Link", id: parts[1] };
  }
  if (first === "links") return { view: "links", title: "Links", filter: parts[1] || "all" };
  if (first === "flow" || first === "health") return { view: first, title: views[first].title };
  if (first === "signin" || first === "signup") {
    return { view: "signin", title: "Sign in", auth: first };
  }
  return { view: "overview", title: "Overview" };
};

const updateChrome = (active, title) => {
  setText("#crumb", title);
  setText("#mode-chip", state.mode === "demo" || state.mode === "sample" ? "Sample data" : "Live API");
  setText("#account-name", state.user.name);
  setText("#account-email", state.user.email);
  setText("#avatar", state.user.name.slice(0, 2).toUpperCase());

  $$("[data-nav]").forEach((item) => {
    if (item.dataset.nav === (active === "detail" ? "links" : active)) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
  });

  const toggle = $("#auth-toggle");
  if (toggle) toggle.textContent = state.mode === "sample" ? "Use live API" : "Use sample data";
  $("#signout").hidden = state.mode !== "live" || !state.token;

  const connection = $("#connection");
  if (connection) {
    connection.hidden = false;
    connection.textContent = state.apiOnline
      ? (state.mode === "live" ? "API online" : "Connect to API")
      : "API offline";
    connection.disabled = !state.apiOnline;
    connection.title = state.apiOnline ? `GET /health: ${state.apiStatus}` : "Start the API with pnpm dev";
  }
  const dot = $("#scope-dot");
  if (dot) dot.style.background = state.apiOnline ? "var(--accent)" : "var(--control)";
  setText("#scope-label", state.apiOnline ? "api online" : "local");
};

const render = () => {
  const route = parseRoute();
  state.route = route.auth || route.view;
  if (route.filter) state.filter = route.filter;
  if (route.id) state.detailId = route.id;
  if (route.view === "detail") state.detailId = route.id;

  const view = views[route.view];
  setHtml("#view", view.render(ctx));
  updateChrome(route.view, route.title);
  view.mount?.(ctx);
};

const checkConnection = async () => {
  try {
    const result = await api.health();
    state.apiOnline = result.ok;
    state.apiStatus = result.status;
  } catch {
    state.apiOnline = false;
    state.apiStatus = "unreachable";
  }
  updateChrome(parseRoute().view, parseRoute().title);
};

const loadLinks = async () => {
  if (state.mode === "sample") {
    useSample();
    return;
  }
  if (!state.token) {
    state.links = [];
    return;
  }
  state.links = await api.listUrls(state.token);
};

const generateCode = () => {
  const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";
  for (let index = 0; index < 6; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
};

const preview = () => {
  const alias = $("#create-alias")?.value.trim();
  setText("#preview-url", `${baseUrl}/${alias || "······"}`);
};

const createLink = async (event) => {
  event.preventDefault();
  const originalUrl = $("#create-url").value.trim();
  const alias = $("#create-alias").value.trim();
  const rawExpiry = $("#create-expiry").value;
  const error = $("#create-error");
  const result = $("#create-result");
  error.textContent = "";
  result.textContent = "";
  result.className = "result";

  try {
    const parsed = new URL(originalUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
  } catch {
    error.textContent = "Enter a full http or https URL.";
    return;
  }
  if (alias && !/^[A-Za-z0-9_-]{3,10}$/.test(alias)) {
    error.textContent = "An alias is 3 to 10 letters, numbers, hyphens or underscores.";
    return;
  }

  const expiresAt = toIso(rawExpiry);
  const submit = $("#create-submit");
  submit.disabled = true;

  try {
    const link = await runPipeline("create-pipeline", async () => {
      if (state.mode === "sample") {
        let code = alias;
        if (!code) {
          do { code = generateCode(); } while (state.links.some((entry) => entry.shortCode === code));
        } else if (state.links.some((entry) => entry.shortCode === code)) {
          throw new Error("Short code already taken");
        }
        const created = {
          id: crypto.randomUUID(),
          originalUrl,
          shortCode: code,
          expiresAt,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        state.links.unshift(created);
        await new Promise((resolve) => setTimeout(resolve, 320));
        return created;
      }
      if (!state.token) throw new Error("Sign in before creating a link.");
      return api.createUrl({
        originalUrl,
        ...(alias ? { customAlias: alias } : {}),
        ...(expiresAt ? { expiresAt } : {}),
      }, state.token);
    });

    result.className = "result form-success";
    result.textContent = `Created ${shortUrlOf(link, baseUrl)}`;
    $("#create-form").reset();
    preview();
    renderOverviewCounts();
  } catch (failure) {
    error.textContent = failure.message;
  } finally {
    submit.disabled = false;
  }
};

const renderOverviewCounts = () => {
  if (parseRoute().view !== "overview") return;
  const { total, active, expired } = counts();
  const sub = $(".title-row .sub");
  if (sub) {
    sub.textContent = `${total} links · ${active} active · ${expired > 0
      ? `${expired} expired link still resolves with a 410.`
      : "Every link in this workspace resolves."}`;
  }
  const values = $$(".kpi-value");
  if (values.length >= 4) {
    values[0].textContent = total;
    values[1].textContent = active;
    values[2].textContent = expired;
  }
  const table = $("#view .panel .table-wrap");
  if (table) {
    const recent = [...state.links].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
    table.outerHTML = linkTable(recent, { compact: true });
  }
};

const copyLink = async (id) => {
  const link = state.links.find((entry) => entry.id === id);
  if (!link) return;
  const url = shortUrlOf(link, baseUrl);
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    const holder = document.createElement("textarea");
    holder.value = url;
    document.body.appendChild(holder);
    holder.select();
    document.execCommand("copy");
    holder.remove();
  }
};

const openEdit = (id) => {
  const link = state.links.find((entry) => entry.id === id);
  if (!link) return;
  state.editingId = id;
  $("#edit-url").value = link.originalUrl;
  $("#edit-expiry").value = toLocalInput(link.expiresAt);
  $("#edit-error").textContent = "";
  $("#edit-dialog").showModal();
};

const openDelete = (id) => {
  const link = state.links.find((entry) => entry.id === id);
  if (!link) return;
  state.deletingId = id;
  $("#delete-copy").textContent = `Delete ${link.shortCode}? The record is soft-deleted and the short code stays reserved.`;
  $("#delete-dialog").showModal();
};

const saveEdit = async (event) => {
  event.preventDefault();
  const link = state.links.find((entry) => entry.id === state.editingId);
  if (!link) return;
  const originalUrl = $("#edit-url").value.trim();
  try {
    const parsed = new URL(originalUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
  } catch {
    $("#edit-error").textContent = "Enter a full http or https URL.";
    return;
  }
  const expiresAt = toIso($("#edit-expiry").value);
  try {
    if (state.mode === "live") {
      await api.updateUrl(link.id, { originalUrl, expiresAt }, state.token);
    }
    link.originalUrl = originalUrl;
    link.expiresAt = expiresAt;
    $("#edit-dialog").close();
    render();
  } catch (error) {
    $("#edit-error").textContent = error.message;
  }
};

const confirmDelete = async () => {
  const link = state.links.find((entry) => entry.id === state.deletingId);
  if (!link) return;
  try {
    if (state.mode === "live") await api.deleteUrl(link.id, state.token);
    state.links = state.links.filter((entry) => entry.id !== link.id);
    $("#delete-dialog").close();
    location.hash = "#/links";
    render();
  } catch (error) {
    $("#delete-copy").textContent = error.message;
  }
};

const authenticate = async (event) => {
  event.preventDefault();
  const signup = state.route === "signup";
  const email = $("#auth-email").value.trim();
  const password = $("#auth-password").value;
  const name = $("#auth-name").value.trim();
  const error = $("#auth-error");
  error.textContent = "";
  if (!email || password.length < 8 || (signup && !name)) {
    error.textContent = "Enter an email, a password of at least 8 characters" + (signup ? " and a name." : ".");
    return;
  }
  if (state.mode === "sample") {
    error.textContent = "Switch to the live API to call the auth endpoints.";
    return;
  }
  try {
    const payload = signup
      ? await api.signup({ name, email, password })
      : await api.login({ email, password });
    saveSession(payload.data);
    location.hash = "#/overview";
    await loadLinks();
    render();
  } catch (failure) {
    error.textContent = failure.message;
  }
};

async function refreshHealth() {
  const status = $("#health-status");
  const metrics = $("#metrics-wrap");
  if (!status || !metrics) return;
  if (state.mode === "sample") {
    status.innerHTML = `<div class="status-row"><span class="status-label">API</span><span class="pill">Sample mode</span></div><div class="status-row"><span class="status-label">Health check</span><span>${state.apiOnline ? escapeHtml(state.apiStatus) : "-"}</span></div>`;
    metrics.innerHTML = `<div class="empty">Connect the live API to read metrics.<span class="hint">Counters and histograms are served by the API, not stored in this console.</span></div>`;
    return;
  }
  status.innerHTML = `<div class="status-row"><span class="status-label">API</span><span>Checking…</span></div>`;
  metrics.innerHTML = `<div class="empty">Reading /metrics…</div>`;
  try {
    const [healthResponse, text] = await Promise.all([fetch("/health").then((r) => r.json().catch(() => null)), api.metrics()]);
    status.innerHTML = `
      <div class="status-row"><span class="status-label">API</span><span class="pill pos">Reachable</span></div>
      <div class="status-row"><span class="status-label">Status</span><span>${escapeHtml(healthResponse?.status || "-")}</span></div>
      <div class="status-row"><span class="status-label">Checked</span><span>${formatTime()}</span></div>`;
    metrics.innerHTML = `<pre class="metrics">${escapeHtml(text || "No metrics returned.")}</pre>`;
  } catch (error) {
    status.innerHTML = `<div class="status-row"><span class="status-label">API</span><span class="pill neg">Unreachable</span></div><div class="status-row"><span class="status-label">Error</span><span>${escapeHtml(error.message)}</span></div>`;
    metrics.innerHTML = `<div class="empty">Could not read /metrics.<span class="hint">${escapeHtml(error.message)}</span></div>`;
  }
}

const switchMode = async () => {
  const next = state.mode === "sample" ? "live" : "sample";
  setMode(next);
  if (next === "live") {
    state.user = { name: "Live workspace", email: state.token ? "signed in" : "not signed in" };
    location.hash = state.token ? "#/overview" : "#/signin";
    if (state.token) {
      try { await loadLinks(); } catch { state.links = []; }
    }
  } else {
    useSample();
    location.hash = "#/overview";
  }
  render();
};

function mountCreateForm() {
  $("#create-form")?.addEventListener("submit", createLink);
  ["#create-url", "#create-alias", "#create-expiry"].forEach((selector) => {
    $(selector)?.addEventListener("input", preview);
  });
  preview();
}

function mountAuthForm() {
  $("#auth-form")?.addEventListener("submit", authenticate);
}

const bindGlobalEvents = () => {
  document.addEventListener("click", async (event) => {
    const action = event.target.closest("[data-action]");
    if (!action) return;
    const id = action.dataset.id;

    switch (action.dataset.action) {
      case "auth-toggle": await switchMode(); break;
      case "connection": if (state.mode === "sample") await switchMode(); break;
      case "signout":
        clearSession();
        state.links = [];
        location.hash = "#/signin";
        render();
        break;
      case "auth-switch":
        location.hash = state.route === "signup" ? "#/signin" : "#/signup";
        break;
      case "health-refresh": await refreshHealth(); break;
      case "new-link":
        location.hash = "#/overview";
        $("#create-url")?.focus();
        break;
      case "copy": await copyLink(id); break;
      case "edit": openEdit(id); break;
      case "delete": openDelete(id); break;
      case "confirm-delete": await confirmDelete(); break;
      case "close-dialog": action.closest("dialog").close(); break;
      case "open-original": window.open(action.dataset.url, "_blank", "noreferrer"); break;
      case "menu": {
        const open = $("#sidebar").classList.toggle("open");
        action.setAttribute("aria-expanded", String(open));
        action.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
        break;
      }
      default: break;
    }
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-nav]")) {
      $("#sidebar").classList.remove("open");
      const menu = $(".menu-toggle");
      menu?.setAttribute("aria-expanded", "false");
    }
  });

  $$("dialog").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  });

  $("#edit-form")?.addEventListener("submit", saveEdit);
};

export const start = async () => {
  document.body.innerHTML = shell(parseRoute().view, parseRoute().title) + dialogs();
  bindGlobalEvents();
  renderPipeline(CREATE_STEPS, "create-pipeline");
  await checkConnection();
  if (state.mode === "live" && state.token) {
    try { await loadLinks(); } catch { state.links = []; }
  }
  if (!location.hash) location.hash = "#/overview";
  window.addEventListener("hashchange", render);
  render();
};
