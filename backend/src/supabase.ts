import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface SupabaseConfiguration {
  url: string;
  publishableKey: string;
}

let supabaseClient: SupabaseClient | undefined;
let configuredUrl: string | undefined;
let configuredPublishableKey: string | undefined;

export function getSupabaseConfiguration():
  | SupabaseConfiguration
  | undefined {
  const url = process.env.SUPABASE_URL?.trim();
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !publishableKey) {
    return undefined;
  }

  return { url, publishableKey };
}

export function getSupabaseClient(
  configuration: SupabaseConfiguration,
): SupabaseClient {
  if (
    !supabaseClient ||
    configuredUrl !== configuration.url ||
    configuredPublishableKey !== configuration.publishableKey
  ) {
    supabaseClient = createClient(
      configuration.url,
      configuration.publishableKey,
      {
        auth: {
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false,
        },
      },
    );
    configuredUrl = configuration.url;
    configuredPublishableKey = configuration.publishableKey;
  }

  return supabaseClient;
}
