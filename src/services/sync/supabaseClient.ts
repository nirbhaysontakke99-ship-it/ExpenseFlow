export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

export function getSupabaseConfig(): SupabaseConfig {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const isConfigured = Boolean(
    url &&
    anonKey &&
    !url.includes('your-supabase-project') &&
    url.startsWith('https://')
  );

  return {
    url,
    anonKey,
    isConfigured,
  };
}
