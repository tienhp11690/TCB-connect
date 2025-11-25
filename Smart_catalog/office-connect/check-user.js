const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
    try {
        const user = await prisma.user.findFirst({
            where: { username: 'tienhp90' }
        });

        if (!user) {
            console.log('User not found');
            return;
        }

        console.log('=== USER DATA ===');
        console.log('Username:', user.username);
        console.log('Email:', user.email);
        console.log('Full Name:', user.fullName);
        console.log('Gender:', user.gender);
        console.log('Birth Year:', user.birthYear);
        console.log('Marital Status:', user.maritalStatus);
        console.log('Work Unit:', user.workUnit);
        console.log('Home Address:', user.homeAddress);
        console.log('Office Address:', user.officeAddress);
        console.log('Home Coordinates:', user.homeCoordinates);
        console.log('Office Coordinates:', user.officeCoordinates);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();
