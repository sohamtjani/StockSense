"use client";

import { useState } from "react";

export default function AuthPanel({ token, onAuth, onLogout }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="glass rounded-2xl p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-blue-100">Account</p>
        {token ? (
          <button onClick={onLogout} className="rounded-lg bg-rose-500/20 px-2 py-1 text-xs font-semibold text-rose-100">Logout</button>
        ) : (
          <div className="space-x-2 text-xs">
            <button onClick={() => setMode("login")} className={`${mode === "login" ? "text-cyan-200" : "text-blue-100/70"}`}>Login</button>
            <button onClick={() => setMode("signup")} className={`${mode === "signup" ? "text-cyan-200" : "text-blue-100/70"}`}>Signup</button>
          </div>
        )}
      </div>
      {!token ? (
        <form onSubmit={(e) => onAuth(e, mode, email, password)} className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-lg border border-blue-100/20 bg-white/10 px-3 py-2 text-sm outline-none"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-lg border border-blue-100/20 bg-white/10 px-3 py-2 text-sm outline-none"
          />
          <button className="w-full rounded-lg bg-cyan-400/90 px-3 py-2 text-sm font-bold text-slate-950">{mode === "login" ? "Login" : "Create account"}</button>
        </form>
      ) : (
        <p className="text-xs text-blue-100/80">Authenticated. You can save stocks to your watchlist.</p>
      )}
    </div>
  );
}
