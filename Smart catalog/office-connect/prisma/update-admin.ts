import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Updating admin user role...');

    const admin = await prisma.user.update({
        where: { username: 'admin' },
        data: { role: 'admin' }
    });

    console.log('✅ User "admin" role updated to admin');
    console.log('   Please logout and login again to see Admin menu');
}

main()
    .catch((e) => {
        console.error('Error:', e.message);
        console.log('\n💡 If user "admin" does not exist, please register first then run this script again');
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
