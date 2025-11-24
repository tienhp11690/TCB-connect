import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const comments = await prisma.comment.findMany({
            where: { eventId: id },
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
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(comments);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
        const { content } = await request.json();

        const comment = await prisma.comment.create({
            data: {
                eventId: id,
                userId: session.user.id,
                content,
            },
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
            }
        });

        return NextResponse.json(comment);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }
}
