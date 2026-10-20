import { neon } from "@neondatabase/serverless";
import type { RequestHandler } from "express";

export async function checkNeonConnection(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
  }

  const sql = neon(databaseUrl);
  await sql`SELECT 1`;
}

export function createNeonHealthHandler(
  checkConnection: () => Promise<void> = checkNeonConnection,
): RequestHandler {
  return async (_request, response) => {
    try {
      await checkConnection();
      response.json({
        status: "ok",
        service: "Neon",
        message: "Neon database is reachable",
      });
    } catch {
      response.status(503).json({
        status: "error",
        service: "Neon",
        message: "Unable to reach the Neon database",
      });
    }
  };
}
