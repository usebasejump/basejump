"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useAccount } from "@usebasejump/react";
import { useParams } from "next/navigation";

export default function AccountIndex() {
  const { accountSlug } = useParams();

  const supabaseClient = createClientComponentClient();

  const { data } = useAccount({ supabaseClient, accountSlug });
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Welcome back, {data?.name}</h1>
    </main>
  );
}
