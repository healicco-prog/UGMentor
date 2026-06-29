import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️  Supabase URL or Service Role Key is missing from environment variables.');
}

// Server-side Supabase client using the service role key (bypasses RLS)
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
