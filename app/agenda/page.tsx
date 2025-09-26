"use client";

import { useCallback, useEffect, useRef, useState, startTransition } from "react";
import FullCalendar from "@fullcalendar/react";
import { EventApi } from "@fullcalendar/core";
import { Presence, Filters, NewEvent, Mode } from "./(types)/agendaTypes";
import { professionals } from "./(static)/agendaStaticObjects";
import { getDurationInMinutes, presencePtToEnum, makeKey } from "./(util)/util";

// small helpers
const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const hm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

import { AgendaToolbar } from "./(components)/AgendaToolbar";
import { AgendaFilters } from "./(components)/AgendaFilters";
import { AgendaCalendar } from "./(components)/AgendaCalendar";
import { AgendaModal } from "./(components)/AgendaModal";

export default function AgendaPage() {
  const calendarRef = useRef<FullCalendar | null>(null);

  // mode/editing
  const [mode, setMode] = useState<Mode>("create");
  const [editingId, setEditingId] = useState<string | null>(null);

  // presence (only editable in edit mode)
  const [presence, setPresence] = useState<Presence>("NAO_PREENCHIDO");

  // FullCalendar view
  const [view, setView] = useState<"dayGridMonth" | "timeGridWeek" | "timeGridDay">("timeGridDay");

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
    presence: "Não preenchido",
  });

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
      durationMinutes: Math.max(15, Math.round((end.getTime() - start.getTime()) / 60000)),
      recurrenceMonths: 0,
      presence: xp.presence || "Não preenchido",
    });

    setPresence(presencePtToEnum(xp.presence));
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
  const changeView = (next: "dayGridMonth" | "timeGridWeek" | "timeGridDay") => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    if (next === "timeGridDay") gotoFilterDateOrToday();
    api.changeView(next);
    requestAnimationFrame(() => api.updateSize());
    setView(next);
  };

  // fetcher
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

    const res = await fetch(`/api/calendar/events?${params.toString()}`, { cache: "no-store" });
    const json = await res.json();
    if (json.ok) startTransition(() => setEvents(json.events));
  }, [filters]);

  // refetch on filters change
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // create OR update
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      if (mode === "edit" && editingId) {
        const payload = { id: editingId, ...form, presence };
        const res = await fetch("/api/calendar/events", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error ?? "Erro ao atualizar evento");
      } else {
        const payload = { ...form, durationMinutes: 50, idempotencyKey, presence: "NAO_PREENCHIDO" as Presence };
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
        date: "", time: "", patientName: "", age: "", treatment: "", notes: "", professional: "",
        durationMinutes: 50, recurrenceMonths: 0, presence: "Não preenchido",
      });

      queueMicrotask(() => fetchEvents());
    } catch (err: any) {
      alert(err?.message ?? "Erro desconhecido");
    } finally {
      setSaving(false);
    }
  };

  const headerBox = "rounded-xl border border-blue-900/10 bg-white p-1 shadow-sm dark:border-blue-200/10 dark:bg-gray-900";

  return (
    <main className="container max-w-screen p-8">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <AgendaToolbar
          view={view}
          onNew={() => {
            setMode("create");
            setEditingId(null);
            setPresence("NAO_PREENCHIDO");
            setForm({
              date: "", time: "", patientName: "", age: "",
              treatment: "", notes: "", professional: "",
              durationMinutes: 50, recurrenceMonths: 0, presence: "Não preenchido",
            });
            setOpen(true);
          }}
          onChangeView={changeView}
          headerBoxClass={headerBox}
        />
      </div>

      <AgendaFilters
        filters={filters}
        saving={saving}
        onChange={setFilters}
        onClear={() =>
          setFilters((f) => ({ ...f, patient: "", date: "", professional: "" }))
        }
      />

      <AgendaCalendar
        ref={calendarRef}
        events={events}
        filtersDate={filters.date}
        onDatesChange={() => {
          // microtask to avoid flushSync during FC lifecycle
          queueMicrotask(() => {
            if (!calendarRef.current) return;
            fetchEvents();
          });
        }}
        onEventClick={openEditFromEvent}
        getDurationInMinutes={getDurationInMinutes}
      />

      <AgendaModal
        open={open}
        saving={saving}
        mode={mode}
        presence={presence}
        professionals={professionals}
        form={form}
        setForm={setForm}
        setPresence={setPresence}
        onClose={() => setOpen(false)}
        onSubmit={onSubmit}
      />
    </main>
  );
}
