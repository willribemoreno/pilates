"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import { EventContentArg, DatesSetArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptBr from "@fullcalendar/core/locales/pt-br";

type Filters = {
  patient?: string;
  dateFrom?: string;
  dateTo?: string;
  date?: string; // YYYY-MM-DD
  time?: string; // HH:mm
  treatment?: string;
  vip?: "true" | "false" | "";
  professional?: string;
};

type NewEvent = {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  patientName: string;
  age?: string;
  treatment?: string;
  notes?: string;
  vip?: boolean;
  professional?: string;
  durationMinutes?: number;
  recurrenceMonths?: number; // NEW: number of months to repeat monthly (same time)
};

// simple idempotency key generator
function makeKey() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function AgendaPage() {
  const calendarRef = useRef<FullCalendar | null>(null);

  // FullCalendar view
  const [view, setView] = useState<
    "dayGridMonth" | "timeGridWeek" | "timeGridDay"
  >("timeGridWeek");
  const [visibleFrom, setVisibleFrom] = useState<string | null>(null);
  const [visibleTo, setVisibleTo] = useState<string | null>(null);

  const [events, setEvents] = useState<any[]>([]);
  const [filters, setFilters] = useState<Filters>({ vip: "" });

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
    vip: false,
    professional: "",
    durationMinutes: 60,
    recurrenceMonths: 0, // default: no recurrence
  });

  // seed a fresh idempotency key whenever modal opens
  useEffect(() => {
    if (open) setIdempotencyKey(makeKey());
  }, [open]);

  /**
   * Helper: go to filters.date (if set) or to today.
   */
  const gotoFilterDateOrToday = () => {
    const api = calendarRef.current?.getApi();
    if (!api) return;

    if (filters.date && /^\d{4}-\d{2}-\d{2}$/.test(filters.date)) {
      api.gotoDate(filters.date); // "YYYY-MM-DD"
    } else {
      api.today();
    }
  };

  // switch views using FC API; if going to Day view, align to filter date/today first
  const changeView = (
    next: "dayGridMonth" | "timeGridWeek" | "timeGridDay"
  ) => {
    const api = calendarRef.current?.getApi();
    if (!api) return;

    if (next === "timeGridDay") {
      gotoFilterDateOrToday();
    }

    api.changeView(next);
    setView(next);
    // datesSet will fire and update visibleFrom/visibleTo
  };

  // keep the Day view aligned when the date filter changes
  useEffect(() => {
    if (view === "timeGridDay") {
      gotoFilterDateOrToday();
    }
  }, [filters.date, view]);

  // called whenever the visible range changes
  const handleDatesSet = (arg: DatesSetArg) => {
    setVisibleFrom(arg.start.toISOString());
    setVisibleTo(arg.end.toISOString());
  };

  // fetch events for the visible range + filters
  const fetchEvents = useCallback(async () => {
    // if range not set yet, try to derive from calendar API
    let fromISO = visibleFrom;
    let toISO = visibleTo;

    if (!fromISO || !toISO) {
      const api = calendarRef.current?.getApi();
      if (api) {
        fromISO = api.view.activeStart.toISOString();
        toISO = api.view.activeEnd.toISOString();
      }
    }
    if (!fromISO || !toISO) return;

    const params = new URLSearchParams();
    params.set("from", fromISO);
    params.set("to", toISO);

    if (filters.patient) params.set("patient", filters.patient);
    if (filters.date) params.set("date", filters.date);
    if (filters.time) params.set("time", filters.time);
    if (filters.treatment) params.set("treatment", filters.treatment);
    if (filters.vip) params.set("vip", filters.vip);
    if (filters.professional) params.set("professional", filters.professional);

    const res = await fetch(`/api/calendar/events?${params.toString()}`, {
      cache: "no-store",
    });
    const json = await res.json();
    if (json.ok) setEvents(json.events);
  }, [visibleFrom, visibleTo, filters]);

  // refetch on range or filters changes
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // create a new event
  const onSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return; // guard against double-click
    setSaving(true);
    try {
      const res = await fetch("/api/calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, idempotencyKey }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Erro ao criar evento");

      setOpen(false);
      setForm({
        date: "",
        time: "",
        patientName: "",
        age: "",
        treatment: "",
        notes: "",
        vip: false,
        professional: "",
        durationMinutes: 60,
        recurrenceMonths: 0,
      });

      // Refresh current view
      await fetchEvents();
    } catch (err: any) {
      alert(err?.message ?? "Erro desconhecido");
    } finally {
      setSaving(false);
    }
  };

  // event render: detailed on "Day", concise on others
  const renderEventContent = (arg: EventContentArg) => {
    const vType = arg.view.type; // 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'
    const { timeText, event } = arg;
    const xp: any = event.extendedProps || {};
    const isVip = xp.vip;

    if (vType === "timeGridDay") {
      return (
        <div className="p-2 leading-snug">
          <div className="font-semibold">
            {isVip ? "⭐ " : ""}
            {xp.patientName || event.title}
          </div>
          <div className="text-xs opacity-90">{timeText}</div>
          {xp.age && <div className="text-xs">Idade: {xp.age}</div>}
          {xp.treatment && (
            <div className="text-xs">Tratamento: {xp.treatment}</div>
          )}
          {xp.professional && (
            <div className="text-xs">Profissional: {xp.professional}</div>
          )}
          {typeof xp.vip !== "undefined" && (
            <div className="text-xs">Aula VIP: {xp.vip ? "Sim" : "Não"}</div>
          )}
          {xp.notes && (
            <div className="mt-1 text-xs italic">Obs.: {xp.notes}</div>
          )}
        </div>
      );
    }

    // month/week
    return (
      <div className="p-1.5 leading-tight">
        <div className="truncate font-medium">
          {isVip ? "⭐ " : ""}
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
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Top bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setOpen(true)}
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
        <input
          placeholder="Profissional"
          className="rounded-xl border border-blue-900/20 bg-white px-3 py-2 text-sm text-gray-800 dark:border-gray-600/50 dark:bg-gray-800 dark:text-gray-100"
          value={filters.professional ?? ""}
          onChange={(e) =>
            setFilters((f) => ({ ...f, professional: e.target.value }))
          }
        />
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
          slotMinTime="07:00:00"
          slotMaxTime="21:00:00"
          firstDay={1}
          eventDisplay="block"
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }}
          locale={ptBr}
          eventClassNames={() =>
            "rounded-md border border-blue-900/10 bg-blue-500/90 text-white dark:border-blue-200/10"
          }
          datesSet={handleDatesSet}
          eventContent={renderEventContent}
        />
      </div>

      {/* New event modal */}
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
                Novo Agendamento
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
                <input
                  value={form.treatment}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, treatment: e.target.value }))
                  }
                  placeholder="Ex.: Studio Pilates"
                  className="mt-1 w-full rounded-xl border border-blue-900/20 bg-white px-3 py-2 text-gray-800 disabled:opacity-60 dark:border-gray-600/50 dark:bg-gray-800 dark:text-gray-100"
                  disabled={saving}
                />
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

              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={form.vip}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, vip: e.target.checked }))
                  }
                  className="h-4 w-4 accent-blue-600"
                  disabled={saving}
                />
                Aula VIP
              </label>

              <label className="text-sm text-gray-700 dark:text-gray-300">
                Nome do profissional
                <input
                  value={form.professional}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, professional: e.target.value }))
                  }
                  placeholder="Ex.: Paula Moreno"
                  className="mt-1 w-full rounded-xl border border-blue-900/20 bg-white px-3 py-2 text-gray-800 disabled:opacity-60 dark:border-gray-600/50 dark:bg-gray-800 dark:text-gray-100"
                  disabled={saving}
                />
              </label>

              <label className="text-sm text-gray-700 dark:text-gray-300">
                Duração (min)
                <input
                  type="number"
                  min={15}
                  step={15}
                  value={form.durationMinutes}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      durationMinutes: Number(e.target.value),
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-blue-900/20 bg-white px-3 py-2 text-gray-800 disabled:opacity-60 dark:border-gray-600/50 dark:bg-gray-800 dark:text-gray-100"
                  disabled={saving}
                />
              </label>

              {/* NEW: Recurrence in months */}
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
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
