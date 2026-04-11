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
      <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-100">
        <span className="text-2xl font-extrabold text-blue-700 tracking-tight select-none">
          Businext
        </span>
        <button
          type="button"
          onClick={() => setShowContact(true)}
          className="ml-1 p-1 rounded-full hover:bg-blue-100 focus:outline-none"
          title="Enviar dudas o quejas"
        >
          <MessageCircleQuestion className="h-5 w-5 text-blue-400" />
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
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                active
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-gray-100 flex flex-col gap-2">
        <div className="px-4 py-2 rounded-xl bg-gray-50">
          <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
          <p className="text-xs text-gray-400">{roleLabel}</p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition"
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
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 shadow-sm fixed top-0 left-0 h-full z-30">
        {navContent}
      </aside>

      {/* Mobile: hamburger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-xl bg-white shadow-md border border-gray-200 text-blue-700"
        aria-label="Abrir menú"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile: overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile: sliding sidebar */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <X className="w-5 h-5" />
        </button>
        {navContent}
      </aside>

      {/* Contact modal */}
      {showContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full flex flex-col gap-4 mx-4">
            <h2 className="text-xl font-bold text-blue-700">Enviar dudas o quejas</h2>
            <p className="text-gray-600 text-sm">
              ¿Tienes alguna duda, sugerencia o queja? Escríbenos aquí:
            </p>
            <textarea
              className="w-full min-h-[80px] border border-blue-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Escribe tu mensaje..."
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              disabled={sending}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
                onClick={() => setShowContact(false)}
                disabled={sending}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                onClick={sendContactEmail}
                disabled={sending || !contactMessage.trim()}
              >
                {sending ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
