import { useEffect, useState } from "react";
import { listApiCredentials, type ApiCredential } from "./credentialApi";

interface ApiCredentialRecordsState {
  credentials: ApiCredential[];
  error: string;
  loading: boolean;
}

export function useApiCredentialRecords(
  enabled: boolean,
): ApiCredentialRecordsState {
  const [state, setState] = useState<ApiCredentialRecordsState>({
    credentials: [],
    error: "",
    loading: enabled,
  });

  useEffect(() => {
    if (!enabled) {
      setState({ credentials: [], error: "", loading: false });
      return;
    }

    let active = true;
    setState({ credentials: [], error: "", loading: true });
    void listApiCredentials()
      .then((credentials) => {
        if (active) setState({ credentials, error: "", loading: false });
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            credentials: [],
            error:
              error instanceof Error
                ? error.message
                : "Unable to load credentials from the API.",
            loading: false,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [enabled]);

  return state;
}
