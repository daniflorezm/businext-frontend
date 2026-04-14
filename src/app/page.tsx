"use client";
import { ReservationItemSection1 } from "@/components/landingpage/ReservationItemSection1";
import Link from "next/link";
import React from "react";
import { Lock, Smartphone, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  const handleDiscoverClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const section = document.getElementById("seccion2");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="min-h-screen w-full bg-background flex flex-col items-center px-2 sm:px-0 py-0">
      {/* Section 1: Hero */}
      <section className="container mx-auto px-2 sm:px-4 py-12 sm:py-20 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <div className="inline-block mb-4 px-4 py-2 bg-accent/15 text-accent rounded-full text-caption font-semibold">
              La mejor solucion de reservas
            </div>
            <h1 className="font-heading text-h1 md:text-[3.5rem] font-bold text-foreground mb-6 leading-tight">
              Gestiona tus reservas de forma{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                simple y rapida
              </span>
            </h1>
            <p className="text-body text-foreground-muted mb-8 leading-relaxed">
              La plataforma definitiva para gestionar reservas, productos y
              finanzas de tu negocio. Centraliza la administracion de tus
              servicios y lleva el control total desde cualquier lugar,
              haciendolo todo mucho mas simple.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#seccion2"
                onClick={handleDiscoverClick}
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-body px-8 py-4 rounded-lg font-bold shadow-md hover:bg-primary-hover transition-colors duration-150 ease-snappy"
              >
                Descubre mas
              </a>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 text-body px-8 py-4 bg-transparent border border-primary rounded-lg font-bold text-primary hover:bg-primary/10 transition-colors duration-150 ease-snappy"
              >
                Comienza ahora
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="mt-8 flex items-center space-x-6 text-caption text-foreground-muted">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-success"
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
                <span>Interfaz intuitiva</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-success"
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
                <span>Configuracion en 5 minutos</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <ReservationItemSection1 />
          </div>
        </div>
      </section>

      {/* Section 2: Calendar */}
      <section
        id="seccion2"
        className="w-full bg-surface py-12 sm:py-20 md:py-32"
      >
        <div className="container mx-auto px-2 sm:px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="relative order-2 md:order-1 flex justify-center items-center w-full">
              <div className="bg-surface-raised rounded-2xl sm:rounded-3xl p-1 sm:p-2 shadow-lg flex flex-col items-center w-full max-w-2xl mx-auto border border-border-subtle">
                <img
                  src="/lp-2.png"
                  alt="Calendario de reservas"
                  className="rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-primary/20 shadow-md bg-surface w-full h-auto max-w-[700px] aspect-[16/9] object-cover sm:object-contain"
                  style={{ maxHeight: "420px" }}
                />
              </div>
            </div>
            <div className="order-1 md:order-2 mt-8 md:mt-0">
              <h2 className="font-heading text-h2 md:text-[2.75rem] font-bold text-foreground mb-6 leading-tight">
                Organiza tu agenda de la manera mas simple e intuitiva
              </h2>
              <p className="text-body text-foreground-muted mb-8 leading-relaxed">
                Visualiza y administra todas tus reservas en un calendario
                moderno y responsivo. Crea, edita y consulta detalles de cada
                cita con facilidad, optimizando la gestion de tu agenda.
              </p>
              <ul className="list-disc list-inside text-primary text-body pl-4 text-left mx-auto mb-6 space-y-1">
                <li>Vista mensual, semanal y diaria</li>
                <li>Creacion y edicion de citas</li>
                <li>Control total de tu tiempo</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Finances */}
      <section className="w-full min-h-[80vh] flex flex-col items-center justify-center py-6 px-2 sm:px-8">
        <div className="relative w-full max-w-5xl flex flex-col lg:flex-row items-center justify-center gap-0">
          <div className="flex-1 flex flex-col items-center justify-center gap-6 z-10 px-4 py-8 lg:py-0 lg:pl-12">
            <h2 className="font-heading text-h2 font-bold text-foreground text-center">
              Finanzas y Analisis Visual
            </h2>
            <p className="text-body text-foreground-muted text-center max-w-xl">
              Lleva el control total de tus ingresos y egresos, visualiza
              balances y analiza el rendimiento de tu negocio con graficos
              interactivos y reportes detallados.
            </p>
            <ul className="list-disc list-inside text-foreground-muted text-body pl-4 text-left mx-auto space-y-1">
              <li>Registro y clasificacion de movimientos</li>
              <li>Graficos de barras, lineas y pastel</li>
              <li>Exportacion de reportes financieros</li>
            </ul>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center relative w-full h-[520px] lg:h-[520px] mt-8 lg:mt-0">
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <img
                src="/lp-3.png"
                alt="Lista de registros financieros"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-xl h-[55%] object-contain rounded-3xl shadow-lg border-4 border-primary/10 bg-surface opacity-90 blur-[1.5px]"
              />
              <img
                src="/lp-3.png"
                alt="Lista de registros financieros"
                className="relative w-[70%] max-w-xl h-[45%] object-contain rounded-3xl shadow-lg border-4 border-primary/20 bg-surface z-10 mb-4"
              />
              <img
                src="/lp-4.png"
                alt="Graficos financieros"
                className="relative w-[70%] max-w-xl h-[45%] object-contain rounded-3xl shadow-lg border-4 border-primary/20 bg-surface z-10 mt-4"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-5xl flex flex-col items-center gap-8 py-12">
        <h2 className="font-heading text-h2 font-bold text-foreground text-center">
          Caracteristicas que te encantaran
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
          {[
            {
              icon: <Lock className="w-7 h-7" />,
              title: "Acceso seguro",
              desc: "Tus datos siempre protegidos con autenticacion y cifrado.",
            },
            {
              icon: <Smartphone className="w-7 h-7" />,
              title: "Responsive",
              desc: "Funciona perfecto en cualquier dispositivo, movil o escritorio.",
            },
            {
              icon: <Zap className="w-7 h-7" />,
              title: "Rapido y eficiente",
              desc: "Interfaz agil y configuracion sencilla.",
            },
          ].map((feature) => (
            <Card
              key={feature.title}
              variant="interactive"
              className="p-6 flex flex-col items-center text-center"
            >
              <div className="text-primary mb-3">{feature.icon}</div>
              <h4 className="font-heading text-h4 font-bold text-foreground mb-1">
                {feature.title}
              </h4>
              <p className="text-body-sm text-foreground-muted">
                {feature.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full max-w-2xl flex flex-col items-center gap-4 py-8">
        <h2 className="font-heading text-h2 font-bold text-foreground text-center">
          ¿Listo para transformar tu negocio?
        </h2>
        <Link href="/login">
          <Button variant="accent" size="lg">
            Comienza ahora
          </Button>
        </Link>
        <span className="text-caption text-foreground-subtle">
          * Requiere inicio de sesion
        </span>
      </section>
    </main>
  );
}
