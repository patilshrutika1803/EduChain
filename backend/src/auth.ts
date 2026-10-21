import type { Request, RequestHandler } from "express";
import type { User } from "@supabase/supabase-js";
import {
  getSupabaseClient,
  getSupabaseConfiguration,
} from "./supabase.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

declare global {
  namespace Express {
    interface Request {
      authUser?: User;
      authAccessToken?: string;
    }
  }
}

export const requireSupabaseAuth: RequestHandler = async (
  request,
  response,
  next,
) => {
  const configuration = getSupabaseConfiguration();
  if (!configuration) {
    response.status(503).json({
      status: "error",
      message: "Supabase authentication is not configured",
    });
    return;
  }

  const authorization = request.header("authorization");
  const match = authorization?.match(/^Bearer ([^\s]+)$/i);
  if (!match) {
    response.status(401).json({
      status: "error",
      message: "A valid bearer token is required",
    });
    return;
  }

  try {
    const { data, error } = await getSupabaseClient(configuration).auth.getUser(
      match[1],
    );
    if (error || !data.user) {
      response.status(401).json({
        status: "error",
        message: "The bearer token is invalid or expired",
      });
      return;
    }

    request.authUser = data.user;
    request.authAccessToken = match[1];
    next();
  } catch (error) {
    const errorName = error instanceof Error ? error.name : "UnknownError";
    console.error(`[Auth] Supabase token verification failed (${errorName})`);
    response.status(503).json({
      status: "error",
      message: "Unable to verify the Supabase session",
    });
  }
};

export function getAuthenticatedUser(request: Request): User | undefined {
  return request.authUser;
}

export function isDesignatedPlatformAdmin(
  profileRole: unknown,
  profileId: string,
  designatedAdminUserId = process.env.EDUCHAIN_ADMIN_USER_ID,
): boolean {
  const configuredId = designatedAdminUserId?.trim();
  return (
    profileRole === "platform_admin" &&
    configuredId !== undefined &&
    UUID_PATTERN.test(configuredId) &&
    profileId === configuredId
  );
}
