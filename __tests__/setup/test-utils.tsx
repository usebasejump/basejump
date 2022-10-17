import React, { FC, ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { Theme } from "react-daisyui";
import { UserProvider } from "@supabase/auth-helpers-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabaseClient } from "@supabase/auth-helpers-nextjs";
import { ToastContainer } from "react-toastify";

const queryClient = new QueryClient();

const AllTheProviders: FC<{ children: ReactElement }> = ({ children }) => {
  return (
    <UserProvider supabaseClient={supabaseClient}>
      <QueryClientProvider client={queryClient}>
        <Theme>{children}</Theme>
      </QueryClientProvider>
      <ToastContainer />
    </UserProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
