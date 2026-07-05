// Augmenta o Env gerado por `wrangler types` com os secrets (que não aparecem
// no wrangler.jsonc). Este arquivo NÃO é sobrescrito por `wrangler types`.

interface Env {
  OPENROUTER_API_KEY: string;
  OPENAI_API_KEY: string;
  GOOGLE_SERVICE_ACCOUNT: string; // JSON completo da service account, em uma linha
}
