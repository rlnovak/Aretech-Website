// Grava leads / calls na planilha Google Sheets usando uma Service Account.
// Assina um JWT com WebCrypto (RS256), troca por access token OAuth2 e faz o
// append via Sheets API v4. Sem dependências externas — roda nativo no Worker.

interface ServiceAccount {
  client_email: string;
  private_key: string;
  token_uri?: string;
}

// Cache do access token entre requests da mesma isolate (evita re-assinar sempre).
let cachedToken: { token: string; exp: number } | null = null;

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

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.exp - 60 > now) return cachedToken.token;

  const tokenUri = sa.token_uri || "https://oauth2.googleapis.com/token";
  const scope = "https://www.googleapis.com/auth/spreadsheets";

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
  cachedToken = { token: data.access_token, exp: now + data.expires_in };
  return data.access_token;
}

/**
 * Faz append de uma linha na planilha.
 * @param values ordem das colunas na planilha
 */
export async function appendRow(
  saJson: string,
  spreadsheetId: string,
  sheetName: string,
  values: (string | number)[]
): Promise<void> {
  const sa: ServiceAccount = JSON.parse(saJson);
  const token = await getAccessToken(sa);

  const range = `${sheetName}!A1`;
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/` +
    `${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [values] }),
  });

  if (!res.ok) {
    throw new Error(`Falha ao gravar no Sheets: ${res.status} ${await res.text()}`);
  }
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
