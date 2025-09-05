// components/ContactForm.tsx
"use client";

import { redirectToWhatsApp } from "@/lib/actions";
import { useActionState, useState } from "react";

export default function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [, formAction] = useActionState(redirectToWhatsApp, "");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    // event.preventDefault(); // Prevent the default form submission
    const formData = new FormData(event.currentTarget); // Get the form data
    formAction(formData); // Call formAction with the form data
  }

  // // no-op submit for now
  // async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
  //   e.preventDefault();
  //   setSubmitting(true);
  //   try {
  //     // await fetch('/api/contact', { method: 'POST', body: new FormData(e.currentTarget) })
  //     await new Promise((r) => setTimeout(r, 800));
  //     alert("Mensagem enviada! (demo)");
  //   } finally {
  //     setSubmitting(false);
  //   }
  // }

  return (
    <section
      id="contato"
      className="mx-auto my-14 max-w-6xl px-5"
      aria-label="Contato"
    >
      <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-100">
        Agende sua aula
      </h2>

      <form
        onSubmit={onSubmit}
        className="grid gap-4 rounded-2xl border border-blue-900/10 bg-white p-6 shadow-[0_10px_30px_rgba(17,24,39,.12)]
                   dark:border-blue-200/10 dark:bg-gray-900"
      >
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Nome
          <input
            name="name"
            aria-label="Nome"
            type="text"
            placeholder="Seu nome"
            required
            className="mt-1 w-full rounded-xl border border-blue-900/20 bg-white px-3 py-3 text-gray-800
                       dark:border-gray-600/50 dark:bg-gray-800 dark:text-gray-100"
          />
        </label>

        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          E-mail
          <input
            name="email"
            aria-label="E-mail"
            type="email"
            placeholder="voce@email.com"
            required
            className="mt-1 w-full rounded-xl border border-blue-900/20 bg-white px-3 py-3 text-gray-800
                       dark:border-gray-600/50 dark:bg-gray-800 dark:text-gray-100"
          />
        </label>

        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Mensagem
          <textarea
            name="message"
            aria-label="Mensagem"
            rows={4}
            placeholder="Conte seu objetivo"
            className="mt-1 w-full resize-y rounded-xl border border-blue-900/20 bg-white px-3 py-3 text-gray-800
                       dark:border-gray-600/50 dark:bg-gray-800 dark:text-gray-100"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-fit items-center justify-center rounded-xl
                     bg-gradient-to-br from-blue-700 to-blue-600 px-4 py-3 font-semibold text-white
                     shadow-[0_8px_18px_rgba(37,99,235,.35)]
                     hover:brightness-105 disabled:opacity-60"
        >
          {submitting ? "Enviando..." : "Enviar"}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 ml-2"
          >
            <path
              fillRule="evenodd"
              d="M12 2C6.48 2 2 6.48 2 12c0 1.89.52 3.66 1.42 5.19L2 22l4.81-1.42C8.34 21.48 10.11 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2m0 18c-1.61 0-3.14-.44-4.49-1.27l-.32-.19-2.85.85.85-2.85-.19-.32A8.376 8.376 0 0 1 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8m3.47-5.62c-.19-.1-1.12-.55-1.3-.61-.18-.07-.31-.1-.44.1-.13.19-.5.61-.61.73-.11.13-.23.15-.43.05-.19-.1-.8-.29-1.52-.91-.56-.49-.94-1.09-1.05-1.28-.11-.19-.01-.3.09-.4.09-.09.19-.23.29-.34.1-.12.13-.19.19-.31.06-.12.03-.23-.01-.32-.04-.09-.44-1.06-.61-1.46-.16-.39-.33-.34-.44-.35-.11 0-.24-.01-.36-.01s-.32.05-.48.23c-.16.18-.63.61-.63 1.48s.64 1.72.73 1.84c.09.12 1.27 1.93 3.07 2.71.43.18.76.29 1.02.37.43.14.81.12 1.12.07.34-.05 1.12-.46 1.28-.91.16-.44.16-.81.11-.91s-.17-.13-.36-.23"
            />
          </svg>
        </button>
      </form>
    </section>
  );
}
