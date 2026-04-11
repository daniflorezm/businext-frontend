"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useAccessContext } from "@/hooks/useAccessContext";
import { logout } from "@/app/login/logout";
export const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { capabilities, context } = useAccessContext();
  const userName = context?.profile?.displayName || context?.profile?.email || "Usuario";

  // Modal de contacto
  const [showContact, setShowContact] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Función para enviar el mensaje por email
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

  return (
    <header className="w-full bg-white/90 shadow-md px-4 sm:px-8 py-3 flex flex-col sm:flex-row justify-between items-center gap-2 border-b border-gray-200 sticky top-0 z-30">
      <div className="flex w-full sm:w-auto justify-between items-center">
        <span className="text-2xl font-extrabold text-blue-700 tracking-tight select-none flex items-center gap-2">
          Businext
          <button
            type="button"
            className="ml-1 p-1 rounded-full hover:bg-blue-100 focus:outline-none"
            title="Enviar dudas o quejas"
            aria-label="Enviar dudas o quejas"
            onClick={() => setShowContact(true)}
          >
            {/* Icono de consulta más claro: círculo con signo de interrogación */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="white"
              />
              <text
                x="12"
                y="16"
                textAnchor="middle"
                fontSize="12"
                fill="#3b82f6"
                fontWeight="bold"
                fontFamily="Arial"
              >
                ?
              </text>
            </svg>
          </button>
        </span>
        <button
          className="sm:hidden flex items-center px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {menuOpen ? (
            <svg
              className="w-7 h-7 text-blue-700 transition-transform duration-200 rotate-90"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-7 h-7 text-blue-700 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Modal de contacto */}
      {showContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full flex flex-col gap-4">
            <h2 className="text-xl font-bold text-blue-700">
              Enviar dudas o quejas
            </h2>
            <p className="text-gray-600 text-sm">
              ¿Tienes alguna duda, sugerencia o queja sobre la aplicación?
              Escríbenos aquí:
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
      {/* Nav menu */}
      <nav
        className={`overflow-hidden flex-col sm:flex-row flex gap-2 sm:gap-3 w-full sm:w-auto items-center bg-white/95 sm:bg-transparent rounded-xl sm:rounded-none shadow-md sm:shadow-none px-4 sm:px-0 py-0 sm:py-0 mt-2 sm:mt-0
        transition-all duration-300
        ${
          menuOpen
            ? "max-h-96 py-3 opacity-100 scale-y-100"
            : "max-h-0 opacity-0 scale-y-95 pointer-events-none sm:max-h-full sm:opacity-100 sm:scale-y-100 sm:pointer-events-auto"
        }
        sm:transition-none sm:py-0 sm:opacity-100 sm:scale-y-100 sm:max-h-full`}
      >
        <Link
          href="/reservation"
          className="px-3 py-1.5 rounded-md font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition w-full sm:w-auto text-center"
          onClick={() => setMenuOpen(false)}
        >
          Reservas
        </Link>
        {capabilities.canManageFinances && (
          <Link
            href="/finances"
            className="px-3 py-1.5 rounded-md font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition w-full sm:w-auto text-center"
            onClick={() => setMenuOpen(false)}
          >
            Finanzas
          </Link>
        )}
        {capabilities.canManageConfiguration && (
          <Link
            href="/configuration"
            className="px-3 py-1.5 rounded-md font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition w-full sm:w-auto text-center"
            onClick={() => setMenuOpen(false)}
          >
            Configuración
          </Link>
        )}
      </nav>
      <div className="flex items-center gap-2 bg-white/80 rounded-md px-3 py-1.5 shadow-sm mt-2 sm:mt-0">
        <span className="text-base font-semibold text-blue-700 max-w-[120px] sm:max-w-none text-wrap">
          ¡Hola {userName}!
        </span>
        <form action={logout}>
          <button
            type="submit"
            className="ml-2 p-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow hover:from-blue-600 hover:to-cyan-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
              />
            </svg>
          </button>
        </form>
      </div>
    </header>
  );
};
