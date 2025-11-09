/**
 * Supabase Admin Client
 * 
 * This client uses the SERVICE ROLE KEY which bypasses Row Level Security (RLS).
 * ⚠️ ONLY use this for server-side admin operations like:
 * - Loading initial data from JSON files
 * - Bulk data operations
 * - Administrative tasks
 * 
 * ⚠️ NEVER expose this client to the browser/frontend
 * ⚠️ NEVER use in API routes that users can call directly
 */

import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }

  if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Usage Example:
 * 
 * import { createAdminClient } from '@/lib/supabase/admin'
 * 
 * const adminClient = createAdminClient()
 * 
 * // Insert data bypassing RLS
 * await adminClient.from('companies').insert(companyData)
 * 
 * // Update data bypassing RLS
 * await adminClient.from('company_fundamentals').upsert(fundamentals)
 */

