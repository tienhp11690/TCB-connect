import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const activities = await prisma.activityType.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(activities);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { name, description, imageUrl } = await request.json();

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const activity = await prisma.activityType.create({
            data: { name, description, imageUrl },
        });

        return NextResponse.json(activity);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
    }
}
