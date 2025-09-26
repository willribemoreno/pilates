"use client";
import React from "react";
import { EventContentArg } from "@fullcalendar/core";
import { getDurationInMinutes } from "../(util)/util";

export const AgendaEventContent: React.FC<{ arg: EventContentArg }> = ({ arg }) => {
  const vType = arg.view.type;
  const { timeText, event } = arg;
  const xp: any = event.extendedProps || {};

  if (vType === "timeGridDay") {
    return (
      <div className="flex divide-x">
        <div className="flex flex-col flex-1 p-0 leading-tight text-left justify-end min-w-0">
          <div className="truncate font-semibold">{xp.patientName || event.title}</div>
          <div className="truncate text-xs opacity-90">{timeText}</div>
        </div>
        <div className="flex flex-col flex-1 p-0 leading-tight text-left ml-1 min-w-0">
          <div className="truncate text-xs opacity-90">
            <span className="font-semibold">Profissional:</span> {xp.professional}
          </div>
          <div className="truncate text-xs opacity-90">
            <span className="font-semibold">Tratamento:</span> {xp.treatment}
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
      <div className="truncate font-medium">{xp.patientName || event.title}</div>
      {timeText && <div className="text-[11px] opacity-90">{timeText}</div>}
      {xp.treatment && (
        <div className="mt-0.5 inline-block rounded bg-white/15 px-1.5 py-[1px] text-[10px]">
          {xp.treatment}
        </div>
      )}
    </div>
  );
};
