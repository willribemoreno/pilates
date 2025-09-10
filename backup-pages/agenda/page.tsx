"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Mode = "month" | "week" | "day" | "agenda"; // “agenda” = list view

export default function Agenda() {
  const [mode, setMode] = useState<Mode>("week");
  const calendarId = process.env.NEXT_PUBLIC_GCAL_CALENDAR_ID;

  const iframeSrc = useMemo(() => {
    if (!calendarId) return "";
    const params = new URLSearchParams({
      src: calendarId,
      ctz: "America/Sao_Paulo", // Timezone
      hl: "pt_BR", // Portuguese UI
      showTitle: "0",
      showPrint: "0",
      showTabs: "0",
      showCalendars: "0",
      showTz: "0",
      wkst: "2", // Week starts Monday
      mode, // month|week|day|agenda
      // You can add color & background params if desired
    });
    return `https://calendar.google.com/calendar/embed?${params.toString()}`;
  }, [calendarId, mode]);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      {/* Top bar: Left button + view switcher */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Left: Adicionar Novo Agendamento */}
        <a
          href="https://calendar.google.com/calendar/u/0/r/eventedit"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-700 via-blue-600 to-blue-500 px-4 py-2 font-semibold text-white shadow-md transition-all hover:brightness-105 hover:shadow-lg active:scale-95"
        >
          <span className="text-base">＋</span>
          <span>Adicionar Novo Agendamento</span>
        </a>

        {/* Right: view switcher (month / week / day / agenda) */}
        <div className="ml-auto flex items-center gap-1 rounded-xl border border-blue-900/10 bg-white p-1 shadow-sm dark:border-blue-200/10 dark:bg-gray-900">
          {[
            { k: "month", label: "Mês" },
            { k: "week", label: "Semana" },
            { k: "day", label: "Dia" },
            { k: "agenda", label: "Agenda" },
          ].map((v) => {
            const active = mode === (v.k as Mode);
            return (
              <button
                key={v.k}
                onClick={() => setMode(v.k as Mode)}
                className={[
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-gradient-to-r from-indigo-600 to-blue-500 text-white"
                    : "text-gray-700 hover:bg-blue-50/70 dark:text-gray-300 dark:hover:bg-blue-900/20",
                ].join(" ")}
                aria-pressed={active}
              >
                {v.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Calendar container */}
      <div className="overflow-hidden rounded-2xl border border-blue-900/10 bg-white shadow-[0_10px_30px_rgba(17,24,39,.12)] dark:border-blue-200/10 dark:bg-gray-900">
        {calendarId ? (
          <iframe
            key={iframeSrc} // force reload on mode change
            src={iframeSrc}
            className="h-[75vh] w-full"
            style={{ border: 0 }}
            title="Google Calendar"
          />
        ) : (
          <div className="p-6 text-sm text-gray-600 dark:text-gray-300">
            <p className="font-medium text-gray-800 dark:text-gray-100">
              Configuração necessária
            </p>
            <p className="mt-1">
              Defina{" "}
              <code className="rounded bg-gray-100 px-1 py-0.5 dark:bg-gray-800">
                NEXT_PUBLIC_GCAL_CALENDAR_ID
              </code>{" "}
              no seu{" "}
              <code className="rounded bg-gray-100 px-1 py-0.5 dark:bg-gray-800">
                .env.local
              </code>{" "}
              (ex.: <em>seuemail@gmail.com</em> ou o ID do calendário).
            </p>
            <p className="mt-2">
              Depois recarregue a página. Você pode tornar o calendário público
              ou garantir que o usuário logado tenha acesso a ele.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
