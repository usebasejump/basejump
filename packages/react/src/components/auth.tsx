"use client";
/**
 * Re-export Auth from @supabase/auth-ui-react
 * This is to make it easier to use alongside basejump, and also to make sure we can lock a tested version
 * alongside basejump
 */

"use client";

import { ComponentPropsWithoutRef } from "react";
import { BasePropsWithClient } from "../types/base-props";
import { Auth as InternalAuth } from "@supabase/auth-ui-react";

type Props = BasePropsWithClient & ComponentPropsWithoutRef<typeof Auth>;

export const Auth = ({ view = "sign_in", supabaseClient, ...props }: Props) => {
  return (
    <>
      <InternalAuth view={view} supabaseClient={supabaseClient} {...props} />
    </>
  );
};
