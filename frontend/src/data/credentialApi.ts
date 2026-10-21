import { getBrowserSupabaseClient } from "../auth/supabase";
import { API_BASE_URL } from "./configuredApiBaseUrl";

export interface ApiCredential {
  id: string;
  credential_identifier: string;
  student_profile_id: string;
  issuing_institution_id: string;
  qualification_name: string;
  graduation_date: string;
  issue_date: string;
  status: "active" | "suspended" | "revoked";
  commitment_hash: string;
  blockchain_transaction_hash: string | null;
  contract_address: string | null;
  created_at: string;
}

export interface IssueCredentialRequest {
  studentProfileId: string;
  qualificationName: string;
  graduationDate: string;
}

async function authorizedFetch(
  path: string,
  init: RequestInit = {},
): Promise<unknown> {
  const client = getBrowserSupabaseClient();
  if (!client) {
    throw new Error("Supabase authentication is not configured.");
  }

  const { data, error } = await client.auth.getSession();
  if (error) throw new Error("Unable to restore the authenticated session.");
  const accessToken = data.session?.access_token;
  if (!accessToken) throw new Error("A signed-in session is required.");

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  if (init.body) headers.set("Content-Type", "application/json");

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new Error("The credential API is unavailable. No credential was saved.");
  }

  const result: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof result === "object" &&
      result !== null &&
      "message" in result &&
      typeof result.message === "string"
        ? result.message
        : "The credential request failed.";
    throw new Error(message);
  }
  return result;
}

function isApiCredential(value: unknown): value is ApiCredential {
  if (typeof value !== "object" || value === null) return false;
  const credential = value as Record<string, unknown>;
  return (
    typeof credential.id === "string" &&
    typeof credential.credential_identifier === "string" &&
    typeof credential.student_profile_id === "string" &&
    typeof credential.issuing_institution_id === "string" &&
    typeof credential.qualification_name === "string" &&
    typeof credential.graduation_date === "string" &&
    typeof credential.issue_date === "string" &&
    (credential.status === "active" ||
      credential.status === "suspended" ||
      credential.status === "revoked") &&
    typeof credential.commitment_hash === "string" &&
    (typeof credential.blockchain_transaction_hash === "string" ||
      credential.blockchain_transaction_hash === null) &&
    (typeof credential.contract_address === "string" ||
      credential.contract_address === null) &&
    typeof credential.created_at === "string"
  );
}

export async function listApiCredentials(): Promise<ApiCredential[]> {
  const result = await authorizedFetch("/api/credentials");
  if (
    typeof result !== "object" ||
    result === null ||
    !("credentials" in result) ||
    !Array.isArray(result.credentials) ||
    !result.credentials.every(isApiCredential)
  ) {
    throw new Error("The credential API returned an invalid response.");
  }
  return result.credentials;
}

export async function issueCredential(
  input: IssueCredentialRequest,
): Promise<ApiCredential> {
  const result = await authorizedFetch("/api/credentials", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (
    typeof result !== "object" ||
    result === null ||
    !("credential" in result) ||
    !isApiCredential(result.credential)
  ) {
    throw new Error("The credential API returned an invalid response.");
  }
  return result.credential;
}
