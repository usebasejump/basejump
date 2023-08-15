import { createSupabaseClient } from "../deps.ts";
import { BASEJUMP_DATABASE_SCHEMA } from "../mod.ts";

type AUTHORIZED_USER_INFO = {
  account_role: BASEJUMP_DATABASE_SCHEMA["public"]["Tables"]["account_user"]["Row"]["account_role"];
  is_primary_owner: boolean;
  is_personal_account: boolean;
};

type REQUIRE_AUTHORIZED_USER_OPTIONS = {
  accountId: string;
  authorizedRoles: string[];
  onUnauthorized?: () => Promise<Response>;
  onAuthorized: (roleInfo: AUTHORIZED_USER_INFO) => Promise<Response>;
  onError?: (e: Error) => Promise<Response>;
};

export async function requireAuthorizedUser(
  req: Request,
  options: REQUIRE_AUTHORIZED_USER_OPTIONS
): Promise<Response> {
  try {
    const authToken = req.headers.get("Authorization");
    // we don't have what we need. instant block.
    if (!authToken || !accountId) {
      if (options.onUnauthorized) {
        return await options.onUnauthorized();
      }
      return new Response("Unauthorized", { status: 401 });
    }

    const supabase = createSupabaseClient(authToken);
    const { data, error } = await supabase.rpc("current_user_account_role", {
      account_id: options.accountId,
    });
    // means this user isn't a member of this account, block
    if (!data || error) {
      if (options.onUnauthorized) {
        return await options.onUnauthorized();
      }
      return new Response("Unauthorized", { status: 401 });
    }

    // means this user is a member of this account, but not the right role, block
    if (!options.authorizedRoles.includes(data.account_role)) {
      if (options.onUnauthorized) {
        return await options.onUnauthorized();
      }
      return new Response("Unauthorized", { status: 401 });
    }

    // means this user is a member of this account, and has the right role, allow
    return await options.onAuthorized(data);
  } catch (e) {
    // something went wrong, throw an error
    if (options.onError) {
      return options.onError(e);
    } else {
      return new Response("Internal Error", { status: 500 });
    }
  }
}
