// app/agenda/layout.tsx
import { ReactNode } from "react";
import { headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function ProtectedPractitionerLayout({ children }: { children: ReactNode }) {
  // Convert ReadonlyHeaders -> real Headers
  const h = new Headers(await nextHeaders());
  const sess = await auth.api.getSession({ headers: h }); // Node runtime → works with Prisma

  if (!sess?.session) redirect("/sign-in");
  return <>{children}</>;
}
