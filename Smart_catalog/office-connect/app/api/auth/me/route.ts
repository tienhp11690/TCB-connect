import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ user: null });
    }

    // Fetch full user data from database
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
            avatarUrl: true,
            fullName: true,
            gender: true,
            birthYear: true,
            maritalStatus: true,
            workUnit: true,
            homeAddress: true,
            officeAddress: true,
            homeCoordinates: true,
            officeCoordinates: true,
        }
    });

    return NextResponse.json({ user });
}
