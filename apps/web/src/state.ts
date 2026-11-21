import { statusOf } from "./lib/format";

export interface Link {
  id: string;
  originalUrl: string;
  shortCode: string;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  shortUrl?: string;
}

export const state = {
  token: typeof sessionStorage !== "undefined" ? sessionStorage.getItem("snap-access") : null,
  refresh: typeof sessionStorage !== "undefined" ? sessionStorage.getItem("snap-refresh") : null,
  apiOnline: false,
  apiStatus: "unknown",
  links: [] as Link[],
  user: { name: "Guest", email: "Not signed in" },
  filter: "all",
  search: "",
  sort: "newest",
  route: "landing",
  detailId: null as string | null,
  editingId: null as string | null,
  deletingId: null as string | null,
};

export const baseUrl = process.env.NEXT_PUBLIC_SHORT_BASE
  || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

export const isAuthed = () => Boolean(state.token);

export const counts = () => ({
  total: state.links.length,
  active: state.links.filter((link: Link) => statusOf(link) === "active").length,
  expired: state.links.filter((link: Link) => statusOf(link) === "expired").length,
});

export const saveSession = (data: { accessToken: string; refreshToken?: string; user?: { name?: string; email?: string } }) => {
  state.token = data.accessToken;
  state.refresh = data.refreshToken || null;
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem("snap-access", data.accessToken);
    sessionStorage.setItem("snap-refresh", data.refreshToken || "");
  }
  state.user = data.user
    ? { name: data.user.name || "Your workspace", email: data.user.email || "signed in" }
    : { name: "Your workspace", email: "signed in" };
};

export const clearSession = () => {
  state.token = null;
  state.refresh = null;
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.removeItem("snap-access");
    sessionStorage.removeItem("snap-refresh");
  }
  state.user = { name: "Guest", email: "Not signed in" };
};
