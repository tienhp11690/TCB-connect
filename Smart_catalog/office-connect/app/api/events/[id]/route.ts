import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                host: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true,
                        fullName: true,
                        gender: true,
                        birthYear: true,
                        workUnit: true,
                    }
                },
                activityType: true,
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                avatarUrl: true,
                                fullName: true,
                                gender: true,
                                birthYear: true,
                                workUnit: true,
                            }
                        }
                    },
                    orderBy: { joinedAt: 'asc' }
                },
            },
        });

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        return NextResponse.json(event);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
        const { startTime, endTime, location, latitude, longitude, maxParticipants, description, attachments, bannerUrl } = await request.json();

        // Check if user is the host
        const event = await prisma.event.findUnique({
            where: { id },
            select: { hostId: true }
        });

        if (!event || event.hostId !== session.user.id) {
            return NextResponse.json({ error: 'Not authorized to edit this event' }, { status: 403 });
        }

        // Validate end time is after start time
        if (new Date(endTime) <= new Date(startTime)) {
            return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
        }

        const updatedEvent = await prisma.event.update({
            where: { id },
            data: {
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                location,
                latitude: latitude != null ? (typeof latitude === 'number' ? latitude : parseFloat(latitude)) : null,
                longitude: longitude != null ? (typeof longitude === 'number' ? longitude : parseFloat(longitude)) : null,
                maxParticipants: parseInt(maxParticipants),
                description: description || '',
                bannerUrl: bannerUrl || null,
                attachments: attachments ? JSON.stringify(attachments) : null,
            },
        });

        return NextResponse.json(updatedEvent);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
    }
}
