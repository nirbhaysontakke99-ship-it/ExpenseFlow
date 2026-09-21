import { getSupabaseConfig } from './supabaseClient';
import type { SyncQueueItem } from '@/data/models/SyncQueueItem';

export interface PushResult {
  success: boolean;
  error?: string;
  isMocked: boolean;
}

export async function pushSyncQueueItem(item: SyncQueueItem): Promise<PushResult> {
  const config = getSupabaseConfig();

  if (!config.isConfigured) {
    // Unconfigured Supabase environment: return mock success so local Dexie operations queue safely
    return {
      success: true,
      isMocked: true,
    };
  }

  try {
    // Real Supabase HTTP fetch push abstraction
    const endpoint = `${config.url}/rest/v1/${item.entity_type}s`;
    const response = await fetch(endpoint, {
      method: item.operation === 'DELETE' ? 'DELETE' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
        Prefer: 'resolution=merge-duplicates',
      },
      body: item.operation === 'DELETE' ? undefined : JSON.stringify(item.payload),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Supabase returned status ${response.status}`,
        isMocked: false,
      };
    }

    return {
      success: true,
      isMocked: false,
    };
  } catch (err) {
    return {
      success: false,
      error: (err as Error).message || 'Network fetch error',
      isMocked: false,
    };
  }
}
