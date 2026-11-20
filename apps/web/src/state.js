import { sample } from "./data/sample.js";
import { statusOf } from "./lib/format.js";

export const state = {
  mode: (() => {
    const saved = sessionStorage.getItem("snap-mode");
    return !saved || saved === "demo" ? "sample" : saved;
  })(),
  token: sessionStorage.getItem("snap-access"),
  refresh: sessionStorage.getItem("snap-refresh"),
  apiOnline: false,
  apiStatus: "unknown",
  links: sample.links.map((link) => ({ ...link })),
  user: { name: "Sample workspace", email: "local console" },
  filter: "all",
  search: "",
  sort: "newest",
  route: "overview",
  detailId: null,
  editingId: null,
  deletingId: null,
};

export const baseUrl = sample.baseUrl;

export const useSample = () => {
  state.links = sample.links.map((link) => ({ ...link }));
  state.user = { name: "Sample workspace", email: "local console" };
};

export const counts = () => ({
  total: state.links.length,
  active: state.links.filter((link) => statusOf(link) === "active").length,
  expired: state.links.filter((link) => statusOf(link) === "expired").length,
});

export const saveSession = (data) => {
  state.token = data.accessToken;
  state.refresh = data.refreshToken;
  sessionStorage.setItem("snap-access", data.accessToken);
  sessionStorage.setItem("snap-refresh", data.refreshToken || "");
  state.user = data.user || { name: "Live workspace", email: "signed in" };
};

export const clearSession = () => {
  state.token = null;
  state.refresh = null;
  sessionStorage.removeItem("snap-access");
  sessionStorage.removeItem("snap-refresh");
};

export const setMode = (mode) => {
  state.mode = mode;
  sessionStorage.setItem("snap-mode", mode);
};
