export const formatDate = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  }).format(date);
};

export const formatTime = (value: Date = new Date()) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).format(value);

export const toLocalInput = (value: string | null | undefined) =>
  value ? new Date(value).toISOString().slice(0, 16) : "";

export const toIso = (value: string | null | undefined) =>
  value ? new Date(value).toISOString() : null;

export const statusOf = (link: { isActive: boolean; expiresAt: string | null }) => {
  if (!link.isActive) return "inactive";
  if (link.expiresAt && new Date(link.expiresAt) <= new Date()) return "expired";
  return "active";
};

export const shortUrlOf = (link: { shortUrl?: string; shortCode: string }, baseUrl: string) =>
  link.shortUrl || `${baseUrl}/${link.shortCode}`;

type SortableLink = { createdAt: string; shortCode: string };

export const sortLinks = <T extends SortableLink>(links: T[], sort: string): T[] => {
  const sorters: Record<string, (a: T, b: T) => number> = {
    newest: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    oldest: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    code: (a, b) => a.shortCode.localeCompare(b.shortCode),
  };
  return [...links].sort(sorters[sort] || sorters.newest);
};
