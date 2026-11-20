export const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  }).format(date);
};

export const formatTime = (value = new Date()) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).format(value);

export const toLocalInput = (value) =>
  value ? new Date(value).toISOString().slice(0, 16) : "";

export const toIso = (value) =>
  value ? new Date(value).toISOString() : null;

export const statusOf = (link) => {
  if (!link.isActive) return "inactive";
  if (link.expiresAt && new Date(link.expiresAt) <= new Date()) return "expired";
  return "active";
};

export const shortUrlOf = (link, baseUrl) =>
  link.shortUrl || `${baseUrl}/${link.shortCode}`;

export const sortLinks = (links, sort) => {
  const sorters = {
    newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    code: (a, b) => a.shortCode.localeCompare(b.shortCode),
  };
  return [...links].sort(sorters[sort] || sorters.newest);
};
