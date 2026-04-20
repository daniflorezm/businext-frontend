import { stripe } from "@/lib/stripe/types";
import { redirect } from "next/navigation";
import Link from "next/link";

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <div className="mb-4 p-4 bg-danger/10 text-danger rounded-lg text-center font-semibold shadow-sm border border-danger/30">
          No se recibió el identificador de sesión. Intenta de nuevo.
        </div>
        <Link
          href="/"
          className="px-5 py-2 bg-primary text-primary-foreground rounded-lg font-semibold shadow-md hover:bg-primary-hover transition-colors duration-150"
        >
          Volver al dashboard
        </Link>
      </div>
    );

  const session = await stripe.checkout.sessions.retrieve(session_id);
  const status = session.status;

  if (status === "complete") {
    redirect("/reservation");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="mb-4 p-4 bg-danger/10 text-danger rounded-lg text-center font-semibold shadow-sm border border-danger/30">
        El pago no pudo ser procesado correctamente.
      </div>
      <Link
        href="/"
        className="px-5 py-2 bg-primary text-primary-foreground rounded-lg font-semibold shadow-md hover:bg-primary-hover transition-colors duration-150"
      >
        Volver al dashboard
      </Link>
    </div>
  );
}
