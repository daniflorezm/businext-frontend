"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useConfiguration } from "@/hooks/useConfiguration";
import { logout } from "@/app/login/logout";
export const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { getAllConfigurations, configurationData } = useConfiguration();
  useEffect(() => {
    getAllConfigurations();
  }, []);

  return (
    <header className="w-full bg-white/90 shadow-md px-4 sm:px-8 py-3 flex flex-col sm:flex-row justify-between items-center gap-2 border-b border-gray-200 sticky top-0 z-30">
      <div className="flex w-full sm:w-auto justify-between items-center">
        <span className="text-2xl font-extrabold text-blue-700 tracking-tight select-none">
          Businext
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
        <Link
          href="/finances"
          className="px-3 py-1.5 rounded-md font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition w-full sm:w-auto text-center"
          onClick={() => setMenuOpen(false)}
        >
          Finanzas
        </Link>
        <Link
          href="/products"
          className="px-3 py-1.5 rounded-md font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition w-full sm:w-auto text-center"
          onClick={() => setMenuOpen(false)}
        >
          Productos
        </Link>
        <Link
          href="/configuration"
          className="px-3 py-1.5 rounded-md font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition w-full sm:w-auto text-center"
          onClick={() => setMenuOpen(false)}
        >
          Configuración
        </Link>
      </nav>
      <div className="flex items-center gap-2 bg-white/80 rounded-md px-3 py-1.5 shadow-sm mt-2 sm:mt-0">
        <span className="text-base font-semibold text-blue-700 max-w-[120px] sm:max-w-none text-wrap">
          ¡Hola {configurationData[0]?.businessName || "Usuario"}!
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
