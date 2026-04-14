import { Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md bg-surface rounded-xl shadow-lg border border-border-subtle p-8 flex flex-col items-center gap-6">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <h2 className="font-heading text-h3 font-bold text-foreground text-center">
          Verificando email...
        </h2>
        <p className="text-body-sm text-foreground-muted text-center">
          Por favor abre tu dirección de correo y confirma tu cuenta.
          <br />
          Una vez confirmada, podrás continuar.
        </p>
      </div>
    </div>
  );
}
