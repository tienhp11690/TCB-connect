import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: eventId } = await params;

    try {
        // Check if already joined
        const existing = await prisma.eventParticipant.findUnique({
            where: {
                eventId_userId: {
                    eventId,
                    userId: session.user.id,
                },
            },
        });

        if (existing) {
            return NextResponse.json({ error: 'Already joined' }, { status: 400 });
        }

        await prisma.eventParticipant.create({
            data: {
                eventId,
                userId: session.user.id,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to join event' }, { status: 500 });
    }
}
