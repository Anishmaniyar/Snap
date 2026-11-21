"use client";

import { useEffect, useState } from "react";
import { state, baseUrl, counts, isAuthed, saveSession, clearSession } from "@/state";
import { api } from "@/lib/api";
import { escapeHtml } from "@/lib/dom";
import { formatTime, toIso, toLocalInput, shortUrlOf } from "@/lib/format";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { PublicHeader } from "@/components/public-header";
import { Dialogs } from "@/components/dialogs";
import { RunPipeline as runPipeline } from "@/components/request-pipeline";
import Landing from "@/views/landing";
import Overview from "@/views/overview";
import Links from "@/views/links";
import Detail from "@/views/detail";
import Flow from "@/views/flow";
import Health from "@/views/health";
import Signin from "@/views/signin";

const views: Record<string, any> = {
  landing: Landing,
  overview: Overview,
  links: Links,
  detail: Detail,
  flow: Flow,
  health: Health,
  signin: Signin,
};

const PUBLIC_VIEWS = new Set(["landing", "flow", "signin"]);

function parseRoute(): { view: string; title: string; filter?: string; id?: string; auth?: string } {
  if (typeof window === "undefined") return { view: "landing", title: "Snap" };
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  const first = parts[0] || "landing";
  if (first === "flow") return { view: "flow", title: "Request flow" };
  if (first === "health") return { view: "health", title: "Service health" };
  if (first === "signin" || first === "signup") {
    return { view: "signin", title: first === "signup" ? "Create account" : "Sign in", auth: first };
  }
  if (first === "links" && parts[1] && !["all", "active", "expired"].includes(parts[1])) {
    return { view: "detail", title: "Link detail", id: parts[1] };
  }
  if (first === "links") return { view: "links", title: "Links", filter: parts[1] || "all" };
  if (first === "overview") return { view: "overview", title: "Overview" };
  return { view: "landing", title: "Snap" };
}

