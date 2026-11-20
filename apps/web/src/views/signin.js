import { panel } from "../components/panel.js";

export const title = "Sign in";

export const render = (ctx) => {
  const signup = ctx.state.route === "signup";
  return `
    <div class="title-row">
      <div>
        <h1>Sign in</h1>
        <p class="sub">The write endpoints need a Bearer access token from POST /api/v1/auth/login.</p>
      </div>
    </div>
    <div class="grid top">
      ${panel({
        classes: "span-6",
        title: signup ? "Create an account" : "Access your workspace",
        meta: "/api/v1/auth",
        body: `<form id="auth-form" novalidate>
          <div class="form-grid">
            <div class="field wide" id="auth-name-field" ${signup ? "" : "hidden"}>
              <label for="auth-name">Name</label>
              <input class="input" id="auth-name" type="text" autocomplete="name">
            </div>
            <div class="field wide">
              <label for="auth-email">Email</label>
              <input class="input" id="auth-email" type="email" required autocomplete="email">
            </div>
            <div class="field wide">
              <label for="auth-password">Password</label>
              <input class="input" id="auth-password" type="password" required minlength="8" autocomplete="current-password">
            </div>
          </div>
          <p class="form-error" id="auth-error" role="alert"></p>
          <div class="form-actions">
            <button class="btn primary" type="submit" id="auth-submit">${signup ? "Sign up" : "Sign in"}</button>
            <button class="btn ghost" type="button" data-action="auth-switch">${signup ? "Have an account? Sign in" : "Need an account? Sign up"}</button>
          </div>
        </form>`,
      })}
      ${panel({
        classes: "span-6",
        title: "How auth works here",
        meta: "stateless JWT",
        body: `<dl class="defs">
          <dt>Access token</dt><dd>Valid for 15 minutes, sent as Bearer on every /urls request.</dd>
          <dt>Refresh token</dt><dd>Valid for 7 days. The API issues it, but has no refresh endpoint yet.</dd>
          <dt>Logout</dt><dd>Returns 200 and a message. The client discards its tokens.</dd>
          <dt>Passwords</dt><dd>bcrypt hash at cost 10. The login error is generic for every failure.</dd>
        </dl>
        <p class="meta" style="margin-top:16px">Switch to the live API to exercise these endpoints. Sample mode never sends a request.</p>`,
      })}
    </div>`;
};

export const mount = (ctx) => ctx.mountAuthForm();
