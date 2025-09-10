import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <SignIn
      path="/sign-in"
      routing="path"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
      // 🔹 Per-page text overrides
      localization={{
        signIn: {
          start: {
            // This is the headline (e.g., “Welcome back!”)
            title: "Bem-vindo de volta!",
            // This is the subhead (e.g., “Please sign in to continue”)
            subtitle: "Entre para continuar e acompanhe suas aulas.",
          },
        },
      }}
      // (Optional) style tweaks
      appearance={{
        elements: {
          card: "rounded-2xl shadow-xl",
          headerTitle: "text-indigo-600 dark:text-indigo-400",
          headerSubtitle: "text-gray-600 dark:text-gray-400",
        },
      }}
    />
  );
}
