import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
    const session = await getSession();
    if (!session?.user?.id || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            include: {
                hostedEvents: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const events = await prisma.event.findMany({
            include: {
                host: true,
                activityType: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 50, // Limit to recent 50 events
        });

        return NextResponse.json({ users, events });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
