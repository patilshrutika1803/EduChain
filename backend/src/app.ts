import express from "express";
import {
  getSupabaseClient,
  getSupabaseConfiguration,
  getSupabaseUserClient,
} from "./supabase.js";
import {
  getAuthenticatedUser,
  isDesignatedPlatformAdmin,
  requireSupabaseAuth,
} from "./auth.js";
import credentialsRouter from "./credentials.js";
import { createNeonHealthHandler } from "./neon.js";
import { corsMiddleware } from "./cors.js";

const app = express();
app.use(corsMiddleware);
app.use(express.json({ limit: "16kb" }));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", service: "EduChain API" });
});

app.get("/api/health/neon", createNeonHealthHandler());

app.get("/api/health/supabase", async (_request, response) => {
  const configuration = getSupabaseConfiguration();

  if (!configuration) {
    const missingVariables = [
      "SUPABASE_URL",
      "SUPABASE_PUBLISHABLE_KEY",
    ].filter((name) => !process.env[name]?.trim());
    console.error(
      `[Supabase health] Missing configuration: ${missingVariables.join(", ")}`,
    );
    response.status(503).json({
      status: "error",
      service: "Supabase",
      message: "Supabase configuration is missing",
    });
    return;
  }

  try {
    getSupabaseClient(configuration);
    const healthUrl = new URL("/auth/v1/health", configuration.url);
    const healthResponse = await fetch(healthUrl, {
      headers: { apikey: configuration.publishableKey },
      signal: AbortSignal.timeout(5000),
    });

    if (!healthResponse.ok) {
      console.error(
        `[Supabase health] Auth health endpoint returned HTTP ${healthResponse.status}`,
      );
      response.status(503).json({
        status: "error",
        service: "Supabase",
        message: "Unable to reach the Supabase project",
      });
      return;
    }

    response.json({
      status: "ok",
      service: "Supabase",
      message: "Supabase project is reachable",
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      console.error("[Supabase health] Auth health request timed out");
    } else {
      const cause =
        error instanceof Error ? (error as Error & { cause?: unknown }).cause : undefined;
      const errorCode =
        typeof cause === "object" &&
        cause !== null &&
        "code" in cause &&
        typeof cause.code === "string" &&
        /^[A-Z0-9_]+$/.test(cause.code)
          ? cause.code
          : undefined;

      if (errorCode) {
        console.error(`[Supabase health] Network/DNS error: ${errorCode}`);
      } else {
        const errorName = error instanceof Error ? error.name : "UnknownError";
        console.error(
          `[Supabase health] Network request failed (${errorName})`,
        );
      }
    }
    response.status(503).json({
      status: "error",
      service: "Supabase",
      message: "Unable to reach the Supabase project",
    });
  }
});

app.get("/api/auth/me", requireSupabaseAuth, async (request, response) => {
  const user = getAuthenticatedUser(request);
  const accessToken = request.authAccessToken;
  const configuration = getSupabaseConfiguration();
  if (!user || !accessToken || !configuration) {
    response.status(401).json({
      status: "error",
      message: "A valid authenticated session is required",
    });
    return;
  }

  try {
    const { data, error } = await getSupabaseUserClient(
      configuration,
      accessToken,
    )
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error(
        `[Auth role] Profile lookup failed (${error.code || "unknown"})`,
      );
      response.status(503).json({
        status: "error",
        message: "Unable to verify the account profile; database setup may be incomplete",
      });
      return;
    }

    if (!data) {
      response.status(403).json({
        status: "error",
        code: "profile_not_found",
        message: "This authenticated account has no EduChain profile",
      });
      return;
    }

    if (data.role === "student") {
      response.json({ id: user.id, email: user.email, role: "student" });
      return;
    }
    if (data.role === "institution_admin") {
      response.json({ id: user.id, email: user.email, role: "institution" });
      return;
    }
    if (data.role === "platform_admin") {
      if (!isDesignatedPlatformAdmin(data.role, user.id)) {
        response.status(403).json({
          status: "error",
          code: "platform_admin_not_designated",
          message: "This platform administrator account is not designated for EduChain",
        });
        return;
      }
      response.json({ id: user.id, email: user.email, role: "platform_admin" });
      return;
    }

    response.status(403).json({
      status: "error",
      code: "unsupported_profile_role",
      message: "This account is not enabled for the EduChain application",
    });
  } catch (error) {
    const errorName = error instanceof Error ? error.name : "UnknownError";
    console.error(`[Auth role] Profile lookup failed (${errorName})`);
    response.status(503).json({
      status: "error",
      message: "Unable to verify the account profile; database setup may be incomplete",
    });
  }
});

app.use("/api/credentials", requireSupabaseAuth, credentialsRouter);

app.use(
  (
    error: unknown,
    _request: express.Request,
    response: express.Response,
    _next: express.NextFunction,
  ) => {
    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      error.status === 413
    ) {
      response.status(413).json({
        status: "error",
        code: "request_too_large",
        message: "Request body exceeds the 16 KB limit",
      });
      return;
    }
    if (
      error instanceof SyntaxError &&
      "status" in error &&
      error.status === 400
    ) {
      response.status(400).json({
        status: "error",
        code: "invalid_json",
        message: "Request body must contain valid JSON",
      });
      return;
    }
    console.error(
      `[API] Request failed (${error instanceof Error ? error.name : "UnknownError"})`,
    );
    response.status(500).json({
      status: "error",
      message: "The request could not be completed",
    });
  },
);

app.use((_request, response) => {
  response.status(404).json({ status: "error", message: "Not found" });
});

export default app;
