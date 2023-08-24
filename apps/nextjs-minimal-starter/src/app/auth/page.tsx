"use client";
import { Auth, BasejumpTheme } from "@usebasejump/react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AuthPage() {
  const supabaseClient = createClientComponentClient();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full md:max-w-md mx-auto border text-center p-12 rounded">
        <Auth
          supabaseClient={supabaseClient}
          appearance={{ theme: BasejumpTheme }}
          theme="default"
        />
      </div>
    </main>
  );
}
