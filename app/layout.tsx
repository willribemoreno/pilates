import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "../lib/providers"; // next-themes provider
import { ClerkProvider } from "@clerk/nextjs"; // <-- use directly
import { ptBR } from "@clerk/localizations";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased
                    bg-gray-100 dark:bg-gray-900
                    text-gray-800 dark:text-gray-200
                    transition-colors duration-300`}
      >
        <Providers>
          <ClerkProvider localization={ptBR}>
            <Navbar />
            {children}
            <Footer />
          </ClerkProvider>
        </Providers>
      </body>
    </html>
  );
}
