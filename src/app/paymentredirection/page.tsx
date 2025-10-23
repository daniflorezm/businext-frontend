import { stripe } from "@/lib/stripe/types";
import { redirect } from "next/navigation";

interface PageParams {
  session_id?: string;
  [key: string]: string | string[] | undefined;
}

interface Props {
  searchParams: Promise<PageParams>;
}

export default async function PaymentRedirectionPage({ searchParams }: Props) {
  const params = await searchParams;
  const session_id =
    typeof params.session_id === "string" ? params.session_id : "";

  if (!session_id)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-blue-50 to-cyan-50">
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-xl text-center font-semibold shadow border border-red-200">
          No se recibió el identificador de sesión. Intenta de nuevo.
        </div>
        <a
          href="/"
          className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Volver al dashboard
        </a>
      </div>
    );

  const session = await stripe.checkout.sessions.retrieve(session_id);
  const status = session.status;

  if (status === "complete") {
    redirect("/reservation");
  }

  // Si el status es "open" u otro estado, mostrar error
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-blue-50 to-cyan-50">
      <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-xl text-center font-semibold shadow border border-red-200">
        El pago no pudo ser procesado correctamente.
      </div>
      <a
        href="/"
        className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Volver al dashboard
      </a>
    </div>
  );
}
