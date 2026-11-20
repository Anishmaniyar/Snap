import { sidebar } from "./sidebar.js";
import { topbar } from "./topbar.js";

export const shell = (active, title) => `
  <div class="app">
    ${sidebar(active)}
    <div class="canvas">
      ${topbar(title)}
      <main id="view"></main>
    </div>
  </div>`;
