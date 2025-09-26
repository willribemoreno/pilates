"use client";
import React from "react";
import { Presence, NewEvent, Mode } from "../(types)/agendaTypes";

type Props = {
  open: boolean;
  saving: boolean;
  mode: Mode;
  presence: Presence;
  professionals: { name: string }[];
  form: NewEvent;
  setForm: React.Dispatch<React.SetStateAction<NewEvent>>;
  setPresence: React.Dispatch<React.SetStateAction<Presence>>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
};

export const AgendaModal: React.FC<Props> = ({
  open, saving, mode, presence, professionals, form, setForm, setPresence, onClose, onSubmit,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className={`w-full max-w-xl rounded-2xl border border-blue-900/10 bg-white p-6 shadow-xl dark:border-blue-200/10 dark:bg-gray-900 ${
          saving ? "pointer-events-none opacity-90" : ""
        }`}
        aria-busy={saving}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {mode === "edit" ? "Editar Agendamento" : "Novo Agendamento"}
          </h3>
          <button
            onClick={() => !saving && onClose()}
            disabled={saving}
            className="rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-blue-50/70 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-blue-900/20"
          >
            Fechar
          </button>
        </div>

        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">
            Data
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-blue-900/20 bg-white px-3 py-2 text-gray-800 disabled:opacity-60 dark:border-gray-600/50 dark:bg-gray-800 dark:text-gray-100"
              disabled={saving}
            />
          </label>

          <label className="text-sm text-gray-700 dark:text-gray-300">
            Horário
            <input
              type="time"
              required
              value={form.time}
              onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-blue-900/20 bg-white px-3 py-2 text-gray-800 disabled:opacity-60 dark:border-gray-600/50 dark:bg-gray-800 dark:text-gray-100"
              disabled={saving}
            />
          </label>

          <label className="text-sm text-gray-700 dark:text-gray-300 md:col-span-2">
            Nome do paciente
            <input
              required
              value={form.patientName}
              onChange={(e) => setForm((f) => ({ ...f, patientName: e.target.value }))}
              placeholder="Ex.: João da Silva"
              className="mt-1 w-full rounded-xl border border-blue-900/20 bg-white px-3 py-2 text-gray-800 disabled:opacity-60 dark:border-gray-600/50 dark:bg-gray-800 dark:text-gray-100"
              disabled={saving}
            />
          </label>

          <label className="text-sm text-gray-700 dark:text-gray-300">
            Idade
            <input
              value={form.age}
              onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
              placeholder="Ex.: 34"
              className="mt-1 w-full rounded-xl border border-blue-900/20 bg-white px-3 py-2 text-gray-800 disabled:opacity-60 dark:border-gray-600/50 dark:bg-gray-800 dark:text-gray-100"
              disabled={saving}
            />
          </label>

          <label className="text-sm text-gray-700 dark:text-gray-300">
            Tratamento
            <select
              value={form.treatment}
              onChange={(e) => setForm((f) => ({ ...f, treatment: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-blue-900/20 bg-white px-3 py-2 text-gray-800 disabled:opacity-60 dark:border-gray-600/50 dark:bg-gray-800 dark:text-gray-100"
              disabled={saving}
            >
              <option value="">Selecione...</option>
              <option value="Pilates">Pilates</option>
              <option value="Fisioterapia">Fisioterapia</option>
            </select>
          </label>

          <label className="text-sm text-gray-700 dark:text-gray-300 md:col-span-2">
            Observação
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="mt-1 w-full rounded-xl border border-blue-900/20 bg-white px-3 py-2 text-gray-800 disabled:opacity-60 dark:border-gray-600/50 dark:bg-gray-800 dark:text-gray-100"
              placeholder="Ex.: Dor lombar, evitar exercício X"
              disabled={saving}
            />
          </label>

          <label className="text-sm text-gray-700 dark:text-gray-300">
            Nome do profissional
            <select
              value={form.professional}
              onChange={(e) => setForm((f) => ({ ...f, professional: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-blue-900/20 bg-white px-3 py-2 text-gray-800 disabled:opacity-60 dark:border-gray-600/50 dark:bg-gray-800 dark:text-gray-100"
              disabled={saving}
            >
              {professionals.map((p) => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
            </select>
          </label>

          <label className="text-sm text-gray-700 dark:text-gray-300">
            Duração (min)
            <input
              type="number"
              min={15}
              step={5}
              value={form.durationMinutes ?? 50}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  durationMinutes: Math.max(15, Number(e.target.value || 50)),
                }))
              }
              className="mt-1 w-full rounded-xl border border-blue-900/20 bg-white px-3 py-2 text-gray-800 disabled:opacity-60 dark:border-gray-600/50 dark:bg-gray-800 dark:text-gray-100"
              disabled={saving}
            />
          </label>

          <label className="text-sm text-gray-700 dark:text-gray-300">
            Recorrência (meses)
            <input
              type="number"
              min={0}
              step={1}
              value={form.recurrenceMonths ?? 0}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  recurrenceMonths: Math.max(0, Number(e.target.value || 0)),
                }))
              }
              className="mt-1 w-full rounded-xl border border-blue-900/20 bg-white px-3 py-2 text-gray-800 disabled:opacity-60 dark:border-gray-600/50 dark:bg-gray-800 dark:text-gray-100"
              placeholder="Ex.: 0 (sem recorrência), 3, 6, 12..."
              disabled={saving}
            />
          </label>

          <fieldset className="md:col-span-2 rounded-xl border border-blue-900/20 p-3">
            <legend className="px-1 text-sm font-medium text-gray-800 dark:text-gray-100">
              Status do atendimento
            </legend>
            <div className="mt-2 grid gap-2 text-sm text-gray-800 dark:text-gray-100">
              {[
                { val: "NAO_PREENCHIDO", label: "Não preenchido" },
                { val: "ATENDIDO", label: "Atendimento realizado" },
                { val: "DESMARCADO", label: "Desmarcou" },
                { val: "FALTOU", label: "Faltou" },
              ].map((r) => (
                <label key={r.val} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="presence"
                    className="size-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={presence === (r.val as Presence)}
                    onChange={() => setPresence(r.val as Presence)}
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-2 flex justify-end gap-2 md:col-span-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50/70 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-blue-900/20"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              aria-busy={saving}
              className="rounded-xl bg-gradient-to-r from-indigo-700 via-blue-600 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:brightness-105 disabled:opacity-60"
            >
              {saving ? "Salvando..." : mode === "edit" ? "Atualizar" : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
