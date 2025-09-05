"use client";

import { ThemeProvider } from "next-themes";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class" // toggles `class="dark"` on <html>
      defaultTheme="system" // 'light' | 'dark' | 'system'
      enableSystem // follow OS theme when no user choice
      disableTransitionOnChange // avoid color-jumps when toggling
    >
      {children}
    </ThemeProvider>
  );
}
