const BASE_URL = "http://snap.in";

const links = [
  {
    id: "b3f1c2a4-7d90-4e1b-9c42-5a8f0d1e6b03",
    originalUrl: "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs",
    shortCode: "7Kp2Qa",
    expiresAt: null,
    isActive: true,
    createdAt: "2026-11-02T09:14:00.000Z",
  },
  {
    id: "c9a7e513-2b64-4d8f-a137-0f6b2d94e821",
    originalUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array",
    shortCode: "jsarray",
    expiresAt: null,
    isActive: true,
    createdAt: "2026-11-04T14:32:00.000Z",
  },
  {
    id: "d41b8f76-5c03-4a29-8e1d-7b9a2f0c6345",
    originalUrl: "https://expressjs.com/en/guide/using-middleware.html",
    shortCode: "ex5mw",
    expiresAt: null,
    isActive: true,
    createdAt: "2026-11-07T11:05:00.000Z",
  },
  {
    id: "e82c6d19-4f75-4b30-a9d2-1c8e7b5f0a46",
    originalUrl: "https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries",
    shortCode: "prismaq",
    expiresAt: "2026-12-31T23:59:00.000Z",
    isActive: true,
    createdAt: "2026-11-09T16:48:00.000Z",
  },
  {
    id: "f05e9a28-6d14-4c73-8b0a-3e2d7f19c658",
    originalUrl: "https://k6.io/docs/",
    shortCode: "k6load",
    expiresAt: null,
    isActive: true,
    createdAt: "2026-11-12T08:21:00.000Z",
  },
  {
    id: "a17d4c30-8e62-4f95-b2c1-9d0a6e3b7f24",
    originalUrl: "https://prometheus.io/docs/concepts/metric_types/",
    shortCode: "prommet",
    expiresAt: "2026-11-15T00:00:00.000Z",
    isActive: true,
    createdAt: "2026-10-21T13:07:00.000Z",
  },
];

const activeCount = links.filter((link) => link.isActive && (!link.expiresAt || new Date(link.expiresAt) > new Date())).length;
const expiredCount = links.filter((link) => link.isActive && link.expiresAt && new Date(link.expiresAt) <= new Date()).length;

console.assert(links.length === 6, "sample data: six links");
console.assert(activeCount === 5, "sample data: five active links");
console.assert(expiredCount === 1, "sample data: one expired link");
console.assert(new Set(links.map((link) => link.shortCode)).size === links.length, "sample data: short codes are unique");

export const sample = {
  baseUrl: BASE_URL,
  links,
  activeCount,
  expiredCount,
};
