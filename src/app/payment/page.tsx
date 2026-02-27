"use client";

import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import { fetchClientSecret as fetchClientSecretOriginal } from "@/app/actions/stripe";
import { useState } from "react";
import Link from "next/link";

export default function PaymentPage() {
  const [showReturnBotton, setShowReturnBotton] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  const fetchClientSecret = async (): Promise<string> => {
    try {
      const secret = await fetchClientSecretOriginal();
      if (!secret) throw new Error("No se pudo iniciar el pago. Intenta de nuevo.");
      setShowReturnBotton(true);
      return secret;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al conectar con el procesador de pagos.";
      setStripeError(message);
      throw err;
    }
  };

  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
  );

  if (stripeError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-white via-blue-50 to-cyan-50 p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md w-full text-center shadow">
          <h2 className="text-xl font-bold text-red-700 mb-2">Error en el pago</h2>
          <p className="text-red-600 text-sm mb-4">{stripeError}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setStripeError(null)}
              className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Reintentar
            </button>
            <Link
              href="/"
              className="px-5 py-2 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="checkout" className="py-6 flex flex-col items-center">
      <div className="w-full sm:max-w-lg mx-auto">
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{ fetchClientSecret }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
        {showReturnBotton && (
          <Link
            href="/"
            className="mt-8 flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 w-auto max-w-xs mx-auto"
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
                d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6m-6 0v6m0 0H7m6 0h6"
              />
            </svg>
            Volver al dashboard
          </Link>
        )}
      </div>
    </div>
  );
}
