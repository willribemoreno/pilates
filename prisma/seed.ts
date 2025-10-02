// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth"; // keep your tsconfig path alias

const prisma = new PrismaClient();

async function seedRoles() {
  const roles = [
    { id: "11111111-1111-1111-1111-111111111111", name: "PACIENTE",  description: "Acesso de paciente (Default)" },
    { id: "22222222-2222-2222-2222-222222222222", name: "PROFESSOR", description: "Acesso de professor" },
    { id: "33333333-3333-3333-3333-333333333333", name: "ADMIN",     description: "Acesso de administrador" },
  ];

  for (const r of roles) {
    await prisma.role.upsert({
      where: { id: r.id },
      update: { name: r.name, description: r.description },
      create: r,
    });
  }
}

const userData = [
  {
    email: "william.ribeiro.moreno@gmail.com",
    name: "William Moreno",
    password: "admin123",
    // optional post-create adjustments:
    // roleId: "33333333-3333-3333-3333-333333333333", // ADMIN
    // verify: true,
  },
];

export async function main() {
  // 1) Ensure roles exist (and match the default you put in schema)
  await seedRoles();

  // 2) Create users through Better Auth to get proper password hashing + account rows
  for (const u of userData) {
    // If the user already exists, Better Auth will return an error — you can ignore duplicates if needed
    await auth.api.signUpEmail({
      body: {
        email: u.email,
        name: u.name,
        password: u.password,
      },
    });

    // 3) Optional: mark email as verified or change role using Prisma
    await prisma.user.update({
      where: { email: u.email },
      data: {
        // emailVerified: u.verify ?? false,
        // roleId: u.roleId ?? undefined,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("✅ Seed completed");
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
