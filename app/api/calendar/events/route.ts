// app/api/calendar/events/route.ts
import { NextResponse } from "next/server";
import { getGoogleClient } from "@/lib/google";

/**
 * Utilities
 */
const TZ = "America/Sao_Paulo";

function pad(n: number) {
    return String(n).padStart(2, "0");
}

/** Convert a JS Date to a LOCAL RFC3339 string (no "Z", no ms) */
function toLocalRFC3339(d: Date) {
    return (
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
        `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    );
}

/** Build an end local datetime string by adding minutes to a given (date, time) */
function buildEndLocal(date: string, time: string, addMinutes: number) {
    const [hh, mm] = time.split(":").map((x) => Number(x));
    const d = new Date(
        Number(date.slice(0, 4)),
        Number(date.slice(5, 7)) - 1,
        Number(date.slice(8, 10)),
        hh || 0,
        mm || 0,
        0,
        0
    );
    d.setMinutes(d.getMinutes() + (Number.isFinite(addMinutes) ? addMinutes : 60));
    return toLocalRFC3339(d);
}

/**
 * GET /api/calendar/events?from=ISO&to=ISO&patient=&date=&time=&treatment=&vip=(true|false)&professional=
 * - Lists events in the visible range (from/to are ISO strings).
 * - Applies optional filters.
 */
export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const from = url.searchParams.get("from");
        const to = url.searchParams.get("to");

        if (!from || !to) {
            return NextResponse.json(
                { ok: false, error: "Query params 'from' and 'to' are required (ISO strings)." },
                { status: 400 }
            );
        }

        const patient = (url.searchParams.get("patient") || "").trim().toLowerCase();
        const dateFilter = (url.searchParams.get("date") || "").trim(); // YYYY-MM-DD
        const timeFilter = (url.searchParams.get("time") || "").trim(); // HH:mm
        const treatment = (url.searchParams.get("treatment") || "").trim().toLowerCase();
        const vip = url.searchParams.get("vip"); // "true" | "false" | null
        const professional = (url.searchParams.get("professional") || "").trim().toLowerCase();

        const calendar = getGoogleClient();
        const calendarId = process.env.GOOGLE_CALENDAR_ID!;
        const { data } = await calendar.events.list({
            calendarId,
            singleEvents: true, // expand recurrences as instances
            orderBy: "startTime",
            timeMin: new Date(from).toISOString(),
            timeMax: new Date(to).toISOString(),
            maxResults: 2500,
        });

        const items = data.items ?? [];

        // Map Google → FullCalendar event objects
        let events = items.map((ev) => {
            const priv = ev.extendedProperties?.private || {};
            const isVip = String(priv.vip) === "true";
            const patientName = priv.patientName || ev.summary || "";

            return {
                id: ev.id!,
                title: `${isVip ? "⭐ " : ""}${patientName || "Agendamento"}`,
                start: ev.start?.dateTime || ev.start?.date, // FullCalendar understands both
                end: ev.end?.dateTime || ev.end?.date,
                extendedProps: {
                    patientName,
                    age: priv.age || "",
                    treatment: priv.treatment || "",
                    notes: priv.notes || "",
                    vip: isVip,
                    professional: priv.professional || "",
                },
            };
        });

        // Apply filters (in-memory). Adjust/expand as needed.
        if (patient) {
            events = events.filter((e) =>
                (e.extendedProps.patientName || "")
                    .toString()
                    .toLowerCase()
                    .includes(patient)
            );
        }
        if (treatment) {
            events = events.filter((e) =>
                (e.extendedProps.treatment || "")
                    .toString()
                    .toLowerCase()
                    .includes(treatment)
            );
        }
        if (professional) {
            events = events.filter((e) =>
                (e.extendedProps.professional || "")
                    .toString()
                    .toLowerCase()
                    .includes(professional)
            );
        }
        if (vip === "true" || vip === "false") {
            const want = vip === "true";
            events = events.filter((e) => Boolean(e.extendedProps.vip) === want);
        }
        if (dateFilter) {
            // Keep events that start on this local date (YYYY-MM-DD prefix)
            events = events.filter((e) => {
                const s = (e.start as string) || "";
                // start can be "YYYY-MM-DD" (all-day) or "YYYY-MM-DDTHH:mm:ss..."
                return s.startsWith(dateFilter);
            });
        }
        if (timeFilter) {
            // Keep events whose local time (HH:mm) matches the filter
            events = events.filter((e) => {
                const s = (e.start as string) || "";
                // expect "YYYY-MM-DDTHH:mm" or "YYYY-MM-DDTHH:mm:ss"
                const hhmm = s.split("T")[1]?.slice(0, 5);
                return hhmm === timeFilter;
            });
        }

        return NextResponse.json({ ok: true, events });
    } catch (e: any) {
        console.error("[GCAL] LIST ERROR:", e?.response?.data || e?.message || e);
        return NextResponse.json(
            { ok: false, error: e?.response?.data || e?.message || "Unknown error" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/calendar/events
 * Body JSON:
 * {
 *   "date": "YYYY-MM-DD",
 *   "time": "HH:mm",
 *   "patientName": "string",
 *   "age": "string",
 *   "treatment": "string",
 *   "notes": "string",
 *   "vip": boolean,
 *   "professional": "string",
 *   "durationMinutes": number,
 *   "recurrenceMonths": number, // NEW: number of months to repeat monthly
 *   "idempotencyKey": string     // recommended
 * }
 *
 * IMPORTANT: We send LOCAL wall-clock datetime strings (no "Z") + timeZone,
 * so Google interprets them in "America/Sao_Paulo" without rolling back a day.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            date,               // "YYYY-MM-DD"
            time,               // "HH:mm"
            patientName,
            age = "",
            treatment = "",
            notes = "",
            vip = false,
            professional = "",
            durationMinutes = 60,
            recurrenceMonths = 0,
            idempotencyKey,
        } = body || {};

        if (!date || !time || !patientName) {
            return NextResponse.json(
                { ok: false, error: "Required fields: 'date', 'time', 'patientName'." },
                { status: 400 }
            );
        }

        const calendar = getGoogleClient();
        const calendarId = process.env.GOOGLE_CALENDAR_ID!;
        if (!calendarId) {
            return NextResponse.json(
                { ok: false, error: "Missing GOOGLE_CALENDAR_ID env var." },
                { status: 500 }
            );
        }

        // Build local datetime strings (no "Z", no milliseconds)
        const startLocal = `${date}T${time}:00`;
        const endLocal = buildEndLocal(date, time, Number(durationMinutes));

        const summaryParts = [
            vip ? "⭐ VIP" : null,
            patientName,
            treatment ? `– ${treatment}` : null,
        ].filter(Boolean) as string[];

        const description = [
            notes && `Observação: ${notes}`,
            age && `Idade: ${age}`,
            professional && `Profissional: ${professional}`,
        ]
            .filter(Boolean)
            .join("\n");

        const requestBody: any = {
            summary: summaryParts.join(" "),
            description,
            start: { dateTime: startLocal, timeZone: TZ },
            end: { dateTime: endLocal, timeZone: TZ },
            extendedProperties: {
                private: {
                    patientName,
                    age,
                    treatment,
                    notes,
                    vip: vip ? "true" : "false",
                    professional,
                    // keep idempotency to help manual audits if needed
                    ...(idempotencyKey ? { idemKey: idempotencyKey } : {}),
                },
            },
        };

        // NEW: monthly recurrence
        // If recurrenceMonths > 0, we create a recurring event repeating monthly,
        // COUNT includes the first occurrence; e.g. 3 → 4 total months (0..3)?
        // Convention: user set "3" means repeat for the next 3 months *after* the first.
        // So total COUNT = 1 (first) + 3 = 4.
        if (Number(recurrenceMonths) > 0) {
            const count = 1 + Number(recurrenceMonths);
            requestBody.recurrence = [`RRULE:FREQ=MONTHLY;COUNT=${count}`];
        }

        const resp = await calendar.events.insert({
            calendarId,
            requestBody,
            // idempotency via "sendUpdates" isn't for this; to protect backend side,
            // you can persist idempotencyKey on your DB keyed by (calendarId, idemKey).
        });

        console.log("[GCAL] Insert OK on", calendarId, "->", resp.data.htmlLink);

        return NextResponse.json({ ok: true, event: resp.data });
    } catch (e: any) {
        const err = e?.response?.data || e?.message || e;
        console.error("[GCAL] INSERT ERROR:", err);
        return NextResponse.json({ ok: false, error: err }, { status: 500 });
    }
}
