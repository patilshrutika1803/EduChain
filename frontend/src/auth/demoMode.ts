export function isDemoModeEnabled(): boolean {
  return import.meta.env.VITE_EDUCHAIN_DEMO_MODE === 'true';
}
