export default function AuthErrorPage() {
  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Não foi possível confirmar
        </h1>
        <p className="text-sm text-muted-foreground">
          O link pode ter expirado. Tenta criar conta ou entrar novamente.
        </p>
      </div>
    </div>
  )
}
