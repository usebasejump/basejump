import "../styles/global.css";
import "react-toastify/dist/ReactToastify.css";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ContentLayout from "../components/content-pages/content-layout";
import DashboardLayout from "../components/dashboard/dashboard-layout";
import { Theme } from "react-daisyui";
import useThemeStorage from "@/utils/use-theme-storage";
import { ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { Database } from "@/types/supabase-types";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps, router }: AppProps) {
  const isDashboardPath = router.pathname.startsWith("/dashboard");
  const { theme } = useThemeStorage();
  const [supabaseClient] = useState(() =>
    createBrowserSupabaseClient<Database>()
  );

  useEffect(() => {
    // our dropdowns are used for navigation a lot
    // they work off css focus states, so they don't get removed
    // on navigation transitions.  this is a hack to force them to
    const element = window?.document?.activeElement as HTMLElement;
    if (typeof element?.blur === "function") {
      element.blur();
    }
  }, [router.asPath]);
  return (
    <Theme dataTheme={theme}>
      <SessionContextProvider
        supabaseClient={supabaseClient}
        initialSession={pageProps.initialSession}
      >
        <QueryClientProvider client={queryClient}>
          {isDashboardPath ? (
            <DashboardLayout>
              <Component {...pageProps} />
            </DashboardLayout>
          ) : (
            <ContentLayout>
              <Component {...pageProps} />
            </ContentLayout>
          )}
        </QueryClientProvider>
      </SessionContextProvider>
      <ToastContainer />
    </Theme>
  );
}

export default MyApp;
