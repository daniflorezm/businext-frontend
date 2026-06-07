"use client";

import { login, signup } from "@/app/login/actions";
import { useRef, useState } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";

// ── Shared token styles ──────────────────────────────────────────────────────
const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  padding: "13px 16px",
  color: "#f8fafc",
  fontSize: "0.95rem",
  outline: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
};

const LABEL_STYLE: React.CSSProperties = {
  display: "block",
  marginBottom: 6,
  color: "rgba(255,255,255,0.55)",
  fontSize: "0.78rem",
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

const ERROR_STYLE: React.CSSProperties = {
  background: "rgba(239,68,68,0.10)",
  border: "1px solid rgba(239,68,68,0.25)",
  borderRadius: 8,
  padding: "10px 14px",
  color: "#fca5a5",
  fontSize: "0.82rem",
  textAlign: "center",
};

const SUCCESS_STYLE: React.CSSProperties = {
  background: "rgba(34,197,94,0.10)",
  border: "1px solid rgba(34,197,94,0.25)",
  borderRadius: 8,
  padding: "10px 14px",
  color: "#86efac",
  fontSize: "0.82rem",
  textAlign: "center",
};

export default function LoginPage() {
  const [loginState,  loginAction,  loginPending]  = useActionState(login,  { error: "" });
  const [signupState, signupAction, signupPending] = useActionState(signup, { error: "" });
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryState, setRecoveryState] = useState<{ error?: string; success?: string }>({});
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const recoveryEmailRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const formLoading = mode === "login" ? loginPending : signupPending;

  const handleSubmitAction = async (formData: FormData) => {
    if (mode === "login") await loginAction(formData);
    else await signupAction(formData);
  };

  async function handleRecovery(e: React.FormEvent) {
    e.preventDefault();
    setRecoveryLoading(true);
    setRecoveryState({});
    const email = recoveryEmailRef.current?.value.trim();
    if (!email) { setRecoveryState({ error: "Ingresa tu email" }); setRecoveryLoading(false); return; }
    try {
      const res  = await fetch("/api/recover-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (data.error) setRecoveryState({ error: data.error });
      else setRecoveryState({ success: "¡Correo enviado! Revisa tu bandeja de entrada." });
    } catch {
      setRecoveryState({ error: "Error de red. Intenta de nuevo." });
    } finally {
      setRecoveryLoading(false);
    }
  }

  const inputStyle = (name: string): React.CSSProperties => ({
    ...INPUT_STYLE,
    borderColor: focusedField === name ? "rgba(99,102,241,0.70)" : "rgba(255,255,255,0.12)",
    boxShadow: focusedField === name ? "0 0 0 3px rgba(99,102,241,0.15)" : "none",
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "#07080f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Ambient glow */}
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 400, background: "radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "10%", width: 300, height: 300, background: "radial-gradient(ellipse, rgba(167,139,250,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Card */}
      <div style={{
        position: "relative",
        zIndex: 1,
        width: "100%",
        maxWidth: 440,
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(40px) saturate(200%) brightness(1.15)",
        WebkitBackdropFilter: "blur(40px) saturate(200%) brightness(1.15)",
        borderRadius: 24,
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 8px 48px rgba(0,0,0,0.55), inset 0 1.5px 0 rgba(255,255,255,0.12)",
        padding: "clamp(32px,7vw,52px) clamp(24px,6vw,44px)",
      }}>

        {/* Back button */}
        <button
          type="button"
          onClick={() => router.push("/")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 8,
            padding: "7px 14px",
            color: "rgba(255,255,255,0.55)",
            fontSize: "0.78rem",
            fontWeight: 600,
            letterSpacing: "0.04em",
            cursor: "pointer",
            marginBottom: 28,
            transition: "color 0.2s, border-color 0.2s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#f8fafc"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.25)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.55)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.10)"; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Volver
        </button>

        {/* Headline */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ margin: "0 0 10px", color: "#a78bfa", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" }}>
            Businext
          </p>
          <h1 style={{
            margin: 0,
            fontFamily: "var(--font-heading), system-ui, sans-serif",
            fontSize: "clamp(1.9rem, 7vw, 2.6rem)",
            fontWeight: 800,
            lineHeight: 1.0,
            letterSpacing: "-0.03em",
            color: "#f8fafc",
          }}>
            {mode === "login" ? (
              <>Bienvenido<br /><span style={{ background: "linear-gradient(to right, #3b82f6, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>de vuelta.</span></>
            ) : (
              <>Crea tu<br /><span style={{ background: "linear-gradient(to right, #3b82f6, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>cuenta.</span></>
            )}
          </h1>
        </div>

        {/* Recovery panel */}
        {showRecovery && (
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 14, padding: "20px", marginBottom: 24, display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ margin: 0, color: "#f8fafc", fontSize: "0.9rem", fontWeight: 700 }}>Recuperar contraseña</p>
            {recoveryState.error   && <div style={ERROR_STYLE}>{recoveryState.error}</div>}
            {recoveryState.success && <div style={SUCCESS_STYLE}>{recoveryState.success}</div>}
            <input
              ref={recoveryEmailRef}
              type="email"
              placeholder="Tu correo electrónico"
              style={inputStyle("recovery")}
              onFocus={() => setFocusedField("recovery")}
              onBlur={() => setFocusedField(null)}
            />
            <button
              type="button"
              onClick={handleRecovery}
              disabled={recoveryLoading}
              style={{ background: "linear-gradient(135deg, #3b82f6, #a78bfa)", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontWeight: 700, fontSize: "0.9rem", cursor: recoveryLoading ? "not-allowed" : "pointer", opacity: recoveryLoading ? 0.7 : 1 }}
            >
              {recoveryLoading ? "Enviando..." : "Enviar correo de recuperación"}
            </button>
            <button type="button" onClick={() => setShowRecovery(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.45)", fontSize: "0.78rem", cursor: "pointer", textDecoration: "underline" }}>
              Cerrar
            </button>
          </div>
        )}

        {/* Form errors */}
        {mode === "login"  && loginState?.error  && <div style={{ ...ERROR_STYLE, marginBottom: 16 }}>{loginState.error}</div>}
        {mode === "signup" && signupState?.error  && <div style={{ ...ERROR_STYLE, marginBottom: 16 }}>{signupState.error}</div>}

        {/* Form */}
        <form style={{ display: "flex", flexDirection: "column", gap: 18 }} action={handleSubmitAction}>

          <div>
            <label htmlFor="email" style={LABEL_STYLE}>Email</label>
            <input
              id="email" name="email" type="email" required
              placeholder="tucorreo@ejemplo.com"
              autoComplete="email"
              style={inputStyle("email")}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
            />
          </div>

          <div>
            <label htmlFor="password" style={LABEL_STYLE}>Contraseña</label>
            <input
              id="password" name="password" type="password" required
              placeholder="••••••••"
              autoComplete="current-password"
              style={inputStyle("password")}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
            />
            {mode === "login" && !showRecovery && (
              <button
                type="button"
                onClick={() => setShowRecovery(true)}
                style={{ background: "none", border: "none", color: "#818cf8", fontSize: "0.78rem", cursor: "pointer", marginTop: 8, padding: 0, float: "right" }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </div>

          {mode === "signup" && (
            <div>
              <label htmlFor="fullName" style={LABEL_STYLE}>Nombre completo</label>
              <input
                id="fullName" name="fullName" type="text" required
                placeholder="Tu nombre completo"
                autoComplete="name"
                style={inputStyle("fullName")}
                onFocus={() => setFocusedField("fullName")}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={formLoading}
            style={{
              width: "100%",
              marginTop: 6,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              background: formLoading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #3b82f6, #a78bfa)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "15px 32px",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: formLoading ? "not-allowed" : "pointer",
              letterSpacing: "0.02em",
              boxShadow: formLoading ? "none" : "0 4px 32px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.20)",
              transition: "opacity 0.2s, box-shadow 0.2s",
            }}
          >
            {formLoading
              ? (mode === "login" ? "Iniciando..." : "Creando...")
              : (mode === "login" ? "Iniciar sesión" : "Crear cuenta")}
            {!formLoading && (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            )}
          </button>
        </form>

        {/* Mode toggle */}
        <p style={{ margin: "24px 0 0", textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: "0.82rem" }}>
          {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            style={{ background: "none", border: "none", color: "#818cf8", fontWeight: 600, cursor: "pointer", padding: 0, fontSize: "inherit" }}
          >
            {mode === "login" ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>

      </div>
    </div>
  );
}
