import React, { FC, ReactElement, useState } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { Theme } from "react-daisyui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { ToastContainer } from "react-toastify";
import { Database } from "@/types/supabase-types";
import { SessionContextProvider } from "@supabase/auth-helpers-react/src/components/SessionContext";

const queryClient = new QueryClient();

const AllTheProviders: FC<{ children: ReactElement }> = ({ children }) => {
  const [supabaseClient] = useState(() =>
    createBrowserSupabaseClient<Database>()
  );

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      <QueryClientProvider client={queryClient}>
        <Theme>{children}</Theme>
      </QueryClientProvider>
      <ToastContainer />
    </SessionContextProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
