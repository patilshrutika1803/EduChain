import type { RequestHandler } from "express";

const PRODUCTION_ORIGINS = new Set(["https://edu-chain-eight.vercel.app"]);
const DEVELOPMENT_ORIGINS = new Set([
  "http://localhost:8443",
  "http://localhost:5173",
  "http://127.0.0.1:8443",
  "http://127.0.0.1:5173",
]);
const ALLOWED_METHODS = new Set(["GET", "POST", "OPTIONS"]);
const ALLOWED_HEADERS = new Set(["authorization", "content-type"]);

function getAllowedOrigins(): Set<string> {
  const origins = new Set(PRODUCTION_ORIGINS);
  if (process.env.NODE_ENV !== "production") {
    for (const origin of DEVELOPMENT_ORIGINS) origins.add(origin);
  }
  return origins;
}

export const corsMiddleware: RequestHandler = (request, response, next) => {
  const origin = request.header("origin");
  if (!origin) {
    if (request.method === "OPTIONS") {
      response.sendStatus(204);
      return;
    }
    next();
    return;
  }

  if (!getAllowedOrigins().has(origin)) {
    response.status(403).json({
      status: "error",
      code: "origin_not_allowed",
      message: "This origin is not allowed to access the API",
    });
    return;
  }

  response.setHeader("Access-Control-Allow-Origin", origin);
  response.setHeader("Vary", "Origin");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

  if (request.method !== "OPTIONS") {
    next();
    return;
  }

  const requestedMethod = request.header("access-control-request-method");
  const requestedHeaders = (request.header("access-control-request-headers") ?? "")
    .split(",")
    .map((header) => header.trim().toLowerCase())
    .filter(Boolean);

  if (
    (requestedMethod && !ALLOWED_METHODS.has(requestedMethod.toUpperCase())) ||
    requestedHeaders.some((header) => !ALLOWED_HEADERS.has(header))
  ) {
    response.status(403).json({
      status: "error",
      code: "preflight_not_allowed",
      message: "This cross-origin request is not allowed",
    });
    return;
  }

  response.sendStatus(204);
};
