import express from "express";
import {
  getSupabaseClient,
  getSupabaseConfiguration,
} from "./supabase.js";

const app = express();

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", service: "EduChain API" });
});

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

app.use((_request, response) => {
  response.status(404).json({ status: "error", message: "Not found" });
});

export default app;
