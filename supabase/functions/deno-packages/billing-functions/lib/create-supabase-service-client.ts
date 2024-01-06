import {createSupabaseClient} from "../deps.ts";
import {Database} from "../types/basejump-database.ts";

export default function () {
    const supabase = createSupabaseClient<Database>(
        Deno.env.get("SUPABASE_URL") as string,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string
    );
    return supabase;
}
