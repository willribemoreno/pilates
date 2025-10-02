// app/(auth)/signup/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SignUpForm from "./SignUpForm";

export default async function SignUpPage() {
  const session = await auth.api.getSession({ asResponse: false });
  if (session?.session && session.user) {
    redirect("/practitioner/agenda");
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Criar conta</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Bem-vindo(a)! Preencha seus dados para começar.
        </p>
      </div>
      <SignUpForm />
    </main>
  );
}
