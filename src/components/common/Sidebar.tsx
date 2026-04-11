"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ChartBarBig,
  Settings,
  LogOut,
  Menu,
  X,
  MessageCircleQuestion,
  Sparkles,
  Send,
} from "lucide-react";
import { useAccessContext } from "@/hooks/useAccessContext";
import { logout } from "@/app/login/logout";

const NAV_LINKS = [
  {
    href: "/reservation",
    label: "Reservas",
    icon: CalendarDays,
    cap: "canManageReservations" as const,
  },
  {
    href: "/finances",
    label: "Finanzas",
    icon: ChartBarBig,
    cap: "canManageFinances" as const,
  },
  {
    href: "/configuration",
    label: "Configuración",
    icon: Settings,
    cap: "canManageConfiguration" as const,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { context, capabilities } = useAccessContext();
  const [open, setOpen] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [sending, setSending] = useState(false);

  const displayName =
    context?.profile?.displayName ||
    context?.profile?.email ||
    "Usuario";

  const roleLabel =
    context?.role === "owner"
      ? "Owner"
      : context?.role === "manager"
      ? "Manager"
      : "Empleado";

  const sendContactEmail = async () => {
    setSending(true);
    try {
      await fetch("/api/send-contact-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: contactMessage }),
      });
      alert("¡Mensaje enviado!");
      setContactMessage("");
      setShowContact(false);
    } catch {
      alert("Error al enviar el mensaje. Intenta de nuevo.");
    }
    setSending(false);
  };

  const navContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="p-2 rounded-xl bg-primary/10 glow-primary">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <span className="text-xl font-bold text-foreground tracking-tight select-none">
          Businext
        </span>
        <button
          type="button"
          onClick={() => setShowContact(true)}
          className="ml-auto p-2 rounded-xl bg-secondary hover:bg-muted transition-colors"
          title="Enviar dudas o quejas"
        >
          <MessageCircleQuestion className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV_LINKS.map(({ href, label, icon: Icon, cap }) => {
          if (!capabilities[cap]) return null;
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200
                ${active
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-border flex flex-col gap-2">
        <div className="px-4 py-3 rounded-xl bg-secondary">
          <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
          <p className="text-xs text-muted-foreground">{roleLabel}</p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border shadow-xl fixed top-0 left-0 h-full z-30">
        {navContent}
      </aside>

      {/* Mobile: hamburger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2.5 rounded-xl bg-card shadow-lg border border-border text-primary"
        aria-label="Abrir menú"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile: overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile: sliding sidebar */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-full w-72 bg-card shadow-2xl z-50 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-secondary text-muted-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        {navContent}
      </aside>

      {/* Contact modal */}
      {showContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl shadow-2xl border border-border p-6 max-w-md w-full flex flex-col gap-4 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <MessageCircleQuestion className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Enviar mensaje</h2>
            </div>
            <p className="text-muted-foreground text-sm">
              ¿Tienes alguna duda, sugerencia o queja? Escríbenos aquí:
            </p>
            <textarea
              className="w-full min-h-[100px] bg-secondary border border-border rounded-xl p-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
              placeholder="Escribe tu mensaje..."
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              disabled={sending}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2.5 rounded-xl bg-secondary text-foreground font-medium hover:bg-muted transition-colors"
                onClick={() => setShowContact(false)}
                disabled={sending}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="px-4 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={sendContactEmail}
                disabled={sending || !contactMessage.trim()}
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
