const request = async (path: string, options: Record<string, unknown> = {}) => {
  const response = await fetch(path, {
    ...options,
    headers: { "content-type": "application/json", ...(options.headers || {}) },
  });
  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error((payload as { message?: string })?.message || `Request failed with ${response.status}`);
  }
  return payload;
};

export const api = {
  health: async () => {
    const response = await fetch("/health", { signal: AbortSignal.timeout(2500) });
    const body = await response.json().catch(() => null);
    return { ok: response.ok, status: (body as { status?: string })?.status || "unknown" };
  },

  metrics: async () => {
    const response = await fetch("/metrics");
    if (!response.ok) throw new Error(`Metrics failed with ${response.status}`);
    return response.text();
  },

  signup: (body: Record<string, unknown>) => request("/api/v1/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  login: (body: Record<string, unknown>) => request("/api/v1/auth/login", { method: "POST", body: JSON.stringify(body) }),

  listUrls: async (token: string) => {
    const payload = await request("/api/v1/urls", {
      headers: { authorization: `Bearer ${token}` },
    });
    return (payload as { data: unknown[] }).data;
  },

  createUrl: (body: Record<string, unknown>, token: string) => request("/api/v1/urls", {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  }).then((payload: { data: unknown }) => payload.data),

  updateUrl: (id: string, body: Record<string, unknown>, token: string) => request(`/api/v1/urls/${id}`, {
    method: "PATCH",
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  }).then((payload: { data: unknown }) => payload.data),

  deleteUrl: (id: string, token: string) => request(`/api/v1/urls/${id}`, {
    method: "DELETE",
    headers: { authorization: `Bearer ${token}` },
  }),
};
