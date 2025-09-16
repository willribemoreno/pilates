"use client";

import {
  DatesSetArg,
  EventContentArg,
  EventApi,
  EventClickArg,
} from "@fullcalendar/core";
import ptBr from "@fullcalendar/core/locales/pt-br";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useCallback, useEffect, useRef, useState } from "react";

type Filters = {
  patient?: string;
  dateFrom?: string;
  dateTo?: string;
  date?: string; // YYYY-MM-DD
  time?: string; // HH:mm
  treatment?: string;
  professional?: string;
};

type NewEvent = {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  patientName: string;
  age?: string;
  treatment?: string;
  notes?: string;
  professional?: string;
  durationMinutes?: number; // default 50
  recurrenceMonths?: number;
};

type Presence = "ATENDIDO" | "DESMARCADO" | "FALTOU" | "NAO_PREENCHIDO";
type Mode = "create" | "edit";

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const hm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

// simple idempotency key generator
function makeKey() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Calculates the duration from a range string like "16:00 - 17:00". */
function getDurationInMinutes(range: string): number {
  const [start, end] = range.split("-").map((s) => s.trim());
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const sTot = sh * 60 + sm;
  let eTot = eh * 60 + em;
  if (eTot < sTot) eTot += 24 * 60;
  return eTot - sTot;
}

