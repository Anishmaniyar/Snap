export const escapeHtml = (value: unknown) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char as keyof typeof map]);

const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export const $ = (selector: string, scope: Document | Element = document) => scope.querySelector(selector);
export const $$ = (selector: string, scope: Document | Element = document) => Array.from(scope.querySelectorAll(selector));

export const setText = (selector: string, value: string, scope: Document | Element = document) => {
  const node = $(selector, scope);
  if (node) node.textContent = value;
};

export const setHtml = (selector: string, value: string, scope: Document | Element = document) => {
  const node = $(selector, scope);
  if (node) node.innerHTML = value;
};
