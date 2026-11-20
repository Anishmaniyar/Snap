export const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);

export const $ = (selector, scope = document) => scope.querySelector(selector);
export const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

export const setText = (selector, value, scope = document) => {
  const node = $(selector, scope);
  if (node) node.textContent = value;
};

export const setHtml = (selector, value, scope = document) => {
  const node = $(selector, scope);
  if (node) node.innerHTML = value;
};

export const withAttrs = (value) => escapeHtml(value);
