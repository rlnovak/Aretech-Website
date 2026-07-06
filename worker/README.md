# Aretech Chat — Backend (Cloudflare Worker)

Backend do chat widget do site da Aretech. Substitui o antigo workflow n8n.
Roda um agente de IA que conversa com o visitante, apresenta os serviços,
oferece uma call de 15 min e **registra os leads na planilha Google Sheets**
(a mesma do formulário antigo).

## Arquitetura

- **Cloudflare Worker** (`src/index.ts`) — recebe `POST /api/chat`.
- **Durable Object** `ChatSession` — uma instância por visitante (`sessionId`),
  guarda o histórico da conversa (substitui a memória Postgres do n8n).
- **LLM** (`src/llm.ts`) — fala com OpenAI e/ou OpenRouter (API compatível),
  com **cadeia de fallback**: se o provedor primário falhar, tenta o outro.
- **Tools / function calling** (`src/tools.ts`):
  - `registrar_lead` — grava nome, e-mail, telefone, empresa, mensagem no Sheets.
  - `agendar_call` — grava a call (dia/hora) no Sheets.
- **Google Sheets** (`src/sheets.ts`) — grava direto via **Service Account**
  (JWT RS256 assinado no Worker com WebCrypto → OAuth2 → Sheets API v4 append).
- **Prompt de sistema** (`src/prompt.ts`) — persona "Are", consultivo e objetivo.

Sem dependências de runtime: só `wrangler` + `typescript` em dev.

## Modelos LLM — atenção ao function calling

O agente **depende de tool calling** (registrar lead / agendar call). Nem todo
modelo free do OpenRouter suporta tools:

| Modelo | Tools? | Observação |
|---|---|---|
| `openai/gpt-oss-120b:free` | ✅ | **Default. Melhor opção free** (muitos endpoints, estável). |
| `qwen/qwen3-next-80b-a3b-instruct:free` | ✅ | Alternativa boa. |
| `nvidia/nemotron-3-ultra-550b-a55b:free` | ✅ | Funciona, menos endpoints. |
| `meta-llama/llama-3.2-3b-instruct:free` | ❌ | **NÃO use** — sem tools, o bot nunca registra lead nem agenda. |
| `gpt-5-mini` (OpenAI) | ✅ | Mais confiável na adesão ao prompt; tem custo por token. |

Troca o modelo em `wrangler.jsonc` (`OPENROUTER_MODEL` / `OPENAI_MODEL`) e o
provedor primário em `PROVIDER` (`openrouter` | `openai`). O fallback é automático.

## Setup do Google Service Account (uma vez)

1. No [Google Cloud Console](https://console.cloud.google.com): crie um projeto
   (ou use um existente) e **ative a Google Sheets API E a Google Calendar API**
   (APIs & Services → Library → habilitar as duas).
2. **IAM & Admin → Service Accounts → Create service account**. Crie uma chave
   JSON (**Keys → Add key → JSON**) e baixe o arquivo. Anote o `client_email`
   (algo como `...@...iam.gserviceaccount.com`).
3. Abra a planilha [Contatos Aretech](https://docs.google.com/spreadsheets/d/1ebzz17ePs9QFJczQUyO9qtOgqEH2N14Cc3nU8yaqtFk/edit)
   e **compartilhe com o e-mail da service account** como **Editor**.
4. Confirme que a aba se chama `Contatos_site` com as colunas nesta ordem:
   `Nome | Sobrenome | Email | Telefone | Empresa | Mensagem | Data | Hora`.

### Google Calendar (para os agendamentos)

O `agendar_call` cria o evento no calendário definido em `CALENDAR_ID`
(`wrangler.jsonc`). Como a Service Account não tem agenda própria usável, é
preciso **compartilhar um calendário real com ela**:

5. No Google Calendar, ao lado do calendário desejado → **Configurações e
   compartilhamento → Compartilhar com pessoas e grupos específicos** → adicione
   o `client_email` da service account com a permissão
   **"Fazer alterações nos eventos"**.
6. Em `wrangler.jsonc`, ajuste `CALENDAR_ID` para o e-mail desse calendário
   (ex.: `contato@aretech.com.br`) ou `primary` se for o principal da conta que
   compartilhou. Faça `wrangler deploy` após alterar.

> **Convite + Google Meet:** em conta **Gmail comum**, a Service Account não
> consegue enviar convite ao cliente nem gerar link do Meet — a API recusa esses
> extras. O código detecta isso e **cria o evento mesmo assim** (horário bloqueado
> + dados do cliente na descrição), retornando um aviso. Convite/Meet automáticos
> exigem **Google Workspace + domain-wide delegation** da Service Account.
>
> **Erro 403 ao agendar** = calendário não compartilhado com a SA, ou a Calendar
> API não está ativada. O agendamento ainda é salvo na planilha (fallback), mas o
> evento não é criado até corrigir isso.

## Secrets

Nunca comite chaves. Em produção:

```bash
wrangler secret put OPENROUTER_API_KEY
wrangler secret put OPENAI_API_KEY
wrangler secret put GOOGLE_SERVICE_ACCOUNT   # cole o JSON inteiro em uma linha
```

Em dev local: copie `.dev.vars.example` para `.dev.vars` e preencha.

> `GOOGLE_SERVICE_ACCOUNT` = o conteúdo do JSON da service account, **em uma
> única linha**. A `private_key` mantém os `\n` escapados (como no arquivo baixado).

## Rodar

```bash
npm install
npm run dev        # wrangler dev em http://127.0.0.1:8787
npm run typecheck  # tsc --noEmit
npm run deploy     # wrangler deploy
```

Teste rápido:

```bash
curl -X POST "http://127.0.0.1:8787/api/chat?sessionId=teste-1" \
  -H "Content-Type: application/json" \
  -d '{"message":"Oi, quero automatizar meu atendimento"}'
```

## API

`POST /api/chat?sessionId=<id>`

```json
// request
{ "message": "texto do visitante" }
// response
{ "reply": "resposta do Are", "meta": { "provider": "openrouter", "model": "..." } }
```

- `sessionId` (querystring) identifica a conversa. O front persiste no
  `localStorage` (`aretech_chat_session`). Se ausente, o Worker gera um efêmero.
- `GET /health` → `{ "ok": true }`.

## CORS / produção

Em `wrangler.jsonc`, restrinja `ALLOWED_ORIGINS` ao domínio do site
(ex.: `"https://www.aretech.com.br,https://aretech.com.br"`) antes de publicar.

## Frontend

O widget (`../src/components/ChatWidget.tsx`) lê a URL do Worker de
`VITE_CHAT_API_URL` (ver `../.env.example`). Aponte para
`https://aretech-chat.<subdominio>.workers.dev/api/chat` no build de produção.
