// Definição das ferramentas (function calling) e execução delas.
// Ambas gravam na planilha Google Sheets via service account.

import type { ToolDef } from "./llm";
import { appendRow, nowBrasilia } from "./sheets";

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
        "Agenda a call de 15 minutos com o Rafael Novak. Só chame após confirmar " +
        "dia e hora explicitamente com o visitante.",
      parameters: {
        type: "object",
        properties: {
          nome: { type: "string", description: "Nome do visitante" },
          sobrenome: { type: "string", description: "Sobrenome; 'não informado' se ausente" },
          email: { type: "string", description: "E-mail do visitante" },
          telefone: { type: "string", description: "Telefone/WhatsApp do visitante" },
          empresa: { type: "string", description: "Empresa; 'não informado' se ausente" },
          dia: { type: "string", description: "Dia da call (ex.: 08/07/2026)" },
          hora: { type: "string", description: "Hora da call (ex.: 14:30)" },
          resumo: { type: "string", description: "Resumo da necessidade do visitante" },
        },
        required: ["nome", "email", "telefone", "dia", "hora"],
      },
    },
  },
];

type Args = Record<string, string>;

function pick(args: Args, key: string): string {
  const v = args[key];
  return v && v.trim() ? v.trim() : "não informado";
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
    const dia = pick(args, "dia");
    const horaCall = pick(args, "hora");
    const resumo = pick(args, "resumo");
    const mensagem = `[CALL AGENDADA para ${dia} às ${horaCall}] ${resumo}`;
    await appendRow(env.GOOGLE_SERVICE_ACCOUNT, env.SHEET_ID, env.SHEET_TAB, [
      pick(args, "nome"),
      pick(args, "sobrenome"),
      pick(args, "email"),
      pick(args, "telefone"),
      pick(args, "empresa"),
      mensagem,
      data,
      hora,
    ]);
    return `Call registrada para ${dia} às ${horaCall}. Dados salvos na planilha.`;
  }

  return `Ferramenta desconhecida: ${name}`;
}
