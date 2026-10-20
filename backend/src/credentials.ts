import { createHash, randomUUID } from "node:crypto";
import { Router, type Request, type Response } from "express";
import {
  getSupabaseConfiguration,
  getSupabaseServiceRoleClient,
  getSupabaseUserClient,
} from "./supabase.js";
import { getAuthenticatedUser } from "./auth.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface CredentialIssueInput {
  studentProfileId: string;
  qualificationName: string;
  graduationDate: string;
}

export interface StoredCredential {
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

export function validateCredentialIssueInput(
  value: unknown,
): CredentialIssueInput | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }

  const input = value as Record<string, unknown>;
  if (
    typeof input.studentProfileId !== "string" ||
    !UUID_PATTERN.test(input.studentProfileId) ||
    typeof input.qualificationName !== "string" ||
    !input.qualificationName.trim() ||
    input.qualificationName.trim().length > 200 ||
    typeof input.graduationDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(input.graduationDate)
  ) {
    return undefined;
  }

  const parsedDate = new Date(`${input.graduationDate}T00:00:00.000Z`);
  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== input.graduationDate
  ) {
    return undefined;
  }

  return {
    studentProfileId: input.studentProfileId,
    qualificationName: input.qualificationName.trim(),
    graduationDate: input.graduationDate,
  };
}

export function isAuthorizedIssuerMembership(
  membershipRole: string,
): boolean {
  return membershipRole === "institution_admin" || membershipRole === "issuer";
}

export function canIssueCredential(
  profileRole: string | undefined,
  membershipRole: string | undefined,
): boolean {
  return (
    profileRole === "institution_admin" &&
    membershipRole !== undefined &&
    isAuthorizedIssuerMembership(membershipRole)
  );
}

function respondDatabaseUnavailable(response: Response): void {
  response.status(503).json({
    status: "error",
    code: "credential_database_unavailable",
    message:
      "Credential storage is unavailable. A database owner must validate and apply the credential permissions before enabling issuance.",
  });
}

function getRequestContext(request: Request) {
  const user = getAuthenticatedUser(request);
  const accessToken = request.authAccessToken;
  const configuration = getSupabaseConfiguration();
  if (!user || !accessToken || !configuration) return undefined;

  return {
    user,
    client: getSupabaseUserClient(configuration, accessToken),
  };
}

async function getProfileRole(
  client: ReturnType<typeof getSupabaseUserClient>,
  userId: string,
): Promise<string | undefined> {
  const { data, error } = await client
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return typeof data?.role === "string" ? data.role : undefined;
}

async function getVerifiedMemberships(
  client: ReturnType<typeof getSupabaseUserClient>,
  userId: string,
): Promise<Array<{ institutionId: string; membershipRole: string }>> {
  const { data: memberships, error: membershipError } = await client
    .from("institution_memberships")
    .select("institution_id,membership_role")
    .eq("profile_id", userId)
    .eq("membership_status", "active");
  if (membershipError) throw membershipError;

  const institutionIds = [
    ...new Set(
      (memberships ?? []).flatMap((membership) =>
        typeof membership.institution_id === "string"
          ? [membership.institution_id]
          : [],
      ),
    ),
  ];
  if (institutionIds.length === 0) return [];

  const { data: institutions, error: institutionError } = await client
    .from("institutions")
    .select("id")
    .in("id", institutionIds)
    .eq("verification_status", "verified");
  if (institutionError) throw institutionError;

  const verifiedIds = new Set(
    (institutions ?? []).flatMap((institution) =>
      typeof institution.id === "string" ? [institution.id] : [],
    ),
  );
  return (memberships ?? []).flatMap((membership) =>
    typeof membership.institution_id === "string" &&
    typeof membership.membership_role === "string" &&
    verifiedIds.has(membership.institution_id)
      ? [
          {
            institutionId: membership.institution_id,
            membershipRole: membership.membership_role,
          },
        ]
      : [],
  );
}

function toStoredCredential(value: unknown): StoredCredential | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const record = value as Record<string, unknown>;
  if (
    typeof record.id !== "string" ||
    typeof record.credential_identifier !== "string" ||
    typeof record.student_profile_id !== "string" ||
    typeof record.issuing_institution_id !== "string" ||
    typeof record.qualification_name !== "string" ||
    typeof record.graduation_date !== "string" ||
    typeof record.issue_date !== "string" ||
    typeof record.status !== "string" ||
    typeof record.commitment_hash !== "string" ||
    typeof record.created_at !== "string"
  ) {
    return undefined;
  }

  if (
    record.status !== "active" &&
    record.status !== "suspended" &&
    record.status !== "revoked"
  ) {
    return undefined;
  }

  return {
    id: record.id,
    credential_identifier: record.credential_identifier,
    student_profile_id: record.student_profile_id,
    issuing_institution_id: record.issuing_institution_id,
    qualification_name: record.qualification_name,
    graduation_date: record.graduation_date,
    issue_date: record.issue_date,
    status: record.status,
    commitment_hash: record.commitment_hash,
    blockchain_transaction_hash:
      typeof record.blockchain_transaction_hash === "string"
        ? record.blockchain_transaction_hash
        : null,
    contract_address:
      typeof record.contract_address === "string" ? record.contract_address : null,
    created_at: record.created_at,
  };
}

