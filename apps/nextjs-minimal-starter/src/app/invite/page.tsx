"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { AcceptInvitation, BasejumpUserSession } from "@usebasejump/react";

export default function Invite() {
  const supabaseClient = createClientComponentClient();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <BasejumpUserSession supabaseClient={supabaseClient}>
        <div className="w-full md:max-w-md mx-auto border text-center p-12 rounded">
          <AcceptInvitation
            token={token}
            supabaseClient={supabaseClient}
            afterAccepted={(account) =>
              router.push(`/dashboard/${account.slug}`)
            }
          />
        </div>
      </BasejumpUserSession>
    </main>
  );
}