export default function AgendaPage() {
  const calendarRef = useRef<FullCalendar | null>(null);

  // mode/editing
  const [mode, setMode] = useState<Mode>("create");
  const [editingId, setEditingId] = useState<string | null>(null);

  // presence (only editable in edit mode)
  const [presence, setPresence] = useState<Presence>("NAO_PREENCHIDO");

  // FullCalendar view
  const [view, setView] = useState<
    "dayGridMonth" | "timeGridWeek" | "timeGridDay"
  >("timeGridWeek");

  const [events, setEvents] = useState<any[]>([]);
  const [filters, setFilters] = useState<Filters>({});

  // Modal + form
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState<string>("");

  const [form, setForm] = useState<NewEvent>({
    date: "",
    time: "",
    patientName: "",
    age: "",
    treatment: "",
    notes: "",
    professional: "",
    durationMinutes: 50,
    recurrenceMonths: 0,
  });

  // seed a fresh idempotency key whenever modal opens
  useEffect(() => {
    if (open) setIdempotencyKey(makeKey());
  }, [open]);

  /** Prefill modal from a clicked event and open in EDIT mode */
  const openEditFromEvent = useCallback((evt: EventApi) => {
    const xp = (evt.extendedProps ?? {}) as any;
    const start = evt.start!;
    const end = evt.end ?? new Date(start.getTime() + 50 * 60 * 1000);

    setForm({
      date: ymd(start),
      time: hm(start),
      patientName: xp.patientName || evt.title || "",
      age: xp.age ?? "",
      treatment: xp.treatment ?? "",
      notes: xp.notes ?? "",
      professional: xp.professional ?? "",
      durationMinutes: Math.max(
        15,
        Math.round((end.getTime() - start.getTime()) / 60000)
      ),
      recurrenceMonths: 0,
    });

    setPresence((xp.presence as Presence) ?? "NAO_PREENCHIDO");
    setMode("edit");
    setEditingId(evt.id);
    setOpen(true);
  }, []);

  /** Go to filters.date (if set) or today. */
  const gotoFilterDateOrToday = () => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    if (filters.date && /^\d{4}-\d{2}-\d{2}$/.test(filters.date)) {
      api.gotoDate(filters.date);
    } else {
      api.today();
    }
  };

  /** Change view and nudge sizing. */
  const changeView = (
    next: "dayGridMonth" | "timeGridWeek" | "timeGridDay"
  ) => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    if (next === "timeGridDay") gotoFilterDateOrToday();
    api.changeView(next);
    requestAnimationFrame(() => api.updateSize());
    setView(next);
  };

  useEffect(() => {
    if (view === "timeGridDay") gotoFilterDateOrToday();
  }, [filters.date, view]);

  const handleDatesSet = (_: DatesSetArg) => {
    fetchEvents();
  };

  const fetchEvents = useCallback(async () => {
    const api = calendarRef.current?.getApi();
    if (!api) return;

    const start = api.view.activeStart;
    const end = api.view.activeEnd;

    const params = new URLSearchParams();
    params.set("from", start.toISOString());
    params.set("to", end.toISOString());

    if (filters.patient) params.set("patient", filters.patient);
    if (filters.date) params.set("date", filters.date);
    if (filters.time) params.set("time", filters.time);
    if (filters.treatment) params.set("treatment", filters.treatment);
    if (filters.professional) params.set("professional", filters.professional);

    const res = await fetch(`/api/calendar/events?${params.toString()}`, {
      cache: "no-store",
    });
    const json = await res.json();
    if (json.ok) setEvents(json.events);
  }, [filters]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // ---- Desktop + Mobile edit trigger ----
  const onEventClick = useCallback(
    (info: EventClickArg) => {
      const e = info.jsEvent as any;

      // PointerEvent on modern browsers gives us the input type
      const pointerType = e?.pointerType as string | undefined;
      const isTouchLike =
        pointerType === "touch" ||
        pointerType === "pen" ||
        // fallback if PointerEvent not available
        (typeof window !== "undefined" && "ontouchstart" in window);

      if (isTouchLike) {
        // Mobile/pen: single tap opens edit
        openEditFromEvent(info.event);
        return;
      }

      // Desktop mouse: open only on double-click (detail === 2)
      if (e?.detail >= 2) {
        openEditFromEvent(info.event);
      }
      // otherwise ignore single click
    },
    [openEditFromEvent]
  );

  // create OR update
  const onSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      if (mode === "edit" && editingId) {
        const payload = { id: editingId, ...form, presence };
        const res = await fetch("/api/calendar/events", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error ?? "Erro ao atualizar evento");
      } else {
        const payload = {
          ...form,
          durationMinutes: 50,
          idempotencyKey,
          presence: "NAO_PREENCHIDO" as Presence,
        };
        const res = await fetch("/api/calendar/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error ?? "Erro ao criar evento");
      }

      setOpen(false);
      setMode("create");
      setEditingId(null);
      setPresence("NAO_PREENCHIDO");
      setForm({
        date: "",
        time: "",
        patientName: "",
        age: "",
        treatment: "",
        notes: "",
        professional: "",
        durationMinutes: 50,
        recurrenceMonths: 0,
      });

      calendarRef.current?.getApi()?.refetchEvents();
      await fetchEvents();
    } catch (err: any) {
      alert(err?.message ?? "Erro desconhecido");
    } finally {
      setSaving(false);
    }
  };

  // event render: detailed on "Day", concise on others
  const renderEventContent = (arg: EventContentArg) => {
    const vType = arg.view.type;
    const { timeText, event } = arg;
    const xp: any = event.extendedProps || {};

    if (vType === "timeGridDay") {
      return (
        <div className="flex gap-0 p-1 divide-x">
          <div className="flex flex-col flex-1 p-0 leading-tight text-left justify-end min-w-0">
            <div className="truncate font-semibold">
              {xp.patientName || event.title}
            </div>
            <div className="truncate text-xs opacity-90">{timeText}</div>
          </div>
          <div className="flex flex-col flex-1 p-0 leading-tight text-left ml-1 min-w-0">
            <div className="truncate text-xs opacity-90">
              <span className="font-semibold">Profissional:</span>{" "}
              {xp.professional}
            </div>
            <div className="truncate text-xs opacity-90">
              <span className="font-semibold">Tratamento:</span>{" "}
              {xp.treatment}
            </div>
          </div>
        </div>
      );
    }

    if (getDurationInMinutes(timeText) < 50) {
      return (
        <div className="leading-tight justify-start text-start text-xs h-full w-full items-start">
          <div className="truncate">{xp.patientName || event.title}</div>
        </div>
      );
    }

    return (
      <div className="leading-tight flex flex-col justify-start">
        <div className="truncate font-medium">
          {xp.patientName || event.title}
        </div>
        {timeText && <div className="text-[11px] opacity-90">{timeText}</div>}
        {xp.treatment && (
          <div className="mt-0.5 inline-block rounded bg-white/15 px-1.5 py-[1px] text-[10px]">
            {xp.treatment}
          </div>
        )}
      </div>
    );
  };

  const headerBox =
    "rounded-xl border border-blue-900/10 bg-white p-1 shadow-sm dark:border-blue-200/10 dark:bg-gray-900";

  return (
    // <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
    <main className="container max-w-screen p-8">
      {/* Top bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => {
            setMode("create");
            setEditingId(null);
            setPresence("NAO_PREENCHIDO");
            setForm({
              date: "",
              time: "",
              patientName: "",
              age: "",
              treatment: "",
              notes: "",
              professional: "",
              durationMinutes: 50,
              recurrenceMonths: 0,
            });
            setOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-700 via-blue-600 to-blue-500 px-4 py-2 font-semibold text-white shadow-md transition-all hover:brightness-105 hover:shadow-lg active:scale-95"
        >
          <span className="text-base">＋</span>
          <span>Adicionar Novo Agendamento</span>
        </button>

        <div className={`ml-auto flex items-center gap-1 ${headerBox}`}>
          {[
            { k: "dayGridMonth", label: "Mês" },
            { k: "timeGridWeek", label: "Semana" },
            { k: "timeGridDay", label: "Dia" },
          ].map((v) => {
            const active = view === (v.k as any);
            return (
              <button
                key={v.k}
                onClick={() => changeView(v.k as any)}
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

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-3 lg:grid-cols-6">
        <input
          placeholder="Nome do paciente"
          className="rounded-xl border border-blue-900/20 bg-white px-3 py-2 text-sm text-gray-800 dark:border-gray-600/50 dark:bg-gray-800 dark:text-gray-100"
          value={filters.patient ?? ""}
          onChange={(e) =>
            setFilters((f) => ({ ...f, patient: e.target.value }))
          }
        />
        <input
          type="date"
          placeholder="Data"
          className="rounded-xl border border-blue-900/20 bg-white px-3 py-2 text-sm text-gray-800 dark:border-gray-600/50 dark:bg-gray-800 dark:text-gray-100"
          value={filters.date ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))}
        />
        <select
          value={form.treatment}
          onChange={(e) =>
            setFilters((f) => ({ ...f, professional: e.target.value }))
          }
          className="rounded-xl border border-blue-900/20 bg-white px-3 py-2 text-sm text-gray-800 dark:border-gray-600/50 dark:bg-gray-800 dark:text-gray-100"
          disabled={saving}
        >
          <option value="" disabled hidden>
            Profissional
          </option>
          <option value="Pilates">Pilates</option>
          <option value="Fisioterapia">Fisioterapia</option>
        </select>
        <button
          onClick={() =>
            setFilters((f) => ({
              ...f,
              patient: "",
              date: "",
              professional: "",
            }))
          }
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-700 via-blue-600 to-blue-500 px-4 py-2 font-semibold text-white shadow-md transition-all hover:brightness-105 hover:shadow-lg active:scale-95"
        >
          <span className="text-base"></span>
          <span>Limpar Filtros</span>
        </button>
      </div>

      {/* Calendar */}
      <div className="overflow-hidden rounded-2xl border border-blue-900/10 bg-white shadow-[0_10px_30px_rgba(17,24,39,.12)] dark:border-blue-200/10 dark:bg-gray-900">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={view}
          headerToolbar={false}
          height="75vh"
          events={events}
          nowIndicator
          allDaySlot={false}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          firstDay={1}
          eventDisplay="block"
          eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
          locale={ptBr}
          eventClassNames={() =>
            "cursor-pointer rounded-md border border-blue-900/10 bg-blue-500/90 text-white dark:border-blue-200/10 w-full"
          }
          datesSet={handleDatesSet}
          eventContent={renderEventContent}
          eventClick={onEventClick}
        />
      </div>

      {/* Modal */}
      {open && (
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
                onClick={() => !saving && setOpen(false)}
                disabled={saving}
                className="rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-blue-50/70 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-blue-900/20"
              >
                Fechar
              </button>
            </div>

            <form
              onSubmit={onSubmitNew}
              className="grid grid-cols-1 gap-3 md:grid-cols-2"
            >
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Data
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
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
                  onChange={(e) =>
                    setForm((f) => ({ ...f, time: e.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-blue-900/20 bg-white px-3 py-2 text-gray-800 disabled:opacity-60 dark:border-gray-600/50 dark:bg-gray-800 dark:text-gray-100"
                  disabled={saving}
                />
              </label>

              <label className="text-sm text-gray-700 dark:text-gray-300 md:col-span-2">
                Nome do paciente
                <input
                  required
                  value={form.patientName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, patientName: e.target.value }))
                  }
                  placeholder="Ex.: João da Silva"
                  className="mt-1 w-full rounded-xl border border-blue-900/20 bg-white px-3 py-2 text-gray-800 disabled:opacity-60 dark:border-gray-600/50 dark:bg-gray-800 dark:text-gray-100"
                  disabled={saving}
                />
              </label>

              <label className="text-sm text-gray-700 dark:text-gray-300">
                Idade
                <input
                  value={form.age}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, age: e.target.value }))
                  }
                  placeholder="Ex.: 34"
                  className="mt-1 w-full rounded-xl border border-blue-900/20 bg-white px-3 py-2 text-gray-800 disabled:opacity-60 dark:border-gray-600/50 dark:bg-gray-800 dark:text-gray-100"
                  disabled={saving}
                />
              </label>

              <label className="text-sm text-gray-700 dark:text-gray-300">
                Tratamento
                <select
                  value={form.treatment}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, treatment: e.target.value }))
                  }
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
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
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
                  onChange={(e) =>
                    setForm((f) => ({ ...f, professional: e.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-blue-900/20 bg-white px-3 py-2 text-gray-800 disabled:opacity-60 dark:border-gray-600/50 dark:bg-gray-800 dark:text-gray-100"
                  disabled={saving}
                >
                  <option value="">Selecione...</option>
                  <option value="Paula">Paula</option>
                  <option value="Ester">Ester</option>
                  <option value="Beatriz">Beatriz</option>
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
                      durationMinutes: Math.max(
                        15,
                        Number(e.target.value || 50)
                      ),
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
                      recurrenceMonths: Math.max(
                        0,
                        Number(e.target.value || 0)
                      ),
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-blue-900/20 bg-white px-3 py-2 text-gray-800 disabled:opacity-60 dark:border-gray-600/50 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Ex.: 0 (sem recorrência), 3, 6, 12..."
                  disabled={saving}
                />
              </label>

              {/* Status do atendimento (só no modo Editar) */}
              {mode === "edit" && (
                <fieldset className="md:col-span-2 rounded-xl border border-blue-900/20 p-3">
                  <legend className="px-1 text-sm font-medium text-gray-800 dark:text-gray-100">
                    Status do atendimento
                  </legend>
                  <div className="mt-2 grid gap-2 text-sm text-gray-800 dark:text-gray-100">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="not-filled"
                        className="size-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={presence === "NAO_PREENCHIDO"}
                        onChange={() => setPresence("NAO_PREENCHIDO")}
                      />
                      <span>Não preenchido</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="presence"
                        className="size-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={presence === "ATENDIDO"}
                        onChange={() => setPresence("ATENDIDO")}
                      />
                      <span>Atendimento realizado</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="presence"
                        className="size-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={presence === "DESMARCADO"}
                        onChange={() => setPresence("DESMARCADO")}
                      />
                      <span>Desmarcou</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="presence"
                        className="size-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={presence === "FALTOU"}
                        onChange={() => setPresence("FALTOU")}
                      />
                      <span>Faltou</span>
                    </label>
                  </div>
                </fieldset>
              )}

              <div className="mt-2 flex justify-end gap-2 md:col-span-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
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
      )}
    </main>
  );
}
