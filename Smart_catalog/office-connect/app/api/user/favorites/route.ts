import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ favorites: [] });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { favorites: true },
        });
        return NextResponse.json({ favorites: user?.favorites || [] });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { activityId } = await request.json();
    if (!activityId) {
        return NextResponse.json({ error: 'Activity ID required' }, { status: 400 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { favorites: true },
        });

        const isFavorite = user?.favorites.some(f => f.id === activityId);

        if (isFavorite) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    favorites: {
                        disconnect: { id: activityId },
                    },
                },
            });
        } else {
            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    favorites: {
                        connect: { id: activityId },
                    },
                },
            });
        }

        return NextResponse.json({ success: true, isFavorite: !isFavorite });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to toggle favorite' }, { status: 500 });
    }
}
