// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    // Use stable IDs so the default on User.roleId is always valid
    const roles = [
        { id: '11111111-1111-1111-1111-111111111111', name: 'PACIENTE', description: 'Acesso de paciente(Default)' },
        { id: '22222222-2222-2222-2222-222222222222', name: 'PROFESSOR', description: 'Acesso de professor' },
        { id: '33333333-3333-3333-3333-333333333333', name: 'ADMIN', description: 'Acesso de administrador' },
    ];

    for (const r of roles) {
        await prisma.role.upsert({
            where: { id: r.id },
            update: { name: r.name, description: r.description },
            create: r,
        });
    }
}

main().finally(() => prisma.$disconnect());
