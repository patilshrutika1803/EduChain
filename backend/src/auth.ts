import type { Request, RequestHandler } from "express";
import type { User } from "@supabase/supabase-js";
import {
  getSupabaseClient,
  getSupabaseConfiguration,
} from "./supabase.js";

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
