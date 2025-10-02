// app/(auth)/login/page.tsx
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Entrar | Pilates",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen grid place-items-center px-4 py-10">
      <LoginForm />
    </main>
  );
}
