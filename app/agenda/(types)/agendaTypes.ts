// Presence used across UI + API
export type Presence = "ATENDIDO" | "DESMARCADO" | "FALTOU" | "NAO_PREENCHIDO";

export type Filters = {
  patient?: string;
  date?: string;   // YYYY-MM-DD
  time?: string;   // HH:mm
  treatment?: string;
  professional?: string;
};

export type NewEvent = {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  patientName: string;
  age?: string;
  treatment?: string;
  notes?: string;
  professional?: string;
  durationMinutes?: number; // default 50
  recurrenceMonths?: number;
  presence: string;
};

export type Mode = "create" | "edit";