"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "var(--toast-bg)",
              color: "var(--toast-fg)",
              border: "1px solid var(--toast-border)",
            },
          }}
        />
      </ThemeProvider>
    </SessionProvider>
  );
}
