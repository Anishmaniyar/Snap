# Console (apps/web)

A component-based browser console for the Snap API. Plain HTML, CSS and ES modules, no build step
and no frontend dependencies.

## Run

```bash
pnpm web          # http://localhost:5173
pnpm dev          # API on http://localhost:8000, needed for live mode
```

Or bring up everything with `docker compose up`, then open `http://localhost:5173`. The `web`
service proxies `/api`, `/health` and `/metrics` to `http://api:8000` inside Compose, so the browser
needs no CORS configuration. Locally the proxy target is `http://localhost:8000`; override it with
`API_TARGET=... pnpm web`.

## Folder structure

```
apps/web/
  index.html                  minimal shell, loads styles and the entry module
  server.mjs                  static server plus API proxy
  src/
    main.js                   entry point
    app.js                    routing, state wiring, all user actions
    state.js                  shared state, session tokens, mode
    lib/
      api.js                  fetch layer for auth, URLs, health, metrics
      dom.js                  selector and escaping helpers
      format.js               dates, status, sorting
    components/
      shell.js                app frame
      sidebar.js  topbar.js   navigation and connection state
      panel.js  kpi-strip.js  layout primitives
      link-form.js  link-table.js  status-pill.js
      request-pipeline.js      the request-path diagram and its animation
      dialogs.js              edit and delete dialogs
    views/
      overview.js  links.js  detail.js  flow.js  health.js  signin.js
    data/sample.js            sample records and assertions
    styles/
      tokens.css  base.css  shell.css  components.css  views.css
      responsive.css  index.css
```

Each component is a function returning an HTML string. Each view exports `title`, `render(ctx)` and
an optional `mount(ctx)`; `app.js` swaps the view inside `#view`, updates the chrome and delegates
button actions through `data-action`.

## Connection to the backend

- On boot the console calls `GET /health`. The top bar shows `api online` or `local`.
- **Sample mode** (default) uses six local records. Nothing is sent over the network.
- **Live mode** signs in or signs up through `/api/v1/auth/*`, stores the tokens in `sessionStorage`,
  and sends them as `Authorization: Bearer` on every URL request.
- Create, edit, delete and list all call the real API in live mode. Health and metrics read the real
  endpoints. Errors from the API are shown in the form or block that caused them.
- Refresh token and logout behave exactly as the API implements them: logout clears local tokens,
  and there is no refresh endpoint.

## Views

| View | What it shows |
| --- | --- |
| Overview | KPIs, create form with live preview and animated request path, recent links, redirect path |
| Links | All / Active / Expired tabs, search, sort, full table, copy / edit / delete actions |
| Detail | One record, identifiers and dates, edit and soft-delete actions |
| Flow | Both request pipelines, route table, data model and observability hooks |
| Health | Live `/health` result and raw `/metrics` text |
| Sign in | Sign in / sign up forms calling `/api/v1/auth/*` in live mode |

## Design direction

`design-taste-frontend` app-screen run, style `true-black-flat` (seed `1237121894`). Elevation is a
lightness step only, the accent appears on data and status only, and the primary control is inverted
white. The request-path pipeline is the product-specific element. `lint.mjs --app` reports 0 FAIL and
0 WARN; `inspect.mjs --app` reports 0 FAIL on every view, with minor layout warnings on Flow, Health
and Sign in (ragged panel heights and an intentional empty block where live data appears).
