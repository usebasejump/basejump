import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Database } from "./types/supabase.ts";

export default function (authToken: string) {
  const supabase = createClient<Database>(
    Deno.env.get("SUPABASE_URL") as string,
    Deno.env.get("SUPABASE_ANON_KEY") as string,
    {
      global: { headers: { Authorization: authToken } },
    }
  );
  return supabase;
}
