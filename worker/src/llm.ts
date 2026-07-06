// Camada de LLM. Fala com OpenAI e OpenRouter (ambos usam a API
// chat/completions compatível com OpenAI). Suporta function calling e uma
// cadeia de fallback: se o provedor primário falhar, tenta os próximos.

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
}

export interface ToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

export interface ToolDef {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface LLMResult {
  message: ChatMessage;
  provider: string;
  model: string;
}

interface ProviderConfig {
  provider: "openai" | "openrouter";
  model: string;
  apiKey: string;
}

const ENDPOINTS = {
  openai: "https://api.openai.com/v1/chat/completions",
  openrouter: "https://openrouter.ai/api/v1/chat/completions",
};

/**
 * Monta a cadeia de provedores a partir das env vars.
 * PROVIDER = openai | openrouter (primário)
 * MODEL = modelo do primário
 * Fallback: o outro provedor com seu modelo default, se a chave existir.
 */
export function buildProviderChain(env: Env): ProviderConfig[] {
  const chain: ProviderConfig[] = [];
  const primary = (env.PROVIDER || "openrouter").toLowerCase();

  const openaiModel = env.OPENAI_MODEL || "gpt-5-mini";
  const openrouterModel = env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free";

  // Modelos free extras (todos com suporte a tools) para dar fallback quando o
  // primário do OpenRouter estiver rate-limited (429 comum no free tier).
  // Só entram se forem diferentes do primário.
  const extraFree = ["qwen/qwen3-next-80b-a3b-instruct:free", "openai/gpt-oss-120b:free"].filter(
    (m) => m !== openrouterModel
  );

  const pushOpenRouter = (model: string) => {
    if (env.OPENROUTER_API_KEY) {
      chain.push({ provider: "openrouter", model, apiKey: env.OPENROUTER_API_KEY });
    }
  };
  const pushOpenAI = () => {
    if (env.OPENAI_API_KEY) {
      chain.push({ provider: "openai", model: openaiModel, apiKey: env.OPENAI_API_KEY });
    }
  };

  if (primary === "openai") {
    pushOpenAI();
    pushOpenRouter(openrouterModel);
    extraFree.forEach(pushOpenRouter);
  } else {
    pushOpenRouter(openrouterModel);
    extraFree.forEach(pushOpenRouter);
    pushOpenAI();
  }

  if (chain.length === 0) {
    throw new Error("Nenhuma API key de LLM configurada (OPENAI_API_KEY ou OPENROUTER_API_KEY).");
  }
  return chain;
}

async function callProvider(
  cfg: ProviderConfig,
  messages: ChatMessage[],
  tools: ToolDef[]
): Promise<ChatMessage> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${cfg.apiKey}`,
    "Content-Type": "application/json",
  };
  if (cfg.provider === "openrouter") {
    headers["HTTP-Referer"] = "https://www.aretech.com.br";
    headers["X-Title"] = "Aretech Chat";
  }

  const body: Record<string, unknown> = {
    model: cfg.model,
    messages,
    tools,
    tool_choice: "auto",
  };

  // Modelos GPT-5 (OpenAI) só aceitam temperature default (1) — omitimos.
  // Nos demais, usamos 0.4 para respostas mais consistentes.
  const isGpt5 = /(^|\/)gpt-5/i.test(cfg.model);
  if (!isGpt5) {
    body.temperature = 0.4;
  }

  const res = await fetch(ENDPOINTS[cfg.provider], {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`${cfg.provider}/${cfg.model} respondeu ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: ChatMessage }[];
  };
  const msg = data.choices?.[0]?.message;
  if (!msg) throw new Error(`${cfg.provider}/${cfg.model}: resposta sem message`);
  return msg;
}

/**
 * Chama a LLM percorrendo a cadeia de fallback até uma responder.
 */
export async function chat(
  env: Env,
  messages: ChatMessage[],
  tools: ToolDef[]
): Promise<LLMResult> {
  const chain = buildProviderChain(env);
  const errors: string[] = [];

  for (const cfg of chain) {
    try {
      const message = await callProvider(cfg, messages, tools);
      return { message, provider: cfg.provider, model: cfg.model };
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }
  throw new Error(`Todos os provedores LLM falharam: ${errors.join(" | ")}`);
}
