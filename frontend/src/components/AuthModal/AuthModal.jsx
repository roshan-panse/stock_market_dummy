import { useState, useEffect } from "react";
import "./AuthModal.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { authApi } from "../../services/authApi.js";

export default function AuthModal() {
  const { authModal, openAuth, closeAuth, signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setError("");
  }, [authModal]);

  useEffect(() => {
    if (!authModal) return;
    const onKey = (e) => e.key === "Escape" && closeAuth();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [authModal, closeAuth]);

  if (!authModal) return null;
  const isLogin = authModal === "login";
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!isLogin && form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const user = isLogin ? await authApi.login(form) : await authApi.register(form);
      signIn(user);
      navigate("/dashboard");
    } catch {
      setError("Could not continue. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={closeAuth}>
      <div className="modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={closeAuth} aria-label="Close">×</button>
        <h2>{isLogin ? "Log in" : "Create your account"}</h2>
        <p className="muted">
          {isLogin ? "Welcome back. Pick up where you left off." : "Start with virtual cash. No real money involved."}
        </p>

        <form onSubmit={submit} className="form">
          {!isLogin && (
            <label>
              Username
              <input required value={form.username} onChange={set("username")} autoComplete="username" />
            </label>
          )}
          <label>
            {isLogin ? "Email or username" : "Email"}
            <input required type={isLogin ? "text" : "email"} value={form.email} onChange={set("email")} />
          </label>
          <label>
            Password
            <input required type="password" value={form.password} onChange={set("password")} />
          </label>
          {!isLogin && (
            <label>
              Confirm password
              <input required type="password" value={form.confirm} onChange={set("confirm")} />
            </label>
          )}
          {error && <p className="form-error">{error}</p>}
          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? "Please wait..." : isLogin ? "Log in" : "Create account"}
          </button>
        </form>

        <p className="modal-switch muted">
          {isLogin ? "New here? " : "Already have an account? "}
          <button className="link" onClick={() => openAuth(isLogin ? "signup" : "login")}>
            {isLogin ? "Create an account" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}
