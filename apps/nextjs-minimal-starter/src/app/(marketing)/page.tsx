'use client';
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";

export default function Home() {
    const supabaseClient = createClientComponentClient();
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <h1>woooo</h1>
        </main>
    )
}