export default function App() {
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (!location.hash) location.hash = "#/landing";
    const handleHashChange = () => setRefreshKey((k) => k + 1);
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const route = mounted ? parseRoute() : { view: "landing", title: "Snap" };
  const isPublic = PUBLIC_VIEWS.has(route.view);
  state.route = route.auth || route.view;
  if (route.filter) state.filter = route.filter;
  if (route.id) state.detailId = route.id ?? null;
  if (route.view === "detail") state.detailId = route.id ?? null;

  const ViewComponent = views[route.view];

  useEffect(() => {
    if (mounted && !isPublic && !isAuthed()) {
      location.hash = "#/signin";
    }
  }, [mounted, isPublic, refreshKey]);

  const updateChrome = () => {
    const crumb = document.getElementById("crumb");
    if (crumb) crumb.textContent = route.title;
    const accountName = document.getElementById("account-name");
    if (accountName) accountName.textContent = state.user.name;
    const accountEmail = document.getElementById("account-email");
    if (accountEmail) accountEmail.textContent = state.user.email;
    const avatar = document.getElementById("avatar");
    if (avatar) avatar.textContent = state.user.name.slice(0, 2).toUpperCase();

    document.querySelectorAll<HTMLElement>("[data-nav]").forEach((item) => {
      if (item.dataset.nav === (route.view === "detail" ? "links" : route.view)) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });

    const signout = document.getElementById("signout");
    if (signout) signout.hidden = !isAuthed();

    const connection = document.getElementById("connection") as HTMLButtonElement | null;
    if (connection) {
      connection.hidden = false;
      connection.textContent = state.apiOnline ? "API online" : "API offline";
      connection.title = state.apiOnline
        ? `GET /health: ${state.apiStatus}`
        : "Start the API to check service health";
    }
    const dot = document.getElementById("scope-dot");
    if (dot) dot.style.background = state.apiOnline ? "var(--accent)" : "var(--control)";
    const scopeLabel = document.getElementById("scope-label");
    if (scopeLabel) scopeLabel.textContent = state.apiOnline ? "api online" : "offline";
  };

  useEffect(() => {
    updateChrome();
  }, [updateChrome, refreshKey]);

  const checkConnection = async () => {
    try {
      const result = await api.health();
      state.apiOnline = result.ok;
      state.apiStatus = result.status;
    } catch {
      state.apiOnline = false;
      state.apiStatus = "unreachable";
    }
    updateChrome();
  };

  const loadLinks = async () => {
    if (!state.token) {
      state.links = [];
      setRefreshKey((k) => k + 1);
      return;
    }
    try {
      state.links = (await api.listUrls(state.token as string)) as any;
    } catch {
      state.links = [];
    }
    setRefreshKey((k) => k + 1);
  };

  useEffect(() => {
    checkConnection();
    if (isAuthed()) loadLinks();
  }, []);

  const [formState, setFormState] = useState({
    alias: "",
    url: "",
    expiry: "",
    error: "",
    result: "",
    resultClass: "result",
    submitDisabled: false,
  });

  const preview = () => {
    const el = document.getElementById("preview-url");
    if (el) el.textContent = `${baseUrl}/${formState.alias || "······"}`;
  };

  const createLink = async (event: React.FormEvent) => {
    event.preventDefault();
    const originalUrl = document.getElementById("create-url") as HTMLInputElement;
    const aliasInput = document.getElementById("create-alias") as HTMLInputElement;
    const rawExpiry = document.getElementById("create-expiry") as HTMLInputElement;
    const errorEl = document.getElementById("create-error");
    const resultEl = document.getElementById("create-result");
    const submit = document.getElementById("create-submit") as HTMLButtonElement;
    if (!originalUrl || !aliasInput || !rawExpiry || !errorEl || !resultEl || !submit) return;

    errorEl.textContent = "";
    resultEl.textContent = "";
    resultEl.className = "result";

    try {
      const parsed = new URL(originalUrl.value.trim());
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
    } catch {
      errorEl.textContent = "Enter a full http or https URL.";
      return;
    }
    if (aliasInput.value.trim() && !/^[A-Za-z0-9_-]{3,10}$/.test(aliasInput.value.trim())) {
      errorEl.textContent = "An alias is 3 to 10 letters, numbers, hyphens or underscores.";
      return;
    }
    if (!state.token) {
      errorEl.textContent = "Sign in before creating a link.";
      return;
    }

    const expiresAt = toIso(rawExpiry.value);
    submit.disabled = true;
    setFormState((s) => ({ ...s, submitDisabled: true }));

    try {
      const link = await runPipeline("create-pipeline", async () => api.createUrl({
        originalUrl: originalUrl.value.trim(),
        ...(aliasInput.value.trim() ? { customAlias: aliasInput.value.trim() } : {}),
        ...(expiresAt ? { expiresAt } : {}),
      }, state.token as string));
      resultEl.className = "result form-success";
      resultEl.textContent = `Created ${shortUrlOf(link as any, baseUrl)}`;
      (document.getElementById("create-form") as HTMLFormElement)?.reset();
      setFormState((s) => ({ ...s, alias: "", url: "", expiry: "", error: "", result: "", resultClass: "result", submitDisabled: false }));
      preview();
      setRefreshKey((k) => k + 1);
    } catch (failure: any) {
      errorEl.textContent = failure.message;
      setFormState((s) => ({ ...s, submitDisabled: false, error: failure.message }));
    } finally {
      submit.disabled = false;
      setFormState((s) => ({ ...s, submitDisabled: false }));
    }
  };

  const copyLink = async (id: string) => {
    const link = state.links.find((entry: any) => entry.id === id);
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

  const openEdit = (id: string) => {
    const link = state.links.find((entry: any) => entry.id === id);
    if (!link) return;
    state.editingId = id;
    const editUrl = document.getElementById("edit-url") as HTMLInputElement;
    const editExpiry = document.getElementById("edit-expiry") as HTMLInputElement;
    const editError = document.getElementById("edit-error");
    const editDialog = document.getElementById("edit-dialog") as HTMLDialogElement | null;
    if (!editUrl || !editExpiry || !editError || !editDialog) return;
    editUrl.value = link.originalUrl;
    editExpiry.value = toLocalInput(link.expiresAt);
    editError.textContent = "";
    editDialog.showModal();
  };

  const openDelete = (id: string) => {
    const link = state.links.find((entry: any) => entry.id === id);
    if (!link) return;
    state.deletingId = id;
    const deleteCopy = document.getElementById("delete-copy");
    const deleteDialog = document.getElementById("delete-dialog") as HTMLDialogElement | null;
    if (!deleteCopy || !deleteDialog) return;
    deleteCopy.textContent = `Delete ${link.shortCode}? The record is soft-deleted and the short code stays reserved.`;
    deleteDialog.showModal();
  };

  const saveEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    const link = state.links.find((entry: any) => entry.id === state.editingId);
    if (!link) return;
    const editUrl = document.getElementById("edit-url") as HTMLInputElement;
    const editExpiry = document.getElementById("edit-expiry") as HTMLInputElement;
    const editError = document.getElementById("edit-error");
    const editDialog = document.getElementById("edit-dialog") as HTMLDialogElement | null;
    if (!editUrl || !editExpiry || !editError || !editDialog) return;

    const originalUrl = editUrl.value.trim();
    try {
      const parsed = new URL(originalUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
    } catch {
      editError.textContent = "Enter a full http or https URL.";
      return;
    }
    try {
      const expiresAt = toIso(editExpiry.value);
      const updated = await api.updateUrl(link.id, { originalUrl, expiresAt }, state.token as string);
      Object.assign(link, updated);
      editDialog.close();
      setRefreshKey((k) => k + 1);
    } catch (error: any) {
      editError.textContent = error.message;
    }
  };

  const confirmDelete = async () => {
    const link = state.links.find((entry: any) => entry.id === state.deletingId);
    if (!link) return;
    try {
      await api.deleteUrl(link.id, state.token as string);
      state.links = state.links.filter((entry: any) => entry.id !== link.id);
      const deleteDialog = document.getElementById("delete-dialog") as HTMLDialogElement | null;
      if (deleteDialog) deleteDialog.close();
      location.hash = "#/links";
      setRefreshKey((k) => k + 1);
    } catch (error: any) {
      const deleteCopy = document.getElementById("delete-copy");
      if (deleteCopy) deleteCopy.textContent = error.message;
    }
  };

  const authenticate = async (event: React.FormEvent) => {
    event.preventDefault();
    const signup = state.route === "signup";
    const email = document.getElementById("auth-email") as HTMLInputElement;
    const password = document.getElementById("auth-password") as HTMLInputElement;
    const name = document.getElementById("auth-name") as HTMLInputElement;
    const error = document.getElementById("auth-error");
    if (!email || !password || !name || !error) return;

    error.textContent = "";
    if (!email.value.trim() || password.value.length < 8 || (signup && !name.value.trim())) {
      error.textContent = "Enter an email, a password of at least 8 characters" + (signup ? " and a name." : ".");
      return;
    }
    try {
      const payload = signup
        ? await api.signup({ name: name.value.trim(), email: email.value.trim(), password: password.value })
        : await api.login({ email: email.value.trim(), password: password.value });
      saveSession(payload as any);
      location.hash = "#/overview";
      await loadLinks();
    } catch (failure: any) {
      error.textContent = failure.message;
    }
  };

  async function refreshHealth() {
    const status = document.getElementById("health-status");
    const metrics = document.getElementById("metrics-wrap");
    if (!status || !metrics) return;
    status.innerHTML = `<div class="status-row"><span class="status-label">API</span><span>Checking…</span></div>`;
    metrics.innerHTML = `<div class="empty">Reading /metrics…</div>`;
    try {
      const [healthResponse, text] = await Promise.all([
        fetch("/health").then((r) => r.json().catch(() => null)),
        api.metrics(),
      ]);
      status.innerHTML = `
        <div class="status-row"><span class="status-label">API</span><span class="pill pos">Reachable</span></div>
        <div class="status-row"><span class="status-label">Status</span><span>${escapeHtml((healthResponse as any)?.status || "-")}</span></div>
        <div class="status-row"><span class="status-label">Checked</span><span>${formatTime()}</span></div>`;
      metrics.innerHTML = `<pre class="metrics">${escapeHtml(text || "No metrics returned.")}</pre>`;
    } catch (error: any) {
      status.innerHTML = `<div class="status-row"><span class="status-label">API</span><span class="pill neg">Unreachable</span></div><div class="status-row"><span class="status-label">Error</span><span>${escapeHtml(error.message)}</span></div>`;
      metrics.innerHTML = `<div class="empty">Could not read /metrics.<span class="hint">${escapeHtml(error.message)}</span></div>`;
    }
  }

  const handleGlobalClick = async (event: MouseEvent) => {
    const action = (event.target as Element).closest("[data-action]") as HTMLElement | null;
    if (!action) return;
    const id = action.dataset.id;
    switch (action.dataset.action) {
      case "connection": await checkConnection(); break;
      case "signout":
        clearSession();
        state.links = [];
        location.hash = "#/signin";
        setRefreshKey((k) => k + 1);
        break;
      case "auth-switch":
        location.hash = state.route === "signup" ? "#/signin" : "#/signup";
        break;
      case "health-refresh": await refreshHealth(); break;
      case "new-link": {
        location.hash = "#/overview";
        const createUrl = document.getElementById("create-url") as HTMLInputElement;
        createUrl?.focus();
        break;
      }
      case "copy": await copyLink(id as string); break;
      case "edit": openEdit(id as string); break;
      case "delete": openDelete(id as string); break;
      case "confirm-delete": await confirmDelete(); break;
      case "close-dialog": action.closest("dialog")?.close(); break;
      case "open-original": window.open(action.dataset.url as string, "_blank", "noreferrer"); break;
      case "menu": {
        const open = !sidebarOpen;
        setSidebarOpen(open);
        action.setAttribute("aria-expanded", String(open));
        action.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
        break;
      }
      default: break;
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleGlobalClick);
    document.addEventListener("click", (event) => {
      if ((event.target as Element)?.closest("[data-nav]")) {
        setSidebarOpen(false);
        const menu = document.querySelector(".menu-toggle") as HTMLElement;
        menu?.setAttribute("aria-expanded", "false");
      }
    });
    document.querySelectorAll("dialog").forEach((dialog) => {
      dialog.addEventListener("click", (event) => {
        if (event.target === dialog) dialog.close();
      });
    });
    const editForm = document.getElementById("edit-form");
    if (editForm) editForm.addEventListener("submit", (e) => saveEdit(e as unknown as React.FormEvent));
    const authForm = document.getElementById("auth-form");
    if (authForm) authForm.addEventListener("submit", (e) => authenticate(e as unknown as React.FormEvent));
    const createForm = document.getElementById("create-form");
    if (createForm) createForm.addEventListener("submit", (e) => createLink(e as unknown as React.FormEvent));
    ["create-url", "create-alias", "create-expiry"].forEach((selector) => {
      const el = document.getElementById(selector);
      el?.addEventListener("input", preview);
    });
    preview();
    return () => {
      document.removeEventListener("click", handleGlobalClick);
    };
  }, [refreshKey]);

  const ctx = {
    state,
    baseUrl,
    counts,
    refreshView: () => setRefreshKey((k) => k + 1),
    mountCreateForm: () => preview(),
    mountAuthForm: () => {},
    refreshHealth,
  };

  const view = ViewComponent ? <ViewComponent {...ctx} key={refreshKey} /> : null;

  if (isPublic) {
    return (
      <div className="public-app">
        <PublicHeader />
        <main id="view" className={route.view === "landing" ? "" : "public-main"}>{view}</main>
        <Dialogs />
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar
        active={route.view === "detail" ? "links" : route.view}
        userName={state.user.name}
        userEmail={state.user.email}
        onSignout={() => {
          clearSession();
          state.links = [];
          location.hash = "#/signin";
          setRefreshKey((k) => k + 1);
        }}
        signoutHidden={!isAuthed()}
      />
      <div className="canvas min-w-0">
        <Topbar
          title={route.title}
          connectionLabel={state.apiOnline ? "API online" : "API offline"}
          connectionTitle={state.apiOnline
            ? `GET /health: ${state.apiStatus}`
            : "Start the API to check service health"}
          apiOnline={state.apiOnline}
          scopeLabel={state.apiOnline ? "api online" : "offline"}
          scopeDotBg={state.apiOnline ? "var(--accent)" : "var(--control)"}
          onConnection={checkConnection}
          onMenu={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main id="view">{view}</main>
      </div>
      <Dialogs />
    </div>
  );
}
