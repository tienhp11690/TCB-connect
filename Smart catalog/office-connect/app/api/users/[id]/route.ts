import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        // Fetch user data
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                avatarUrl: true,
                fullName: true,
                gender: true,
                birthYear: true,
                workUnit: true,
                maritalStatus: true,
                homeAddress: true,
                officeAddress: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch privacy settings
        const privacy = await prisma.privacySettings.findFirst();

        // Filter user data based on privacy settings
        const filteredUser = {
            id: user.id,
            username: user.username,
            avatarUrl: user.avatarUrl,
            fullName: privacy?.showFullName ? user.fullName : undefined,
            gender: privacy?.showGender ? user.gender : undefined,
            birthYear: privacy?.showAge ? user.birthYear : undefined,
            workUnit: privacy?.showWorkUnit ? user.workUnit : undefined,
            maritalStatus: privacy?.showMaritalStatus ? user.maritalStatus : undefined,
            homeAddress: privacy?.showHomeAddress ? user.homeAddress : undefined,
            officeAddress: privacy?.showOfficeAddress ? user.officeAddress : undefined,
        };

        return NextResponse.json(filteredUser);
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}
