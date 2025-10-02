"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [signingOut, startTransition] = useTransition();

  const toggleMobileMenu = () => setIsMobileMenuOpen((o) => !o);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Better Auth session hook
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user ?? null;

  const authedLinks = [
    { href: "/", label: "Página Inicial", icon: "🏠" },
    { href: "/practitioner/patients", label: "Pacientes", icon: "🧑‍⚕️" },
    { href: "/practitioner/agenda", label: "Agenda", icon: "🗓️" },
    { href: "/admin/treasury", label: "Financeiro", icon: "💳" },
  ];

  const handleSignOut = () => {
    startTransition(async () => {
      await authClient.signOut();
      // session hook will revalidate automatically
      closeMobileMenu();
      redirect("/");
    });
  };

  const LoginButton = (
    <Link href="/sign-in">
      <button className="relative overflow-hidden rounded-lg bg-gradient-to-r from-indigo-700 via-blue-600 to-blue-500 px-3 py-2 text-xs font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-indigo-700 hover:via-blue-600 hover:to-blue-600 hover:shadow-xl active:scale-95 sm:rounded-xl sm:px-4 sm:text-sm">
        <div className="relative z-10 flex items-center gap-1 sm:gap-2">
          <span>Login</span>
          <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
          </svg>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </button>
    </Link>
  );

  const Avatar = (
    <div className="flex items-center gap-2">
      <div className="rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 p-[2px]">
        <div className="h-8 w-8 rounded-full bg-white text-sm font-semibold text-gray-700 grid place-items-center overflow-hidden dark:bg-gray-900 dark:text-gray-200 sm:h-9 sm:w-9">
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt={user.name ?? "Avatar"} className="h-full w-full object-cover rounded-full" />
          ) : (
            (user?.name?.[0] ?? user?.email?.[0] ?? "U").toUpperCase()
          )}
        </div>
      </div>
      <button
        onClick={handleSignOut}
        disabled={signingOut || isPending}
        className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-blue-50/70 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-blue-900/20 sm:text-sm"
        title="Sair"
      >
        Sair
      </button>
    </div>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-blue-900/10 dark:border-blue-200/10 shadow-lg shadow-gray-900/5 dark:shadow-black/30">
      <div className="max-w-screen px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between sm:h-16">
          {/* Brand */}
          <div className="flex items-center">
            <Link
              href="/"
              className="group flex flex-shrink-0 items-center gap-2 sm:gap-3 transition-all duration-300 hover:scale-105"
              onClick={closeMobileMenu}
            >
              <div className="group relative rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-blue-50/50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 lg:px-4">
                <div>
                  <span className="hidden sm:inline text-lg">Paula Moreno</span>
                </div>
                <div>
                  <span className="hidden text-sm sm:inline">Pilates &amp; Fisioterapia</span>
                </div>
                <span className="sm:hidden">Paula Moreno - Pilates &amp; Fisioterapia</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation (only when signed in) */}
          {user && (
            <div className="hidden items-center space-x-1 md:flex">
              {authedLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-blue-50/50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 lg:px-4"
                >
                  <span className="relative z-10">{item.label}</span>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 to-blue-500/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          )}

          {/* Right Section (auth controls) */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Desktop auth */}
            <div className="hidden sm:block">
              {!user ? LoginButton : Avatar}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden rounded-lg p-1.5 text-gray-600 transition-all duration-200 hover:bg-blue-50/50 hover:text-blue-600 active:scale-95 dark:text-gray-300 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 sm:rounded-xl sm:p-2"
              aria-label="Toggle mobile menu"
            >
              <svg
                className={`h-5 w-5 transition-transform duration-200 sm:h-6 sm:w-6 ${isMobileMenuOpen ? "rotate-90" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-96 opacity-100 pb-3 sm:pb-4" : "max-h-0 overflow-hidden opacity-0"
          }`}
        >
          <div className="mt-2 space-y-1 rounded-xl border border-blue-900/10 bg-white/80 px-2 pt-2 pb-3 shadow-lg backdrop-blur-sm dark:border-blue-200/10 dark:bg-gray-800/80">
            {/* Mobile: signed-in links */}
            {user && (
              <>
                {authedLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="active:scale-95 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-blue-50/50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                    onClick={closeMobileMenu}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </>
            )}

            {/* Mobile: auth controls */}
            <div className="border-t border-gray-200/50 pt-3 dark:border-gray-600/50">
              {!user ? (
                <Link href="/sign-in" onClick={closeMobileMenu}>
                  <button className="active:scale-95 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-700 via-blue-600 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:brightness-105 hover:shadow-xl">
                    <span>Login</span>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                    </svg>
                  </button>
                </Link>
              ) : (
                <div className="flex items-center justify-between rounded-xl border border-blue-900/10 bg-gradient-to-r from-blue-100/50 to-blue-50/50 p-3 backdrop-blur-sm dark:border-blue-200/30 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-white grid place-items-center text-sm font-semibold text-gray-700 overflow-hidden dark:bg-gray-900 dark:text-gray-200">
                      {user?.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.image} alt={user.name ?? "Avatar"} className="h-full w-full object-cover rounded-full" />
                      ) : (
                        (user?.name?.[0] ?? user?.email?.[0] ?? "U").toUpperCase()
                      )}
                    </div>
                    <span className="text-sm">{user?.name ?? user?.email}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    disabled={signingOut || isPending}
                    className="rounded-xl bg-gradient-to-r from-indigo-700 via-blue-600 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:brightness-105 disabled:opacity-60 active:scale-95"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
