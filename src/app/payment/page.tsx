"use client";

import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import { fetchClientSecret as fetchClientSecretOriginal } from "@/app/actions/stripe";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export default function PaymentPage() {
  const [showReturnBotton, setShowReturnBotton] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  const fetchClientSecret = async (): Promise<string> => {
    try {
      const secret = await fetchClientSecretOriginal();
      if (!secret)
        throw new Error("No se pudo iniciar el pago. Intenta de nuevo.");
      setShowReturnBotton(true);
      return secret;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Error al conectar con el procesador de pagos.";
      setStripeError(message);
      throw err;
    }
  };

  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
  );

  if (stripeError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background p-8">
        <Card variant="elevated" className="max-w-md w-full border-danger/30">
          <CardContent className="p-8 text-center flex flex-col items-center gap-3">
            <AlertTriangle className="w-10 h-10 text-danger" />
            <h2 className="font-heading text-h2 font-bold text-danger">
              Error en el pago
            </h2>
            <p className="text-body-sm text-foreground-muted">{stripeError}</p>
            <div className="flex gap-3 justify-center mt-2">
              <Button
                variant="primary"
                onClick={() => setStripeError(null)}
              >
                Reintentar
              </Button>
              <Link href="/">
                <Button variant="ghost">Volver al inicio</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div id="checkout" className="py-6 flex flex-col items-center bg-background min-h-screen">
      <div className="w-full sm:max-w-lg mx-auto">
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{ fetchClientSecret }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
        {showReturnBotton && (
          <div className="mt-8 flex justify-center">
            <Link href="/">
              <Button variant="primary">
                <ArrowLeft className="w-4 h-4" />
                Volver al dashboard
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
