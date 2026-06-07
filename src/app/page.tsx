"use client";
import { VideoScrollHero } from "@/components/landingpage/VideoScrollHero";
import { VideoScrollSection, type ScrollSlide } from "@/components/landingpage/VideoScrollSection";
import Link from "next/link";
import React, { useState } from "react";

// ── Frame path ─────────────────────────────────────────────────────────────
const fullFramePath = (n: number) =>
  `/frames-full/frame${String(n).padStart(4, "0")}.jpg`;

// ── 720 frames / 6 videos → cada video ocupa 1/6 del progreso (~0.167)
// 2 slides por video, distribuidos en el rango de cada sección
const SLIDES_FULL: ScrollSlide[] = [
  // — Inicial (0.000 – 0.167) —
  { line1: "Bienvenido a",  accent: "Businext",      subtitle: "La plataforma que transforma la gestión de tu negocio",   start: -0.02, end: 0.120, noBackground: true },
  { line1: "Reservas",      accent: "sin esfuerzo",  subtitle: "Gestiona cada reserva de tu negocio desde un solo lugar. Sin papel, sin llamadas — de forma rápida y sencilla, cuando y donde quieras.", start: 0.120, end: 0.240 },
  { line1: "Control",       accent: "financiero",    subtitle: "Registra cada movimiento, consulta tu caja del día y toma decisiones con datos reales.",  start: 0.240, end: 0.450 },
  { line1: "Análisis",      accent: "de satisfacción", subtitle: "Extrae reseñas de Google Maps, analiza lo positivo y negativo, y responde automáticamente. Todo en un solo informe.", start: 0.450, end: 0.545 },
  { line1: "Inteligencia",  accent: "artificial",    subtitle: "Un análisis inteligente cada semana. Estadísticas y recomendaciones concretas para elevar la calidad de tu negocio sin esfuerzo.", start: 0.545, end: 0.742 },
  { line1: "Únete a",       accent: "Businext",      subtitle: "Todo lo que necesitas para gestionar tu negocio, en un solo lugar. Tu asesor personal, disponible 24/7.", start: 0.742, end: 0.980 },
];

const FAQS = [
  {
    q: "¿Funciona para mi tipo de negocio?",
    a: "Sí. Businext está diseñado para cualquier negocio con reservas, clientes y caja: peluquerías, centros de estética, clínicas, talleres, gimnasios, consultorías y mucho más. Si gestionas citas o servicios, Businext es para ti.",
  },
  {
    q: "¿Qué incluye exactamente la suscripción?",
    a: "Todo lo que necesitas en un solo lugar: gestión completa de reservas, control financiero en tiempo real, análisis de reseñas de Google Maps con respuestas automáticas e informes semanales con inteligencia artificial. Sin módulos extra ni costes ocultos.",
  },
  {
    q: "¿Mis clientes pueden reservar por su cuenta?",
    a: "Sí. Cada negocio tiene un enlace único y un código QR que puedes compartir o imprimir donde quieras. El cliente entra, elige servicio y horario, y envía su solicitud. Tú recibes un correo al instante y decides si aceptas o rechazas — sin llamadas, sin mensajes de WhatsApp, sin interrupciones.",
  },
  {
    q: "¿Cómo funciona el primer mes gratis?",
    a: "Creas tu cuenta, introduces tu tarjeta para verificar tu identidad y usas Businext al 100% durante 30 días sin ningún cargo. Al terminar el período se activa automáticamente la suscripción de 14,99 €/mes — si no quieres continuar, cancelas antes y no se te cobra nada.",
  },
  {
    q: "¿Puedo cancelar en cualquier momento?",
    a: "Sí, sin preguntas ni penalizaciones. Cancelas con un clic desde tu panel. Tu acceso permanece activo hasta el final del período ya pagado y no se realiza ningún cobro adicional.",
  },
  {
    q: "¿Necesito instalar algo o tener conocimientos técnicos?",
    a: "No. Businext funciona directamente desde el navegador de tu móvil u ordenador. Sin descargas, sin instalaciones y sin configuraciones técnicas. Estarás operativo en menos de 10 minutos.",
  },
  {
    q: "¿Cómo se usa en el día a día?",
    a: "Desde el panel principal ves de un vistazo las reservas del día, el estado de tu caja y los últimos movimientos. Gestiona citas con un par de toques, registra ingresos y gastos al momento, y cada semana recibes un informe automático con lo más importante de tu negocio. Está pensado para usarlo desde el móvil mientras trabajas.",
  },
];

