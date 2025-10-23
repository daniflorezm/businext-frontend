"use client";
import { ReservationItemSection1 } from "@/components/landingpage/ReservationItemSection1";
import Link from "next/link";
import React, { useState } from "react";
export default function Home() {
  // Scroll suave a la sección 2
  const handleDiscoverClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const section = document.getElementById("seccion2");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col items-center px-2 sm:px-0 py-0">
      {/* Sección 1: Lista de reservas - estilo renovado */}
      <section className="container mx-auto px-2 sm:px-4 py-12 sm:py-20 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <div className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              ✨ La mejor solución de reservas
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Gestiona tus reservas de forma{" "}
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                simple y rápida
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              La plataforma definitiva para gestionar reservas, productos y
              finanzas de tu negocio. Centraliza la administración de tus
              servicios y lleva el control total desde cualquier lugar,
              haciéndolo todo mucho mas simple.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#seccion2"
                onClick={handleDiscoverClick}
                className="bg-gradient-to-r from-blue-600 to-blue-400 text-white text-lg px-8 py-6 rounded-xl font-bold shadow hover:from-blue-700 hover:to-blue-500 transition"
              >
                Descubre más
              </a>
              <Link
                href="/login"
                className="text-lg px-8 py-6 bg-transparent border border-blue-400 rounded-xl font-bold text-blue-700 hover:bg-blue-50 transition"
              >
                Comienza ahora
              </Link>
            </div>
            <div className="mt-8 flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Pago único</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Configuración en 5 minutos</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <ReservationItemSection1 />
          </div>
        </div>
      </section>

      {/* Sección 2: Calendario - estilo renovado */}
      <section
        id="seccion2"
        className="w-full bg-gradient-to-br from-blue-100 via-white to-purple-100 py-12 sm:py-20 md:py-32"
      >
        <div className="container mx-auto px-2 sm:px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="relative order-2 md:order-1 flex justify-center items-center w-full">
              <div className="bg-white/80 rounded-2xl sm:rounded-3xl p-1 sm:p-2 shadow-2xl flex flex-col items-center w-full max-w-2xl mx-auto">
                <img
                  src="/lp-2.png"
                  alt="Calendario de reservas"
                  className="rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-blue-200 shadow-xl bg-white w-full h-auto max-w-[700px] aspect-[16/9] object-cover sm:object-contain"
                  style={{
                    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
                    maxHeight: "420px",
                  }}
                />
              </div>
            </div>
            <div className="order-1 md:order-2 mt-8 md:mt-0">
              <h2 className="text-3xl md:text-5xl font-bold text-blue-700 mb-6 leading-tight">
                Organiza tu agenda de la manera mas simple e intuitiva
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Visualiza y administra todas tus reservas en un calendario
                moderno y responsivo. Crea, edita y consulta detalles de cada
                cita con facilidad, optimizando la gestión de tu agenda.
              </p>
              <ul className="list-disc list-inside text-blue-600 text-base pl-4 text-left mx-auto mb-6">
                <li>Vista mensual, semanal y diaria</li>
                <li>Creación y edición de citas</li>
                <li>Control total de tu tiempo</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Sección 3: Finanzas y Gráficos */}
      <section className="w-full min-h-[80vh] flex flex-col items-center justify-center py-6 px-2 sm:px-8">
        <div className="relative w-full max-w-5xl flex flex-col lg:flex-row items-center justify-center gap-0 lg:gap-0">
          <div className="flex-1 flex flex-col items-center justify-center gap-6 z-10 px-4 py-8 lg:py-0 lg:pl-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-blue-700 text-center">
              Finanzas y Análisis Visual
            </h2>
            <p className="text-lg text-gray-700 text-center max-w-xl">
              Lleva el control total de tus ingresos y egresos, visualiza
              balances y analiza el rendimiento de tu negocio con gráficos
              interactivos y reportes detallados.
            </p>
            <ul className="list-disc list-inside text-gray-600 text-base pl-4 text-left mx-auto">
              <li>Registro y clasificación de movimientos</li>
              <li>Gráficos de barras, líneas y pastel</li>
              <li>Exportación de reportes financieros</li>
            </ul>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center relative w-full h-[520px] lg:h-[520px] mt-8 lg:mt-0">
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <img
                src="/lp-3.png"
                alt="Lista de registros financieros"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-xl h-[55%] object-contain rounded-3xl shadow-2xl border-4 border-blue-100 bg-blue-50 opacity-90 blur-[1.5px]"
              />
              <img
                src="/lp-3.png"
                alt="Lista de registros financieros"
                className="relative w-[70%] max-w-xl h-[45%] object-contain rounded-3xl shadow-2xl border-4 border-blue-200 bg-white z-10 mb-4"
              />
              <img
                src="/lp-4.png"
                alt="Gráficos financieros"
                className="relative w-[70%] max-w-xl h-[45%] object-contain rounded-3xl shadow-2xl border-4 border-blue-200 bg-white z-10 mt-4"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-5xl flex flex-col items-center gap-8 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 text-center">
          Características que te encantarán
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full">
          <div className="bg-white/90 rounded-2xl shadow-md border border-blue-100 p-6 flex flex-col items-center text-center">
            <span className="text-blue-600 text-3xl mb-2">🔒</span>
            <h4 className="font-bold text-lg mb-1">Acceso seguro</h4>
            <p className="text-gray-600 text-sm">
              Tus datos siempre protegidos con autenticación y cifrado.
            </p>
          </div>
          <div className="bg-white/90 rounded-2xl shadow-md border border-blue-100 p-6 flex flex-col items-center text-center">
            <span className="text-blue-600 text-3xl mb-2">📱</span>
            <h4 className="font-bold text-lg mb-1">Responsive</h4>
            <p className="text-gray-600 text-sm">
              Funciona perfecto en cualquier dispositivo, móvil o escritorio.
            </p>
          </div>
          <div className="bg-white/90 rounded-2xl shadow-md border border-blue-100 p-6 flex flex-col items-center text-center">
            <span className="text-blue-600 text-3xl mb-2">⚡</span>
            <h4 className="font-bold text-lg mb-1">Rápido y eficiente</h4>
            <p className="text-gray-600 text-sm">
              Interfaz ágil y configuracióm sencilla.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full max-w-2xl flex flex-col items-center gap-4 py-8">
        <h2 className="text-2xl font-bold text-blue-700 text-center">
          ¿Listo para transformar tu negocio?
        </h2>
        <a
          href="/reservation"
          className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold text-lg shadow hover:bg-blue-700 transition"
        >
          Comienza ahora
        </a>
        <span className="text-xs text-gray-400">
          * Requiere inicio de sesión
        </span>
      </section>
    </main>
  );
}
