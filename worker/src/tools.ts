// Definição das ferramentas (function calling) e execução delas.
// registrar_lead grava na planilha; agendar_call cria o evento no Google
// Calendar E grava na planilha. Tudo via a Service Account.

import type { ToolDef } from "./llm";
import { appendRow } from "./sheets";
import { nowBrasilia } from "./google-auth";
import { createEvent } from "./calendar";

export const TOOLS: ToolDef[] = [
  {
    type: "function",
    function: {
      name: "registrar_lead",
      description:
        "Registra os dados de contato do visitante para a equipe da Aretech. " +
        "Chame assim que tiver nome e pelo menos e-mail OU telefone.",
      parameters: {
        type: "object",
        properties: {
          nome: { type: "string", description: "Nome do visitante" },
          sobrenome: { type: "string", description: "Sobrenome; 'não informado' se ausente" },
          email: { type: "string", description: "E-mail; 'não informado' se ausente" },
          telefone: { type: "string", description: "Telefone/WhatsApp; 'não informado' se ausente" },
          empresa: { type: "string", description: "Empresa; 'não informado' se ausente" },
          mensagem: {
            type: "string",
            description: "Resumo do que o visitante busca / problema a resolver",
          },
        },
        required: ["nome", "email", "telefone"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "agendar_call",
      description:
        "Agenda um compromisso (por padrão a call de 15 minutos com o Rafael Novak) " +
        "criando o evento no Google Calendar e registrando na planilha. Só chame " +
        "após confirmar dia e hora explicitamente com o visitante.",
      parameters: {
        type: "object",
        properties: {
          nome: { type: "string", description: "Nome do visitante" },
          sobrenome: { type: "string", description: "Sobrenome; 'não informado' se ausente" },
          email: { type: "string", description: "E-mail do visitante (usado como convidado no evento)" },
          telefone: { type: "string", description: "Telefone/WhatsApp do visitante" },
          empresa: { type: "string", description: "Empresa; 'não informado' se ausente" },
          dia: { type: "string", description: "Dia do compromisso no formato DD/MM/AAAA (ex.: 08/07/2026)" },
          hora: { type: "string", description: "Hora no formato HH:MM em 24h (ex.: 14:30)" },
          tipo: {
            type: "string",
            description:
              "Tipo do compromisso conforme a conversa (ex.: 'Call de apresentação', " +
              "'Consulta', 'Orçamento'). Se não souber, use 'Call'.",
          },
          duracao_min: {
            type: "number",
            description: "Duração em minutos. Se não especificado, use 15.",
          },
          resumo: { type: "string", description: "Resumo da necessidade do visitante" },
        },
        required: ["nome", "email", "telefone", "dia", "hora"],
      },
    },
  },
];

type Args = Record<string, unknown>;

function pick(args: Args, key: string): string {
  const v = args[key];
  if (typeof v === "string" && v.trim()) return v.trim();
  if (typeof v === "number") return String(v);
  return "não informado";
}

// Como pick, mas retorna string vazia (não "não informado") quando ausente.
function opt(args: Args, key: string): string {
  const v = args[key];
  if (typeof v === "string") return v.trim();
  if (typeof v === "number") return String(v);
  return "";
}

function num(args: Args, key: string, fallback: number): number {
  const v = args[key];
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() && Number.isFinite(Number(v))) return Number(v);
  return fallback;
}

// Executa a ferramenta e devolve o texto que vai como resultado (role:tool) à LLM.
export async function runTool(env: Env, name: string, args: Args): Promise<string> {
  const { data, hora } = nowBrasilia();

  // Ordem das colunas na aba Contatos_site:
  // Nome | Sobrenome | Email | Telefone | Empresa | Mensagem | Data | Hora
  if (name === "registrar_lead") {
    await appendRow(env.GOOGLE_SERVICE_ACCOUNT, env.SHEET_ID, env.SHEET_TAB, [
      pick(args, "nome"),
      pick(args, "sobrenome"),
      pick(args, "email"),
      pick(args, "telefone"),
      pick(args, "empresa"),
      pick(args, "mensagem"),
      data,
      hora,
    ]);
    return "Lead registrado com sucesso na planilha.";
  }

  if (name === "agendar_call") {
    const nome = pick(args, "nome");
    const sobrenome = opt(args, "sobrenome");
    const email = pick(args, "email");
    const telefone = pick(args, "telefone");
    const empresa = pick(args, "empresa");
    const dia = pick(args, "dia");
    const horaCall = pick(args, "hora");
    const resumo = pick(args, "resumo");
    const tipo = opt(args, "tipo") || "Call";
    const duracaoMin = num(args, "duracao_min", 15);

    const nomeCompleto = sobrenome && sobrenome !== "não informado" ? `${nome} ${sobrenome}` : nome;
    const titulo = `${tipo} — ${nomeCompleto}`;
    const descricao =
      `Agendado pelo chat do site.\n` +
      `Nome: ${nomeCompleto}\nE-mail: ${email}\nTelefone: ${telefone}\n` +
      `Empresa: ${empresa}\nNecessidade: ${resumo}`;

    // 1) Cria o evento no Google Calendar (com convidado + Meet quando possível).
    let calStatus = "";
    let meetInfo = "";
    try {
      const ev = await createEvent(env.GOOGLE_SERVICE_ACCOUNT, env.CALENDAR_ID, {
        titulo,
        descricao,
        dia,
        hora: horaCall,
        duracaoMin,
        emailConvidado: email && email.includes("@") ? email : undefined,
      });
      calStatus = "Evento criado no Google Calendar.";
      if (ev.meetLink) meetInfo = ` Link do Meet: ${ev.meetLink}.`;
      if (ev.warning) calStatus += ` (${ev.warning})`;
    } catch (err) {
      // Não perder o agendamento: registra na planilha mesmo se o Calendar falhar.
      calStatus =
        "ATENÇÃO: não foi possível criar o evento no Calendar (" +
        (err instanceof Error ? err.message : String(err)) +
        "). Confirme o agendamento manualmente.";
    }

    // 2) Registra na planilha (histórico/CRM).
    const mensagem = `[${tipo.toUpperCase()} AGENDADA para ${dia} às ${horaCall}] ${resumo}`;
    await appendRow(env.GOOGLE_SERVICE_ACCOUNT, env.SHEET_ID, env.SHEET_TAB, [
      nome,
      sobrenome || "não informado",
      email,
      telefone,
      empresa,
      mensagem,
      data,
      hora,
    ]);

    return `${tipo} registrada para ${dia} às ${horaCall}. ${calStatus}${meetInfo} Dados salvos na planilha.`;
  }

  return `Ferramenta desconhecida: ${name}`;
}
