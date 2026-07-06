// Autenticação Google via Service Account, compartilhada por Sheets e Calendar.
// Assina um JWT RS256 com WebCrypto e troca por um access token OAuth2.
// Sem dependências externas — roda nativo no Worker.

export interface ServiceAccount {
  client_email: string;
  private_key: string;
  token_uri?: string;
}

// Cache de access token por escopo (evita re-assinar a cada request na isolate).
const tokenCache = new Map<string, { token: string; exp: number }>();

function base64url(input: ArrayBuffer | string): string {
  let bytes: Uint8Array;
  if (typeof input === "string") {
    bytes = new TextEncoder().encode(input);
  } else {
    bytes = new Uint8Array(input);
  }
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Converte a private_key PEM (PKCS#8) em CryptoKey RS256.
async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const clean = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const raw = Uint8Array.from(atob(clean), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    "pkcs8",
    raw.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

/**
 * Obtém um access token OAuth2 para o(s) escopo(s) pedido(s).
 * @param scope string de escopos separados por espaço
 */
export async function getAccessToken(sa: ServiceAccount, scope: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const cached = tokenCache.get(scope);
  if (cached && cached.exp - 60 > now) return cached.token;

  const tokenUri = sa.token_uri || "https://oauth2.googleapis.com/token";

  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: sa.client_email,
    scope,
    aud: tokenUri,
    iat: now,
    exp: now + 3600,
  };

  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(
    JSON.stringify(claim)
  )}`;
  const key = await importPrivateKey(sa.private_key);
  const sigBuf = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned)
  );
  const jwt = `${unsigned}.${base64url(sigBuf)}`;

  const res = await fetch(tokenUri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    throw new Error(`Falha ao obter access token Google: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache.set(scope, { token: data.access_token, exp: now + data.expires_in });
  return data.access_token;
}

export function parseServiceAccount(saJson: string): ServiceAccount {
  return JSON.parse(saJson) as ServiceAccount;
}

// Data/hora no fuso de São Paulo, no formato usado pela planilha antiga.
export function nowBrasilia(): { data: string; hora: string } {
  const fmt = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", ...opts });
  const now = new Date();
  const data = fmt({ day: "2-digit", month: "2-digit", year: "numeric" }).format(now);
  const hora = fmt({
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);
  return { data, hora };
}
