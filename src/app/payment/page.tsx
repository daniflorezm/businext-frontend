"use client";

import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import { fetchClientSecret as fetchClientSecretOriginal } from "@/app/actions/stripe";
import { useState } from "react";

export default function PaymentPage() {
  const [showReturnBotton, setShowReturnBotton] = useState(false);

  // Ensure fetchClientSecret always returns a string
  const fetchClientSecret = async (): Promise<string> => {
    const secret = await fetchClientSecretOriginal();
    if (secret === null) {
      throw new Error("Client secret is null");
    }
    setShowReturnBotton(true);
    return secret;
  };

  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
  );

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
          <a
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
          </a>
        )}
      </div>
    </div>
  );
}
