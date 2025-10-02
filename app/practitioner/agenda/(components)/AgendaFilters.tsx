"use client";
import React from "react";
import { Filters } from "../(types)/agendaTypes";

type Props = {
  filters: Filters;
  saving: boolean;
  onChange: React.Dispatch<React.SetStateAction<Filters>>;
  onClear: () => void;
};

export const AgendaFilters: React.FC<Props> = ({ filters, saving, onChange, onClear }) => {
  return (
    <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-3 lg:grid-cols-6">
      <input
        placeholder="Nome do paciente"
        className="rounded-xl border border-blue-900/20 bg-white px-3 py-2 text-sm text-gray-800 dark:border-gray-600/50 dark:bg-gray-800 dark:text-gray-100"
        value={filters.patient ?? ""}
        onChange={(e) => onChange((f) => ({ ...f, patient: e.target.value }))}
      />
      <input
        type="date"
        placeholder="Data"
        className="rounded-xl border border-blue-900/20 bg-white px-3 py-2 text-sm text-gray-800 dark:border-gray-600/50 dark:bg-gray-800 dark:text-gray-100"
        value={filters.date ?? ""}
        onChange={(e) => onChange((f) => ({ ...f, date: e.target.value }))}
      />
      <select
        value={filters.treatment ?? "Todos os tratamentos"}
        onChange={(e) => onChange((f) => ({ ...f, treatment: e.target.value }))}
        className="rounded-xl border border-blue-900/20 bg-white px-3 py-2 text-sm text-gray-800 dark:border-gray-600/50 dark:bg-gray-800 dark:text-gray-100"
        disabled={saving}
      >
        <option value="" disabled hidden>
          Tipo de Tratamento
        </option>
        <option value="">Todos os tratamentos</option>
        <option value="Pilates">Pilates</option>
        <option value="Fisioterapia">Fisioterapia</option>
      </select>
      <button
        onClick={onClear}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-700 via-blue-600 to-blue-500 px-4 py-2 font-semibold text-white shadow-md transition-all hover:brightness-105 hover:shadow-lg active:scale-95"
      >
        <span className="text-base"></span>
        <span>Limpar Filtros</span>
      </button>
    </div>
  );
};
