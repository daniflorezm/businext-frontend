export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-cyan-50">
      <div className="w-full max-w-md bg-white/90 rounded-3xl shadow-2xl border border-blue-100 p-8 flex flex-col items-center gap-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-b-4 border-cyan-500 mb-4"></div>
        <h2 className="text-xl font-bold text-blue-700 text-center">
          Verificando email...
        </h2>
        <p className="text-blue-700 text-center">
          Por favor abre tu dirección de correo y confirma tu cuenta.
          <br />
          Una vez confirmada, podrás continuar.
        </p>
      </div>
    </div>
  );
}
