import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database';

function isValidHttpUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function createClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseUrl = isValidHttpUrl(rawUrl) ? rawUrl : 'https://redlab.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-anon-key';

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    isValidHttpUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project') &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
);
