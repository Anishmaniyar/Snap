"use client";

import { Panel } from "@/components/panel";
import { state } from "@/state";

interface SigninProps {
  state: any;
  mountAuthForm: () => void;
  [key: string]: any;
}

export default function Signin({ state, mountAuthForm }: SigninProps) {
  const signup = state.route === "signup";

  return (
    <div className="space-y-5.5">
      <div className="title-row flex items-end justify-between gap-4 mb-5">
        <div>
          <h1 className="text-title leading-1.25 font-600 tracking-tight">{signup ? "Create your account" : "Welcome back"}</h1>
          <p className="sub mt-1 text-faint">{signup ? "Set up a workspace and start shortening links in seconds." : "Sign in to create, inspect and manage your short links."}</p>
        </div>
      </div>
      <div className="grid grid-cols-[repeat(12,minmax(0,1fr))] gap-3.5 top">
        <Panel classes="span-6" title={signup ? "Create an account" : "Access your workspace"} meta="/api/v1/auth">
          <form id="auth-form" noValidate>
            <div className="form-grid grid grid-cols-[1fr_1fr] gap-3.5">
              <div
                className={`field wide grid gap-2 grid-col-1 grid-row-1 min-w-0 ${signup ? "" : "hidden"}`}
                id="auth-name-field"
              >
                <label htmlFor="auth-name" className="text-body font-500">Name</label>
                <input
                  className="input w-full h-[38px] px-3 border border-control rounded-lg bg-ground text-white"
                  id="auth-name"
                  type="text"
                  autoComplete="name"
                />
              </div>
              <div className="field grid gap-2 min-w-0">
                <label htmlFor="auth-email" className="text-body font-500">Email</label>
                <input
                  className="input w-full h-[38px] px-3 border border-control rounded-lg bg-ground text-white"
                  id="auth-email"
                  type="email"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="field grid gap-2 min-w-0">
                <label htmlFor="auth-password" className="text-body font-500">Password</label>
                <input
                  className="input w-full h-[38px] px-3 border border-control rounded-lg bg-ground text-white"
                  id="auth-password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="current-password"
                />
              </div>
            </div>
            <p className="form-error text-negative text-xs min-h-[18px]" id="auth-error" role="alert"></p>
            <div className="form-actions flex items-center gap-2.5 mt-4.5 flex-wrap">
              <button className="btn primary" type="submit" id="auth-submit">
                {signup ? "Sign up" : "Sign in"}
              </button>
              <button
                className="btn ghost"
                type="button"
                data-action="auth-switch"
              >
                {signup ? "Have an account? Sign in" : "Need an account? Sign up"}
              </button>
            </div>
          </form>
        </Panel>
        <Panel classes="span-6" title="How auth works here" meta="stateless JWT">
          <dl className="defs grid grid-cols-[180px_minmax(0,1fr)] gap-0">
            <div className="border-b border-rule">
              <dt className="p-3 text-muted">Access token</dt>
              <dd className="p-3 min-w-0 break-anywhere text-faint text-xs">Valid for 15 minutes, sent as Bearer on every /urls request.</dd>
            </div>
            <div className="border-b border-rule">
              <dt className="p-3 text-muted">Refresh token</dt>
              <dd className="p-3 min-w-0 break-anywhere text-faint text-xs">Valid for 7 days. The API issues it, but has no refresh endpoint yet.</dd>
            </div>
            <div className="border-b border-rule">
              <dt className="p-3 text-muted">Logout</dt>
              <dd className="p-3 min-w-0 break-anywhere text-faint text-xs">Returns 200 and a message. The client discards its tokens.</dd>
            </div>
            <div className="border-b border-rule">
              <dt className="p-3 text-muted">Passwords</dt>
              <dd className="p-3 min-w-0 break-anywhere text-faint text-xs">bcrypt hash at cost 10. The login error is generic for every failure.</dd>
            </div>
          </dl>

        </Panel>
      </div>
    </div>
  );
}
