export const panel = ({ title, meta = "", action = "", body = "", classes = "" }) => `
  <section class="panel ${classes}">
    <header><h2>${title}</h2>${meta ? `<span class="meta">${meta}</span>` : ""}${action}</header>
    ${body}
  </section>`;
