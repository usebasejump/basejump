import { useRouter } from "next/router";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useEffect } from "react";

/**
 * There's an issue with Supabase Auth where oauth and magic links don't work with middleware
 * on the initial page load.  This is because the token is sent over a hash param which
 * is not sent to the server. This hook sits client side, checks for an authenticated session on the login
 * page, and redirects the user if it's found.
 * @param redirectedFrom
 */
const useAuthCheck = (redirectedFrom?: string) => {
  const { replace } = useRouter();
  const { session } = useSessionContext();

  useEffect(() => {
    if (session && redirectedFrom) {
      replace(redirectedFrom as string);
    }
  }, [session, redirectedFrom, replace]);
};

export default useAuthCheck;
