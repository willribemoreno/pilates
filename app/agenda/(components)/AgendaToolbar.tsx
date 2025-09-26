"use client";
import React from "react";

type Props = {
  view: "dayGridMonth" | "timeGridWeek" | "timeGridDay";
  onNew: () => void;
  onChangeView: (v: "dayGridMonth" | "timeGridWeek" | "timeGridDay") => void;
  headerBoxClass?: string;
};

export const AgendaToolbar: React.FC<Props> = ({ view, onNew, onChangeView, headerBoxClass = "" }) => {
  return (
    <>
      <button
        onClick={onNew}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-700 via-blue-600 to-blue-500 px-4 py-2 font-semibold text-white shadow-md transition-all hover:brightness-105 hover:shadow-lg active:scale-95"
      >
        <span className="text-base">＋</span>
        <span>Adicionar Novo Agendamento</span>
      </button>

      <div className={`ml-auto flex items-center gap-1 ${headerBoxClass}`}>
        {[
          { k: "dayGridMonth", label: "Mês" },
          { k: "timeGridWeek", label: "Semana" },
          { k: "timeGridDay", label: "Dia" },
        ].map((v) => {
          const active = view === (v.k as any);
          return (
            <button
              key={v.k}
              onClick={() => onChangeView(v.k as any)}
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
    </>
  );
};
