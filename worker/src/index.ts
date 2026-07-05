// Worker de backend do chat da Aretech.
// - POST /api/chat  -> roteia para o Durable Object da sessão
// - Durable Object guarda o histórico e roda o loop do agente (LLM + tools)

import { DurableObject } from "cloudflare:workers";
import { SYSTEM_PROMPT } from "./prompt";
import { chat, type ChatMessage } from "./llm";
import { TOOLS, runTool } from "./tools";

const MAX_HISTORY = 30; // mensagens guardadas por sessão (fora o system)
const MAX_TOOL_ROUNDS = 4; // trava anti-loop de tool calling

interface ChatRequest {
  message: string;
}

interface ChatResponse {
  reply: string;
  meta?: { provider: string; model: string };
}

function corsHeaders(origin: string | null, allowed: string): Record<string, string> {
  // allowed pode ser "*" ou lista separada por vírgula.
  let allowOrigin = "*";
  if (allowed !== "*") {
    const list = allowed.split(",").map((s) => s.trim());
    allowOrigin = origin && list.includes(origin) ? origin : list[0];
  } else if (origin) {
    allowOrigin = origin;
  }
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

// ---------------------------------------------------------------------------
// Durable Object: uma instância por sessão de visitante.
// ---------------------------------------------------------------------------
export class ChatSession extends DurableObject<Env> {
  async handle(userMessage: string): Promise<ChatResponse> {
    const history = (await this.ctx.storage.get<ChatMessage[]>("history")) ?? [];

    history.push({ role: "user", content: userMessage });

    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history,
    ];

    let lastMeta: { provider: string; model: string } | undefined;

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const result = await chat(this.env, messages, TOOLS);
      lastMeta = { provider: result.provider, model: result.model };
      const assistantMsg = result.message;
      messages.push(assistantMsg);
      history.push(assistantMsg);

      const toolCalls = assistantMsg.tool_calls;
      if (!toolCalls || toolCalls.length === 0) {
        // Resposta final em texto.
        await this.save(history);
        return {
          reply: assistantMsg.content ?? "",
          meta: lastMeta,
        };
      }

      // Executa cada tool call e devolve o resultado à LLM.
      for (const call of toolCalls) {
        let args: Record<string, string> = {};
        try {
          args = JSON.parse(call.function.arguments || "{}");
        } catch {
          args = {};
        }

        let toolResult: string;
        try {
          toolResult = await runTool(this.env, call.function.name, args);
        } catch (err) {
          toolResult =
            "Erro ao executar a ferramenta: " +
            (err instanceof Error ? err.message : String(err)) +
            ". Peça desculpas e ofereça o WhatsApp https://wa.me/5547989007623";
        }

        const toolMsg: ChatMessage = {
          role: "tool",
          tool_call_id: call.id,
          name: call.function.name,
          content: toolResult,
        };
        messages.push(toolMsg);
        history.push(toolMsg);
      }
    }

    // Se estourou o limite de rounds, força uma resposta em texto.
    await this.save(history);
    return {
      reply:
        "Desculpe, tive um problema ao processar isso. Você pode falar direto com a gente no WhatsApp: https://wa.me/5547989007623",
      meta: lastMeta,
    };
  }

  private async save(history: ChatMessage[]): Promise<void> {
    // Guarda só as últimas MAX_HISTORY mensagens para não crescer sem limite.
    const trimmed = history.slice(-MAX_HISTORY);
    await this.ctx.storage.put("history", trimmed);
  }
}

// ---------------------------------------------------------------------------
// Worker entry
// ---------------------------------------------------------------------------
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");
    const cors = corsHeaders(origin, env.ALLOWED_ORIGINS || "*");
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === "/api/chat" && request.method === "POST") {
      // sessionId vem via querystring; se ausente, gera um (sessão efêmera).
      const sessionId = url.searchParams.get("sessionId") || crypto.randomUUID();

      let body: ChatRequest;
      try {
        body = (await request.json()) as ChatRequest;
      } catch {
        return json({ error: "JSON inválido" }, 400, cors);
      }
      if (!body.message || typeof body.message !== "string") {
        return json({ error: "Campo 'message' obrigatório" }, 400, cors);
      }
      if (body.message.length > 2000) {
        return json({ error: "Mensagem muito longa" }, 413, cors);
      }

      try {
        const id = env.CHAT_SESSION.idFromName(sessionId);
        const stub = env.CHAT_SESSION.get(id);
        const result = await stub.handle(body.message);
        return json(result, 200, cors);
      } catch (err) {
        console.error("Erro no chat:", err);
        return json(
          {
            reply:
              "Estou com uma instabilidade no momento. Fale com a gente no WhatsApp: https://wa.me/5547989007623",
          },
          200,
          cors
        );
      }
    }

    if (url.pathname === "/health") {
      return json({ ok: true }, 200, cors);
    }

    return json({ error: "Not found" }, 404, cors);
  },
};

function json(data: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  });
}
