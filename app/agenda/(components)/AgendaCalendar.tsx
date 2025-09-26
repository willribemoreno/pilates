"use client";
import React, { forwardRef } from "react";
import FullCalendar from "@fullcalendar/react";
import ptBr from "@fullcalendar/core/locales/pt-br";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { DatesSetArg, EventClickArg } from "@fullcalendar/core";
import { AgendaEventContent } from "./AgendaEventContent";

type Props = {
  events: any[];
  filtersDate?: string;
  onDatesChange: (arg: DatesSetArg) => void;
  onEventClick: (info: any) => void; // will call parent openEditFromEvent
  getDurationInMinutes: (s: string) => number;
};

export const AgendaCalendar = forwardRef<FullCalendar, Props>(function AgendaCalendar(
  { events, onDatesChange, onEventClick },
  ref
) {
  return (
    <div className="no-event-gutters overflow-hidden rounded-2xl border border-blue-900/10 bg-white shadow-[0_10px_30px_rgba(17,24,39,.12)] dark:border-blue-200/10 dark:bg-gray-900">
      <FullCalendar
        ref={ref as any}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={false}
        height="75vh"
        events={events}
        nowIndicator
        allDaySlot={false}
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        firstDay={1}
        eventDisplay="block"
        dayMaxEventRows={3}
        slotEventOverlap={false}
        selectable
        eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
        locale={ptBr}
        eventOverlap={false}
        eventClassNames={() =>
          "cursor-pointer rounded-md border border-blue-900/10 bg-blue-500/90 text-white dark:border-blue-200/10 w-full"
        }
        datesSet={onDatesChange}
        eventContent={(arg) => <AgendaEventContent arg={arg} />}
        eventClick={(info: EventClickArg) => onEventClick(info)}
      />
    </div>
  );
});