export default function Home() {
  const [openFaq, setOpenFaq]   = useState<number | null>(null);
  const [ctaHovered, setCtaHovered] = useState(false);

  return (
    <main className="w-full bg-background flex flex-col px-0 py-0">
      {/* Section 1: Hero — Video Scroll Experience */}
      <VideoScrollHero />

      {/* Section 2: Video scroll continuo (todos los videos en uno) */}
      <VideoScrollSection framePath={fullFramePath} frameCount={720} slides={SLIDES_FULL} pxPerFrame={5} />

      {/* ── FAQ ───────────────────────────────────────────────────────────────── */}
      <section style={{
        width: "100%",
        background: "#07080f",
        padding: "clamp(72px, 12vw, 120px) clamp(20px, 6vw, 80px)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Ambient glows */}
        <div style={{ position: "absolute", top: "10%", left: "-5%", width: 500, height: 500, background: "radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "-5%", width: 400, height: 400, background: "radial-gradient(ellipse, rgba(167,139,250,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative", zIndex: 1 }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "clamp(40px, 6vw, 64px)" }}>
            <p style={{ margin: "0 0 14px", color: "#a78bfa", fontSize: 10, fontWeight: 700, letterSpacing: "0.20em", textTransform: "uppercase" }}>
              Preguntas frecuentes
            </p>
            <h2 style={{
              margin: 0,
              fontFamily: "var(--font-heading), system-ui, sans-serif",
              fontSize: "clamp(1.9rem, 6vw, 2.8rem)",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#f8fafc",
            }}>
              Todo lo que necesitas{" "}
              <span style={{ background: "linear-gradient(to right, #3b82f6, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                saber.
              </span>
            </h2>
          </div>

          {/* Accordion */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  style={{
                    background: isOpen ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)",
                    border: isOpen ? "1px solid rgba(167,139,250,0.30)" : "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 16,
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "background 0.25s ease, border-color 0.25s ease",
                    boxShadow: isOpen ? "0 4px 32px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.08)" : "none",
                  }}
                >
                  {/* Question row */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "clamp(16px, 3vw, 22px) clamp(18px, 4vw, 28px)",
                  }}>
                    {/* Number pill */}
                    <span style={{
                      flexShrink: 0,
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: isOpen
                        ? "linear-gradient(135deg, rgba(59,130,246,0.30), rgba(167,139,250,0.25))"
                        : "rgba(255,255,255,0.05)",
                      border: isOpen ? "1px solid rgba(167,139,250,0.40)" : "1px solid rgba(255,255,255,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: isOpen ? "#c4b5fd" : "rgba(255,255,255,0.30)",
                      fontSize: 11,
                      fontWeight: 700,
                      transition: "all 0.25s ease",
                    }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    {/* Question text */}
                    <p style={{
                      flex: 1,
                      margin: 0,
                      color: isOpen ? "#f8fafc" : "rgba(255,255,255,0.75)",
                      fontSize: "clamp(0.88rem, 2.5vw, 1rem)",
                      fontWeight: isOpen ? 700 : 500,
                      lineHeight: 1.4,
                      transition: "color 0.2s ease, font-weight 0.2s ease",
                    }}>
                      {faq.q}
                    </p>

                    {/* Icon */}
                    <div style={{
                      flexShrink: 0,
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: isOpen ? "linear-gradient(135deg, #3b82f6, #a78bfa)" : "rgba(255,255,255,0.06)",
                      border: isOpen ? "none" : "1px solid rgba(255,255,255,0.10)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.25s ease",
                      transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={isOpen ? "#fff" : "rgba(255,255,255,0.45)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </div>
                  </div>

                  {/* Answer */}
                  <div style={{
                    maxHeight: isOpen ? 300 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)",
                  }}>
                    <div style={{
                      padding: "0 clamp(18px, 4vw, 28px) clamp(18px, 3vw, 24px)",
                      paddingLeft: "calc(clamp(18px, 4vw, 28px) + 28px + 16px)",
                    }}>
                      <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 16 }} />
                      <p style={{
                        margin: 0,
                        color: "rgba(255,255,255,0.55)",
                        fontSize: "clamp(0.82rem, 2.2vw, 0.92rem)",
                        lineHeight: 1.75,
                        fontWeight: 400,
                      }}>
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── CTA Final ─────────────────────────────────────────────────────────── */}
      <section style={{
        width: "100%",
        background: "#07080f",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Background video — bucle nativo forward+reverse en un solo archivo */}
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.35, pointerEvents: "none" }}
        >
          <source src="/cta-bg-loop.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay sobre el video */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(7,8,15,0.55) 0%, rgba(7,8,15,0.85) 100%)", pointerEvents: "none" }} />


        {/* Glass panel */}
        <div style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          maxWidth: 500,
          width: "100%",
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(40px) saturate(200%) brightness(1.15)",
          WebkitBackdropFilter: "blur(40px) saturate(200%) brightness(1.15)",
          borderRadius: 28,
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 8px 48px rgba(0,0,0,0.5), inset 0 1.5px 0 rgba(255,255,255,0.15)",
          padding: "clamp(36px, 8vw, 60px) clamp(24px, 6vw, 52px)",
          overflow: "hidden",
        }}>

          {/* Top accent line */}
          <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 1, background: "linear-gradient(to right, transparent, rgba(167,139,250,0.6), transparent)" }} />

          {/* Eyebrow */}
          <p style={{ margin: "0 0 18px", color: "#a78bfa", fontSize: 10, fontWeight: 700, letterSpacing: "0.20em", textTransform: "uppercase" }}>
            Únete a Businext
          </p>

          {/* Headline */}
          <h2 style={{
            margin: "0 0 16px",
            fontFamily: "var(--font-heading), system-ui, sans-serif",
            fontSize: "clamp(2rem, 8vw, 3rem)",
            fontWeight: 800,
            lineHeight: 1.0,
            letterSpacing: "-0.04em",
            color: "#f8fafc",
          }}>
            Tu negocio.<br />
            <span style={{ background: "linear-gradient(to right, #3b82f6, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Bajo control.
            </span>
          </h2>

          {/* Copy */}
          <p style={{
            margin: "0 0 28px",
            color: "rgba(255,255,255,0.45)",
            fontSize: "clamp(0.82rem, 2.5vw, 0.92rem)",
            lineHeight: 1.7,
            fontWeight: 400,
          }}>
            Reservas, finanzas, reseñas e inteligencia artificial.<br />Todo en un solo lugar.
          </p>

          {/* Pricing block */}
          <div style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 16,
            padding: "18px 20px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}>
            {/* Left — free month */}
            <div style={{ textAlign: "left", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{
                  background: "linear-gradient(135deg, rgba(59,130,246,0.25), rgba(167,139,250,0.20))",
                  border: "1px solid rgba(167,139,250,0.35)",
                  borderRadius: 6,
                  padding: "2px 8px",
                  color: "#c4b5fd",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}>Primer mes</span>
              </div>
              <p style={{ margin: 0, color: "#f8fafc", fontSize: "clamp(1.5rem, 6vw, 2rem)", fontWeight: 800, lineHeight: 1, letterSpacing: "-0.03em" }}>
                Gratis
              </p>
              <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.38)", fontSize: "0.72rem" }}>Cancela antes y no se te cobra</p>
            </div>

            {/* Divider */}
            <div style={{ width: 1, alignSelf: "stretch", background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />

            {/* Right — recurring price */}
            <div style={{ textAlign: "right", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, marginBottom: 4 }}>
                <span style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: 6,
                  padding: "2px 8px",
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}>Después</span>
              </div>
              <p style={{ margin: 0, color: "#f8fafc", fontSize: "clamp(1.5rem, 6vw, 2rem)", fontWeight: 800, lineHeight: 1, letterSpacing: "-0.03em" }}>
                14,99<span style={{ fontSize: "clamp(0.9rem, 3vw, 1.1rem)", fontWeight: 600, color: "rgba(255,255,255,0.55)", marginLeft: 2 }}>€</span>
              </p>
              <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.38)", fontSize: "0.72rem" }}>Al mes · Cancela cuando quieras</p>
            </div>
          </div>

          {/* CTA button */}
          <div style={{ width: "100%", position: "relative" }}>
            {/* Pulse ring */}
            <span style={{
              position: "absolute",
              inset: -2,
              borderRadius: 14,
              background: "linear-gradient(135deg, #3b82f6, #a78bfa)",
              opacity: ctaHovered ? 0.35 : 0,
              filter: "blur(8px)",
              transition: "opacity 0.3s ease",
              pointerEvents: "none",
            }} />
            <Link
              href="/login"
              onMouseEnter={() => setCtaHovered(true)}
              onMouseLeave={() => setCtaHovered(false)}
              style={{
                position: "relative",
                width: "100%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                background: "linear-gradient(135deg, #3b82f6, #a78bfa)",
                color: "#fff",
                padding: "17px 32px",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: "1rem",
                border: "1px solid rgba(255,255,255,0.20)",
                cursor: "pointer",
                letterSpacing: "0.03em",
                textDecoration: "none",
                boxShadow: ctaHovered
                  ? "0 8px 48px rgba(99,102,241,0.60), inset 0 1px 0 rgba(255,255,255,0.30)"
                  : "0 4px 24px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.20)",
                transform: ctaHovered ? "translateY(-2px) scale(1.01)" : "translateY(0) scale(1)",
                transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease",
                overflow: "hidden",
              }}
            >
              {/* Shimmer sweep */}
              <span style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)",
                transform: ctaHovered ? "translateX(100%)" : "translateX(-100%)",
                transition: ctaHovered ? "transform 0.5s ease" : "none",
                pointerEvents: "none",
              }} />
              <span style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
                Empieza gratis — 1 mes gratis
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{
                    transform: ctaHovered ? "translateX(3px)" : "translateX(0)",
                    transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                  }}
                >
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </span>
            </Link>
          </div>

          {/* Trust badges */}
          <div style={{ margin: "18px 0 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            {[
              { icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z", label: "Sin permanencia" },
              { icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", label: "Pago seguro" },
            ].map(({ icon, label }) => (
              <span key={label} style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.28)", fontSize: "0.70rem", letterSpacing: "0.04em" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={icon}/></svg>
                {label}
              </span>
            ))}
          </div>

        </div>
      </section>
    </main>
  );
}
