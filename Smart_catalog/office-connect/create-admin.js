const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const username = 'admin';
    const password = 'admin';
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findUnique({
        where: { username },
    });

    if (existingUser) {
        console.log(`User ${username} exists. Updating role to admin...`);
        await prisma.user.update({
            where: { username },
            data: { role: 'admin' },
        });
        console.log(`User ${username} role updated to admin.`);
    } else {
        console.log(`Creating user ${username}...`);
        await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role: 'admin',
                avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            },
        });
        console.log(`User ${username} created with password ${password} and role admin.`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
