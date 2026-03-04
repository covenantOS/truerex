import { createBrowserClient } from "@supabase/ssr";

// Using untyped client for now. Run `supabase gen types` after connecting
// to a real Supabase project to generate proper Database types.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
