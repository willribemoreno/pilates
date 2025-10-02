"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function GoogleButton() {
  const [loading, setLoading] = useState(false);
  const search = useSearchParams();
  const next = search.get("next") || "/practitioner/agenda";

  async function onGoogle() {
    try {
      setLoading(true);
      await authClient.signIn.social({
        provider: "google",
        callbackURL: next,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onGoogle}
      disabled={loading}
      aria-busy={loading}
      className={[
        "group relative w-full",
        // Surface + shape (reference style)
        "rounded-xl bg-white dark:bg-gray-900",
        "border border-blue-900/15 dark:border-blue-200/15",
        "shadow-sm hover:shadow transition-shadow",
        // Spacing + typography
        "px-4 py-2.5 text-sm font-medium text-gray-800 dark:text-gray-100",
        // Subtle brand hover using your tokens
        "hover:bg-blue-50/60 dark:hover:bg-blue-900/20",
        "focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        "flex items-center justify-center gap-3",
      ].join(" ")}
    >
      {/* Multicolor Google G (SVG paths from Google brand guidelines) */}
      <svg
        className="h-5 w-5"
        viewBox="0 0 48 48"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="#EA4335"
          d="M24 9.5c3.54 0 6.7 1.22 9.19 3.6l6.88-6.88C35.9 2.4 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.2l7.97 6.18C12.33 13.18 17.69 9.5 24 9.5z"
        />
        <path
          fill="#34A853"
          d="M46.08 24.55c0-1.59-.14-3.11-.41-4.55H24v9.12h12.38c-.53 2.86-2.12 5.28-4.53 6.91l7 5.41C43.56 37.47 46.08 31.51 46.08 24.55z"
        />
        <path
          fill="#4A90E2"
          d="M33.85 36.03c-1.99 1.35-4.54 2.17-7.85 2.17-6.31 0-11.67-3.68-13.47-8.88l-7.97 6.15C8.51 43.12 15.62 48 24 48c5.93 0 10.94-1.95 14.59-5.31l-4.74-6.66z"
        />
        <path
          fill="#FBBC05"
          d="M12.53 29.32A14.49 14.49 0 0 1 11.5 24c0-1.85.33-3.63.94-5.28l-7.97-6.18C2.02 15.66 0.96 19.7 0.96 24c0 4.3 1.06 8.34 3.51 11.46l8.06-6.14z"
        />
      </svg>

      <span>{loading ? "Conectando..." : "Continuar com Google"}</span>

      {/* Subtle gloss/shine on hover (reference-style polish) */}
      <span className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-white/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:from-white/10" />
    </button>
  );
}
