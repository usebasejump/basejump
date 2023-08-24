"use client";
import Header from "../(marketing)/header.tsx";
import { ReactNode } from "react";
import { BasejumpUserSession } from "@usebasejump/react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function RootLayout({ children }: { children: ReactNode }) {
  const supabaseClient = createClientComponentClient();
  return (
    <>
      <Header />
      <BasejumpUserSession supabaseClient={supabaseClient}>
        {children}
      </BasejumpUserSession>
    </>
  );
}
