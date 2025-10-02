"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import GoogleButton from "../../components/auth/GoogleButton";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const cardBox =
    "w-full max-w-md rounded-2xl border border-blue-900/10 bg-white p-6 shadow-xl dark:border-blue-200/10 dark:bg-gray-900";
  const label =
    "text-sm font-medium text-gray-700 dark:text-gray-200";
  const input =
    "mt-1 w-full rounded-xl border border-blue-900/20 bg-white px-3 py-2 text-sm text-gray-800 dark:border-gray-600/50 dark:bg-gray-800 dark:text-gray-100";
  const btnPrimary =
    "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-700 via-blue-600 to-blue-500 px-4 py-2 font-semibold text-white shadow-md transition-all hover:brightness-105 hover:shadow-lg disabled:opacity-60";
  const btnGhost =
    "rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-blue-50/70 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-blue-900/20";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        // ✅ Use the Better Auth client helper
        const { data, error } = await authClient.signIn.email({
          email,
          password,
        });

        if (error) throw new Error(error.message || "Não foi possível entrar.");

        // Session is now set + client cache updated -> navbar will re-render
        router.replace("/practitioner/agenda");
      } catch (err: any) {
        setError(err?.message ?? "Erro ao entrar.");
      }
    });
  }

  return (
    <div className={cardBox} aria-busy={pending}>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Entrar na sua conta
        </h1>
        <button
          type="button"
          className={btnGhost}
          onClick={() => router.push("/")}
          disabled={pending}
        >
          Voltar
        </button>
      </div>

      <form onSubmit={onSubmit} className="grid gap-3">
        <GoogleButton />
        <label className={label}>
          E-mail
          <input
            type="email"
            required
            autoComplete="email"
            className={input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
            placeholder="voce@exemplo.com"
          />
        </label>

        <label className={label}>
          Senha
          <div className="mt-1 flex items-stretch gap-2">
            <input
              type={showPass ? "text" : "password"}
              required
              autoComplete="current-password"
              className={input + " flex-1"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={pending}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPass((s) => !s)}
              className="rounded-xl border border-blue-900/20 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-blue-50/70 dark:border-gray-600/50 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-blue-900/20"
              disabled={pending}
              aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPass ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </label>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}

        <button type="submit" className={btnPrimary} disabled={pending}>
          {pending ? "Entrando..." : "Entrar"}
        </button>

        <div className="mt-2 flex items-center justify-between text-sm">
          <button
            type="button"
            className={btnGhost}
            onClick={() => router.push("/recuperar-senha")}
            disabled={pending}
          >
            Esqueci minha senha
          </button>
          <button
            type="button"
            className={btnGhost}
            onClick={() => router.push("/cadastro")}
            disabled={pending}
          >
            Criar conta
          </button>
        </div>
      </form>
    </div>
  );
}
