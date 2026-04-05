import { createClient } from '@supabase/supabase-js';

// These should be configured in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// For server-side operations, we use a service role key if available to bypass RLS
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
