import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const activityTypeId = searchParams.get('activityTypeId');

    try {
        const whereClause = activityTypeId ? { activityTypeId } : {};

        const events = await prisma.event.findMany({
            where: whereClause,
            include: {
                host: { select: { id: true, username: true, avatarUrl: true } },
                participants: { include: { user: { select: { id: true, username: true, avatarUrl: true } } } },
                activityType: { select: { name: true, imageUrl: true } }
            },
            orderBy: { startTime: 'asc' },
        });
        return NextResponse.json(events);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { activityTypeId, startTime, endTime, location, latitude, longitude, maxParticipants, description, attachments, bannerUrl } = await request.json();

        // Validate end time is after start time
        if (new Date(endTime) <= new Date(startTime)) {
            return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
        }

        const event = await prisma.event.create({
            data: {
                hostId: session.user.id,
                activityTypeId,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                location,
                latitude: latitude != null ? (typeof latitude === 'number' ? latitude : parseFloat(latitude)) : null,
                longitude: longitude != null ? (typeof longitude === 'number' ? longitude : parseFloat(longitude)) : null,
                maxParticipants: parseInt(maxParticipants),
                description: description || '',
                bannerUrl: bannerUrl || null,
                attachments: attachments ? JSON.stringify(attachments) : null,
                participants: {
                    create: { userId: session.user.id } // Host is automatically a participant
                }
            },
        });

        return NextResponse.json(event);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }
}
