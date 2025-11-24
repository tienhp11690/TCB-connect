const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSchema() {
    try {
        // Try to get user tienhp90
        const user = await prisma.user.findFirst({
            where: { username: 'tienhp90' }
        });

        console.log('User found:', JSON.stringify(user, null, 2));

        // Check what fields exist
        console.log('\nUser fields:', Object.keys(user || {}));

    } catch (error) {
        console.error('Error:', error.message);
        console.error('Full error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkSchema();
