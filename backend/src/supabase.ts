import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface SupabaseConfiguration {
  url: string;
  publishableKey: string;
}

let supabaseClient: SupabaseClient | undefined;
let configuredUrl: string | undefined;
let configuredPublishableKey: string | undefined;
let serviceRoleClient: SupabaseClient | undefined;
let configuredServiceRoleUrl: string | undefined;
let configuredServiceRoleKey: string | undefined;

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

export function getSupabaseUserClient(
  configuration: SupabaseConfiguration,
  accessToken: string,
): SupabaseClient {
  return createClient(
    configuration.url,
    configuration.publishableKey,
    {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    },
  );
}

export function getSupabaseServiceRoleClient():
  | SupabaseClient
  | undefined {
  if (process.env.EDUCHAIN_DATABASE_HARDENING_VALIDATED !== "true") {
    return undefined;
  }

  const configuration = getSupabaseConfiguration();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!configuration || !serviceRoleKey) {
    return undefined;
  }

  if (
    !serviceRoleClient ||
    configuredServiceRoleUrl !== configuration.url ||
    configuredServiceRoleKey !== serviceRoleKey
  ) {
    serviceRoleClient = createClient(configuration.url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });
    configuredServiceRoleUrl = configuration.url;
    configuredServiceRoleKey = serviceRoleKey;
  }

  return serviceRoleClient;
}
