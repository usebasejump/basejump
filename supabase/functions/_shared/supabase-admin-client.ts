import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Database } from "./types/supabase.ts";

const supabaseAdmin = createClient<Database>(
  Deno.env.get("SUPABASE_URL") as string,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string
);

export default supabaseAdmin;
