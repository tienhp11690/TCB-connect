import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const session = await getSession();
    const currentUserId = session?.user?.id;

    try {
        // 1. Get recent locations from the current user
        let userLocations: string[] = [];
        if (currentUserId) {
            const userEvents = await prisma.event.findMany({
                where: {
                    hostId: currentUserId,
                    location: {
                        contains: query,
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                select: {
                    location: true,
                },
                take: 10,
            });
            userLocations = userEvents.map(e => e.location);
        }

        // 2. Get locations from other users matching the query
        const otherEvents = await prisma.event.findMany({
            where: {
                hostId: {
                    not: currentUserId || undefined, // undefined if no user logged in, though likely protected
                },
                location: {
                    contains: query,
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                location: true,
            },
            take: 10,
        });
        const otherLocations = otherEvents.map(e => e.location);

        // 3. Combine and deduplicate, prioritizing user's own locations
        const allLocations = [...userLocations, ...otherLocations];
        const uniqueLocations = Array.from(new Set(allLocations));

        // Limit to reasonable number, e.g., 10
        const suggestions = uniqueLocations.slice(0, 10);

        return NextResponse.json({ suggestions });
    } catch (error) {
        console.error('Error fetching location suggestions:', error);
        return NextResponse.json({ suggestions: [] }, { status: 500 });
    }
}