async function loadReadableCredentials(
  request: Request,
  response: Response,
  credentialIdentifier?: string,
): Promise<void> {
  const context = getRequestContext(request);
  if (!context) {
    response.status(503).json({
      status: "error",
      message: "Credential database configuration is unavailable",
    });
    return;
  }

  try {
    const role = await getProfileRole(context.client, context.user.id);
    if (role !== "student" && role !== "institution_admin") {
      response.status(403).json({
        status: "error",
        code: "unsupported_profile_role",
        message: "This account is not authorized to access credentials",
      });
      return;
    }

    let query = context.client
      .from("credentials")
      .select(
        "id,credential_identifier,student_profile_id,issuing_institution_id,qualification_name,graduation_date,issue_date,status,commitment_hash,blockchain_transaction_hash,contract_address,created_at",
      );
    if (role === "student") {
      query = query.eq("student_profile_id", context.user.id);
    } else {
      const memberships = await getVerifiedMemberships(
        context.client,
        context.user.id,
      );
      const institutionIds = [
        ...new Set(memberships.map((membership) => membership.institutionId)),
      ];
      if (institutionIds.length === 0) {
        response.json({ credentials: [] });
        return;
      }
      query = query.in("issuing_institution_id", institutionIds);
    }

    if (credentialIdentifier) {
      query = query.eq("credential_identifier", credentialIdentifier);
    }
    const { data, error } = await query.order("created_at", {
      ascending: false,
    });
    if (error) {
      console.error(`[Credentials read] Database query failed (${error.code || "unknown"})`);
      respondDatabaseUnavailable(response);
      return;
    }

    const credentials = (data ?? []).map(toStoredCredential);
    if (credentials.some((credential) => !credential)) {
      console.error("[Credentials read] Database returned an unexpected record shape");
      respondDatabaseUnavailable(response);
      return;
    }

    if (credentialIdentifier && credentials.length === 0) {
      response.status(404).json({
        status: "error",
        code: "credential_not_found",
        message: "Credential not found",
      });
      return;
    }
    response.json(
      credentialIdentifier
        ? { credential: credentials[0] }
        : { credentials },
    );
  } catch (error) {
    const errorName = error instanceof Error ? error.name : "UnknownError";
    console.error(`[Credentials read] Authorization or database lookup failed (${errorName})`);
    respondDatabaseUnavailable(response);
  }
}

const credentialsRouter = Router();

credentialsRouter.get("/", async (request, response) => {
  await loadReadableCredentials(request, response);
});

credentialsRouter.get("/:credentialIdentifier", async (request, response) => {
  await loadReadableCredentials(request, response, request.params.credentialIdentifier);
});

credentialsRouter.post("/", async (request, response) => {
  const input = validateCredentialIssueInput(request.body);
  if (!input) {
    response.status(400).json({
      status: "error",
      code: "invalid_credential",
      message:
        "Provide a student profile UUID, a qualification name up to 200 characters, and a valid graduation date.",
    });
    return;
  }

  const context = getRequestContext(request);
  if (!context) {
    response.status(503).json({
      status: "error",
      message: "Credential database configuration is unavailable",
    });
    return;
  }

  try {
    const role = await getProfileRole(context.client, context.user.id);
    if (role !== "institution_admin") {
      response.status(403).json({
        status: "error",
        code: "issuer_role_required",
        message: "Only institution administrators may issue credentials",
      });
      return;
    }

    const memberships = await getVerifiedMemberships(
      context.client,
      context.user.id,
    );
    const issuerMembership = memberships.find(
      (membership) =>
        canIssueCredential(role, membership.membershipRole),
    );
    if (!issuerMembership) {
      response.status(403).json({
        status: "error",
        code: "verified_issuer_membership_required",
        message:
          "Issuance requires an active issuer or institution administrator membership at a verified institution",
      });
      return;
    }

    const serviceClient = getSupabaseServiceRoleClient();
    if (!serviceClient) {
      respondDatabaseUnavailable(response);
      return;
    }

    const { data: studentProfile, error: studentError } = await serviceClient
      .from("profiles")
      .select("id,role")
      .eq("id", input.studentProfileId)
      .maybeSingle();
    if (studentError) {
      console.error(`[Credential issue] Student lookup failed (${studentError.code || "unknown"})`);
      respondDatabaseUnavailable(response);
      return;
    }
    if (!studentProfile || studentProfile.role !== "student") {
      response.status(400).json({
        status: "error",
        code: "student_profile_required",
        message: "The target profile must be an existing student account",
      });
      return;
    }

    const credentialIdentifier = `EDU-${randomUUID()}`;
    const commitment = createHash("sha256")
      .update(
        JSON.stringify({
          credentialIdentifier,
          studentProfileId: input.studentProfileId,
          issuingInstitutionId: issuerMembership.institutionId,
          qualificationName: input.qualificationName,
          graduationDate: input.graduationDate,
        }),
      )
      .digest("hex");
    const { data, error } = await serviceClient
      .from("credentials")
      .insert({
        credential_identifier: credentialIdentifier,
        student_profile_id: input.studentProfileId,
        issuing_institution_id: issuerMembership.institutionId,
        qualification_name: input.qualificationName,
        graduation_date: input.graduationDate,
        status: "active",
        commitment_hash: `\\x${commitment}`,
      })
      .select(
        "id,credential_identifier,student_profile_id,issuing_institution_id,qualification_name,graduation_date,issue_date,status,commitment_hash,blockchain_transaction_hash,contract_address,created_at",
      )
      .single();
    if (error) {
      console.error(`[Credential issue] Insert failed (${error.code || "unknown"})`);
      respondDatabaseUnavailable(response);
      return;
    }

    const credential = toStoredCredential(data);
    if (!credential) {
      console.error("[Credential issue] Database returned an unexpected record shape");
      respondDatabaseUnavailable(response);
      return;
    }
    response.status(201).json({ credential });
  } catch (error) {
    const errorName = error instanceof Error ? error.name : "UnknownError";
    console.error(`[Credential issue] Authorization or database lookup failed (${errorName})`);
    respondDatabaseUnavailable(response);
  }
});

export default credentialsRouter;
