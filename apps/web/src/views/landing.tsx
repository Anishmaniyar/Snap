"use client";

import { useState } from "react";
import { Pipeline, CREATE_STEPS, REDIRECT_STEPS, RunPipeline as runPipeline } from "@/components/request-pipeline";

const SHORT_HOST = process.env.NEXT_PUBLIC_SHORT_HOST || "snap.in";

const ROUTES = [
  ["POST", "/auth/signup", "Public", "201"],
  ["POST", "/auth/login", "Public", "200"],
  ["POST", "/auth/logout", "Public", "200"],
  ["POST", "/urls", "Bearer", "201"],
  ["GET", "/urls", "Bearer", "200"],
  ["GET", "/urls/:id", "Bearer", "200"],
  ["PATCH", "/urls/:id", "Bearer", "200"],
  ["DELETE", "/urls/:id", "Bearer", "204"],
];

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const makeCode = () => Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");

export default function Landing() {
  const [destination, setDestination] = useState("https://nodejs.org/en/learn");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);

  const run = async () => {
    let parsed: URL;
    try {
      parsed = new URL(destination.trim());
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
    } catch {
      setError("Enter a full http or https URL.");
      return;
    }
    setError("");
    setCode("");
    setRunning(true);
    await runPipeline("landing-create", async () => {
      await new Promise((resolve) => setTimeout(resolve, 160));
      setCode(makeCode());
    });
    setRunning(false);
  };

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-copy">
          <h1>Short links.<br />Clear paths.</h1>
          <p className="hero-sub">
            Snap shortens a long URL and shows the exact path every request takes &mdash; from the first click to the redirect.
          </p>
          <div className="hero-actions">
            <a href="#/signin" className="btn primary">Create a short link</a>
            <a href="#/flow" className="btn ghost">See how it works</a>
          </div>
          <p className="hero-foot">No sample data. Real API, real links, real request logs.</p>
        </div>

        <div className="hero-demo" data-ui>
          <div className="demo-panel">
            <div className="demo-head">
              <span>Try the request path</span>
              <span className="demo-tag">live demo</span>
            </div>
            <label className="demo-label" htmlFor="demo-url">Destination URL</label>
            <input
              id="demo-url"
              className="input"
              type="url"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="https://developer.mozilla.org/en-US/docs/Web/HTTP"
            />
            <button className="btn primary demo-run" type="button" onClick={run} disabled={running}>
              {running ? "Running…" : "Run the request"}
            </button>
            <p className="demo-error" role="alert">{error}</p>
            <div className="demo-result">
              <span>Short link</span>
              <strong>{SHORT_HOST}/{code || "······"}</strong>
            </div>
            <div className="demo-pipeline">
              <Pipeline steps={CREATE_STEPS} id="landing-create" />
            </div>
          </div>
        </div>
      </section>

      <section className="land-section" id="paths">
        <div className="land-head">
          <h2>One router, two paths</h2>
          <p>Every request passes through the same Express stack. Creating a link authenticates and writes; following one checks state and redirects.</p>
        </div>
        <div className="flow-lanes">
          <div className="flow-lane">
            <h3>Create a link</h3>
            <p className="lane-sub">An authenticated write that ends in a stored record.</p>
            <Pipeline steps={CREATE_STEPS} id="landing-flow-create" />
          </div>
          <div className="flow-lane">
            <h3>Follow a link</h3>
            <p className="lane-sub">A public read that ends in a 302 response.</p>
            <Pipeline steps={REDIRECT_STEPS} id="landing-flow-redirect" />
          </div>
        </div>
      </section>

      <section className="land-section land-surface" id="api">
        <div className="land-head">
          <h2>A small, honest API</h2>
          <p>Eight endpoints under <code>/api/v1</code>. Public auth, Bearer-protected URLs, plus health and metrics for the operators.</p>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Method</th>
                <th scope="col">Path</th>
                <th scope="col">Access</th>
                <th scope="col" className="n">Status</th>
              </tr>
            </thead>
            <tbody>
              {ROUTES.map(([method, path, access, status]) => (
                <tr key={`${method}-${path}`}>
                  <td className="code">{method}</td>
                  <td className="code">{path}</td>
                  <td>{access}</td>
                  <td className="n num">{status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="land-cta" id="start">
        <h2>Make your first link</h2>
        <p>Sign in to create, inspect and manage real short links from your own workspace.</p>
        <div className="hero-actions">
          <a href="#/signup" className="btn primary">Create account</a>
          <a href="#/signin" className="btn">Sign in</a>
        </div>
      </section>

      <footer className="land-footer">
        <span className="pub-brand">
          <svg className="brand-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <rect x="2.5" y="9" width="9" height="6" rx="2.2" />
            <rect x="12.5" y="9" width="9" height="6" rx="2.2" />
            <path d="M11.5 12h1" strokeLinecap="round" />
          </svg>
          <span>snap</span>
        </span>
        <nav aria-label="Footer">
          <a href="#/flow">Flow</a>
          <a href="#/health">Service health</a>
          <a href="#/signin">Sign in</a>
        </nav>
      </footer>
    </div>
  );
}
