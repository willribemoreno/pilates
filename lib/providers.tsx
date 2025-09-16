"use client";

import { ThemeProvider } from "next-themes";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}   // <- prevents OS dark from kicking in
      forcedTheme="light"    // <- hard-force light everywhere
      disableTransitionOnChange // avoid color-jumps when toggling
    >
      {children}
    </ThemeProvider>
  );
}
