"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section
      id="inicio"
      className="
        relative overflow-hidden text-white
        rounded-b-[36px]
        bg-gradient-to-br from-indigo-900 via-blue-600 to-blue-300
        [--r:1200px] [--h:600px]
      "
      aria-label="Início"
    >
      {/* Radial accent */}
      <div
        className="pointer-events-none absolute -top-[50%] right-[10%] h-[600px] w-[1200px] rounded-full
                   bg-[radial-gradient(closest-side,rgba(96,165,250,0.25),transparent_70%)]"
        aria-hidden
      />

      {/* Centered container */}
      <div className="mx-auto flex flex-col items-center justify-center px-5 py-24 text-center">
        <h1 className="mb-3 text-balance text-[clamp(2.2rem,4vw,3.4rem)] font-bold leading-tight">
          Transforme seu corpo com Pilates
        </h1>
        <p className="mb-7 text-[1.05rem]/relaxed opacity-95 max-w-2xl">
          Fortaleça, alongue e respire em um ambiente acolhedor. Métodos
          seguros, progressivos e personalizados para o seu ritmo.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="#contato"
            className="rounded-xl bg-white px-4 py-3 font-bold text-blue-600 shadow-[0_10px_24px_rgba(255,255,255,.2)]
                       hover:brightness-105"
          >
            Faça uma aula experimental
          </Link>
          <Link
            href="#aulas"
            className="rounded-xl border border-white/70 px-4 py-[11px] font-bold text-white
                       backdrop-blur-[2px] hover:bg-white/10"
          >
            Ver modalidades
          </Link>
        </div>
      </div>
    </section>
  );
}
