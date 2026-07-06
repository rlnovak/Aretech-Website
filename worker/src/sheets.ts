// Grava leads / calls na planilha Google Sheets usando a Service Account.
// Usa o token OAuth2 compartilhado (google-auth) e faz o append via Sheets API v4.

import { getAccessToken, parseServiceAccount } from "./google-auth";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

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
  const sa = parseServiceAccount(saJson);
  const token = await getAccessToken(sa, SHEETS_SCOPE);

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

// Reexporta nowBrasilia para não quebrar imports existentes.
export { nowBrasilia } from "./google-auth";
