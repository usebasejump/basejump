import { createSupabaseClient } from "../deps.ts";
import { Database } from "./types/supabase.ts";

export default function (authToken: string) {
  const supabase = createSupabaseClient<Database>(
    Deno.env.get("SUPABASE_URL") as string,
    Deno.env.get("SUPABASE_ANON_KEY") as string,
    {
      global: { headers: { Authorization: authToken } },
    }
  );
  return supabase;
}
