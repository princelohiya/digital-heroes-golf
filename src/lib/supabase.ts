import { createClient } from "@supabase/supabase-js";

// We use the non-null assertion operator (!) to tell TypeScript
// that we guarantee these environment variables will exist at runtime.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
