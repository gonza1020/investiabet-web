"use client";

import { login, register } from "@/lib/api/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [loginMsg, setLoginMsg] = useState("");
  const [registerMsg, setRegisterMsg] = useState("");

  const [lEmail, setLEmail] = useState("");
  const [lPass, setLPass] = useState("");
  const [rEmail, setREmail] = useState("");
  const [rUser, setRUser] = useState("");
  const [rPass, setRPass] = useState("");
  const [rCode, setRCode] = useState("");

  const redirectAfterLogin = (plan?: string) => {
    const from = searchParams.get("from");
    if (plan === "admin") {
      router.push("/admin");
    } else if (from && from !== "/login") {
      router.push(from);
    } else {
      router.push("/");
    }
  };

  const doLogin = async () => {
    setLoading(true);
    setLoginMsg("");
    try {
      const d = await login(lEmail, lPass);
      if (d.ok) {
        redirectAfterLogin(d.plan);
      } else {
        setLoginMsg(d.error || "Email o contraseña incorrectos");
      }
    } catch {
      setLoginMsg("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const doRegister = async () => {
    setLoading(true);
    setRegisterMsg("");
    try {
      const d = await register({
        email: rEmail,
        username: rUser,
        password: rPass,
        code: rCode,
      });
      if (d.ok) {
        setRegisterMsg("ok");
        window.setTimeout(() => setTab("login"), 2000);
      } else {
        setRegisterMsg(d.error || "Error al registrar");
      }
    } catch {
      setRegisterMsg("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-card">
      <div className="login-logo">
        <span className="login-logo-icon">📈</span>
        <div className="login-logo-title">InvestiaBet</div>
        <div className="login-logo-sub">Picks deportivos con análisis de valor</div>
      </div>
      <div className="login-tabs">
        <button
          type="button"
          className={`login-tab${tab === "login" ? " active" : ""}`}
          onClick={() => setTab("login")}
        >
          Ingresar
        </button>
        <button
          type="button"
          className={`login-tab${tab === "register" ? " active" : ""}`}
          onClick={() => setTab("register")}
        >
          Registrarse
        </button>
      </div>

      {tab === "login" ? (
        <div>
          <div className="login-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              value={lEmail}
              onChange={(e) => setLEmail(e.target.value)}
            />
          </div>
          <div className="login-field">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={lPass}
              onChange={(e) => setLPass(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doLogin()}
            />
          </div>
          <button type="button" className="login-btn" disabled={loading} onClick={doLogin}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
          {loginMsg && <div className="login-msg login-msg-err">{loginMsg}</div>}
        </div>
      ) : (
        <div>
          <div className="login-plan-info">
            El registro es <strong>solo con invitación</strong>. Pedile el código al admin para
            crear tu cuenta.
          </div>
          <div className="login-field">
            <label>Email</label>
            <input type="email" placeholder="tu@email.com" value={rEmail} onChange={(e) => setREmail(e.target.value)} />
          </div>
          <div className="login-field">
            <label>Usuario</label>
            <input type="text" placeholder="nombre de usuario" value={rUser} onChange={(e) => setRUser(e.target.value)} />
          </div>
          <div className="login-field">
            <label>Contraseña</label>
            <input type="password" placeholder="mínimo 6 caracteres" value={rPass} onChange={(e) => setRPass(e.target.value)} />
          </div>
          <div className="login-field">
            <label>Código de invitación</label>
            <input
              type="text"
              placeholder="XXXXXXXX"
              style={{ textTransform: "uppercase" }}
              value={rCode}
              onChange={(e) => setRCode(e.target.value.toUpperCase())}
            />
          </div>
          <button type="button" className="login-btn" disabled={loading} onClick={doRegister}>
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
          {registerMsg && (
            <div className={`login-msg ${registerMsg === "ok" ? "login-msg-ok" : "login-msg-err"}`}>
              {registerMsg === "ok"
                ? "Cuenta creada. Iniciá sesión con tu email y contraseña."
                : registerMsg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="login-page">
      <Suspense fallback={<div className="login-card">Cargando…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
