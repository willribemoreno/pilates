"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
// If you already created SocialButtons (Google/Facebook/Microsoft/Apple) as in previous step,
// point this import to its real path, e.g. "@/app/(auth)/login/SocialButtons"
import GoogleButton from "@/components/auth/GoogleButton";

export default function SignUpForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/agenda";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setErr(null);

    if (!name.trim()) return setErr("Informe seu nome.");
    if (!email.trim()) return setErr("Informe um e-mail válido.");
    if (password.length < 6) return setErr("A senha deve ter ao menos 6 caracteres.");
    if (password !== password2) return setErr("As senhas não conferem.");

    try {
      setLoading(true);
      // Better Auth — email/password sign-up
      await authClient.signUp.email({
        email,
        password,
        name,
        // optional: callbackURL to land after sign-in/verification flow
        callbackURL: next,
      });

      // If your config has autoSignIn: false, you may want to push to a "check your email" page.
      // For now, try to go to next (Better Auth sets cookie on success when autoSignIn true)
      router.push(next);
    } catch (e: any) {
      const msg =
        e?.message ||
        e?.body?.message ||
        "Não foi possível criar sua conta. Tente novamente.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "mt-1 w-full rounded-xl border border-blue-900/20 bg-white px-3 py-2 " +
    "text-gray-800 dark:border-blue-200/20 dark:bg-gray-800 dark:text-gray-100 " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500/40";

  const labelBase = "text-sm text-gray-700 dark:text-gray-300";

  const primaryBtn =
    "relative overflow-hidden rounded-xl bg-gradient-to-r " +
    "from-indigo-700 via-blue-600 to-blue-500 px-4 py-2 " +
    "text-sm font-semibold text-white shadow-lg transition-all duration-300 " +
    "hover:brightness-105 hover:shadow-xl active:scale-95 disabled:opacity-60 w-full";

  return (
    <div className="rounded-2xl border border-blue-900/10 bg-white p-5 shadow-xl dark:border-blue-200/10 dark:bg-gray-900">
      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3">
        <label className={labelBase}>
          Nome
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputBase}
            placeholder="Ex.: João da Silva"
            disabled={loading}
          />
        </label>

        <label className={labelBase}>
          E-mail
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputBase}
            placeholder="voce@exemplo.com"
            disabled={loading}
          />
        </label>

        <label className={labelBase}>
          Senha
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputBase} pr-10`}
              placeholder="••••••••"
              disabled={loading}
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute inset-y-0 right-2 my-auto rounded-md p-1 text-gray-500 hover:bg-blue-50/60 dark:text-gray-300 dark:hover:bg-blue-900/20"
              aria-label={showPw ? "Ocultar senha" : "Mostrar senha"}
              tabIndex={-1}
            >
              {showPw ? (
                // eye-off
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.58 10.58a3 3 0 104.24 4.24M9.88 5.08A9.51 9.51 0 0121 12c-.65 1.27-1.6 2.45-2.71 3.46M14.12 18.92A9.51 9.51 0 013 12c.63-1.23 1.54-2.38 2.61-3.37" />
                </svg>
              ) : (
                // eye
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              )}
            </button>
          </div>
        </label>

        <label className={labelBase}>
          Confirmar senha
          <input
            type={showPw ? "text" : "password"}
            required
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            className={inputBase}
            placeholder="••••••••"
            disabled={loading}
            minLength={6}
          />
        </label>

        {err && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
            {err}
          </div>
        )}

        <button type="submit" disabled={loading} aria-busy={loading} className={primaryBtn}>
          {loading ? "Criando conta..." : "Criar conta"}
        </button>
      </form>

      {/* Divider */}
      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-blue-900/10 dark:bg-blue-200/10" />
        <span className="text-xs text-gray-500">ou</span>
        <div className="h-px flex-1 bg-blue-900/10 dark:bg-blue-200/10" />
      </div>

      {/* Social sign up */}
      <>
      <GoogleButton />
      </>

      <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
        Já possui conta?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
