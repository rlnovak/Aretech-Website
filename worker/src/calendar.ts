// Cria eventos no Google Calendar usando a Service Account.
// Requer que o calendário alvo (CALENDAR_ID) esteja compartilhado com o
// client_email da SA com permissão "Fazer alterações nos eventos".

import { getAccessToken, parseServiceAccount } from "./google-auth";

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events";
const TIMEZONE = "America/Sao_Paulo";

export interface EventInput {
  titulo: string;
  descricao: string;
  dia: string; // DD/MM/YYYY
  hora: string; // HH:MM (24h)
  duracaoMin: number; // duração em minutos
  emailConvidado?: string; // convidado (cliente)
}

export interface EventResult {
  ok: boolean;
  htmlLink?: string; // link do evento no Calendar
  meetLink?: string; // link do Google Meet, se criado
  warning?: string; // aviso quando um recurso (convite/Meet) não pôde ser criado
}

// "DD/MM/YYYY" + "HH:MM" -> partes numéricas. Lança se formato inválido.
function parseDateTime(dia: string, hora: string): { y: number; mo: number; d: number; h: number; mi: number } {
  const dm = dia.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const hm = hora.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!dm) throw new Error(`Data inválida (esperado DD/MM/YYYY): "${dia}"`);
  if (!hm) throw new Error(`Hora inválida (esperado HH:MM): "${hora}"`);
  return {
    y: Number(dm[3]),
    mo: Number(dm[2]),
    d: Number(dm[1]),
    h: Number(hm[1]),
    mi: Number(hm[2]),
  };
}

// Offset (em minutos) de America/Sao_Paulo para um instante UTC específico.
// Ex.: -180 para -03:00. Usa Intl para respeitar horário de verão histórico.
function tzOffsetMinutes(instantUTC: number): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  });
  const parts = dtf.formatToParts(new Date(instantUTC));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const hour = get("hour") === 24 ? 0 : get("hour");
  const asLocalUTC = Date.UTC(get("year"), get("month") - 1, get("day"), hour, get("minute"), get("second"));
  return (asLocalUTC - instantUTC) / 60000;
}

// Converte uma hora "de parede" em São Paulo (y-mo-d h:mi) no instante UTC real.
function wallClockToUTC(y: number, mo: number, d: number, h: number, mi: number): number {
  // Chute inicial tratando os componentes como UTC, depois corrige pelo offset.
  const guess = Date.UTC(y, mo - 1, d, h, mi, 0);
  const off = tzOffsetMinutes(guess);
  return guess - off * 60000;
}

// Formata um instante UTC como RFC3339 no fuso de São Paulo, ex.: 2026-07-10T14:00:00-03:00
function formatRfc3339(instantUTC: number): string {
  const off = tzOffsetMinutes(instantUTC);
  const local = new Date(instantUTC + off * 60000); // componentes UTC agora = hora local
  const p = (n: number) => String(n).padStart(2, "0");
  const sign = off <= 0 ? "-" : "+";
  const abs = Math.abs(off);
  const offH = p(Math.floor(abs / 60));
  const offM = p(abs % 60);
  return (
    `${local.getUTCFullYear()}-${p(local.getUTCMonth() + 1)}-${p(local.getUTCDate())}` +
    `T${p(local.getUTCHours())}:${p(local.getUTCMinutes())}:00${sign}${offH}:${offM}`
  );
}

/**
 * Cria um evento no Google Calendar. Tenta com convidado + Google Meet; se a API
 * recusar (comum com Service Account em conta Gmail sem delegação), refaz sem
 * esses recursos para não perder o agendamento.
 */
export async function createEvent(
  saJson: string,
  calendarId: string,
  input: EventInput
): Promise<EventResult> {
  const sa = parseServiceAccount(saJson);
  const token = await getAccessToken(sa, CALENDAR_SCOPE);

  const { y, mo, d, h, mi } = parseDateTime(input.dia, input.hora);
  const startUTC = wallClockToUTC(y, mo, d, h, mi);
  const startRfc = formatRfc3339(startUTC);
  const endRfc = formatRfc3339(startUTC + input.duracaoMin * 60000);

  const baseEvent: Record<string, unknown> = {
    summary: input.titulo,
    description: input.descricao,
    start: { dateTime: startRfc, timeZone: TIMEZONE },
    end: { dateTime: endRfc, timeZone: TIMEZONE },
  };

  const withExtras: Record<string, unknown> = { ...baseEvent };
  if (input.emailConvidado) {
    withExtras.attendees = [{ email: input.emailConvidado }];
  }
  withExtras.conferenceData = {
    createRequest: {
      requestId: crypto.randomUUID(),
      conferenceSolutionKey: { type: "hangoutsMeet" },
    },
  };

  const insert = async (body: Record<string, unknown>, extras: boolean) => {
    const url =
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events` +
      `?conferenceDataVersion=${extras ? 1 : 0}&sendUpdates=${extras ? "all" : "none"}`;
    return fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  };

  // 1ª tentativa: com convidado + Meet.
  let res = await insert(withExtras, true);
  let warning: string | undefined;

  if (!res.ok) {
    const errText = await res.text();
    // 2ª tentativa: evento simples (sem convite/Meet), para não perder o agendamento.
    warning =
      `Evento criado sem convite/Meet (a API recusou os extras: ${res.status}). ` +
      `Provável Service Account em conta Gmail sem delegação. Erro: ${errText.slice(0, 200)}`;
    res = await insert(baseEvent, false);
    if (!res.ok) {
      throw new Error(`Falha ao criar evento no Calendar: ${res.status} ${await res.text()}`);
    }
  }

  const data = (await res.json()) as {
    htmlLink?: string;
    hangoutLink?: string;
    conferenceData?: { entryPoints?: { uri?: string }[] };
  };
  const meetLink =
    data.hangoutLink || data.conferenceData?.entryPoints?.find((e) => e.uri)?.uri;

  return { ok: true, htmlLink: data.htmlLink, meetLink, warning };
}
