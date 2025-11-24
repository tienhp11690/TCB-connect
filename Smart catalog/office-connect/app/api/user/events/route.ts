import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const participations = await prisma.eventParticipant.findMany({
            where: { userId: session.user.id },
            include: {
                event: {
                    include: {
                        host: {
                            select: {
                                id: true,
                                username: true,
                                avatarUrl: true,
                            }
                        },
                        activityType: {
                            select: {
                                id: true,
                                name: true,
                            }
                        },
                        participants: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        username: true,
                                        avatarUrl: true,
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                event: {
                    startTime: 'asc'
                }
            }
        });

        const events = participations.map(p => p.event);
        return NextResponse.json(events);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
}
