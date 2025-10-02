import { Presence } from "../(types)/agendaTypes"; 

/** Calculates the duration from a range string like "16:00 - 17:00". */
export function getDurationInMinutes(range: string): number {
  const [start, end] = range.split("-").map((s) => s.trim());
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const sTot = sh * 60 + sm;
  let eTot = eh * 60 + em;
  if (eTot < sTot) eTot += 24 * 60;
  return eTot - sTot;
}

export function presencePtToEnum(p?: string): Presence {
  const v = (p || "").toLowerCase();
  if (v.includes("realizado") || v === "atendido") return "ATENDIDO";
  if (v.includes("desmarc")) return "DESMARCADO";
  if (v.includes("faltou")) return "FALTOU";
  return "NAO_PREENCHIDO";
}

// simple idempotency key generator
export function makeKey() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}