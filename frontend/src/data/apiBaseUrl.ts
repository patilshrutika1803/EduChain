export const PRODUCTION_API_URL = "https://educhain-i345.onrender.com";

export function resolveApiBaseUrl(
  configuredBaseUrl: string | undefined,
  isDevelopment: boolean,
): string {
  const configured = configuredBaseUrl?.trim().replace(/\/+$/, "");
  if (configured) return configured;
  return isDevelopment ? "" : PRODUCTION_API_URL;
}
