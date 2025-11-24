import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET - Fetch current privacy settings
export async function GET() {
    try {
        // Get the first (and only) privacy settings record
        let settings = await prisma.privacySettings.findFirst();

        // If no settings exist, create default ones
        if (!settings) {
            settings = await prisma.privacySettings.create({
                data: {
                    showFullName: true,
                    showGender: true,
                    showAge: true,
                    showWorkUnit: true,
                    showMaritalStatus: false,
                    showHomeAddress: false,
                    showOfficeAddress: false,
                }
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching privacy settings:', error);
        return NextResponse.json({ error: 'Failed to fetch privacy settings' }, { status: 500 });
    }
}

// PATCH - Update privacy settings (admin only)
export async function PATCH(request: Request) {
    const session = await getSession();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
    });

    if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const {
            showFullName,
            showGender,
            showAge,
            showWorkUnit,
            showMaritalStatus,
            showHomeAddress,
            showOfficeAddress
        } = body;

        // Get existing settings or create if none exist
        let settings = await prisma.privacySettings.findFirst();

        if (!settings) {
            // Create new settings
            settings = await prisma.privacySettings.create({
                data: {
                    showFullName: showFullName ?? true,
                    showGender: showGender ?? true,
                    showAge: showAge ?? true,
                    showWorkUnit: showWorkUnit ?? true,
                    showMaritalStatus: showMaritalStatus ?? false,
                    showHomeAddress: showHomeAddress ?? false,
                    showOfficeAddress: showOfficeAddress ?? false,
                    updatedBy: session.user.id
                }
            });
        } else {
            // Update existing settings
            settings = await prisma.privacySettings.update({
                where: { id: settings.id },
                data: {
                    showFullName: showFullName ?? settings.showFullName,
                    showGender: showGender ?? settings.showGender,
                    showAge: showAge ?? settings.showAge,
                    showWorkUnit: showWorkUnit ?? settings.showWorkUnit,
                    showMaritalStatus: showMaritalStatus ?? settings.showMaritalStatus,
                    showHomeAddress: showHomeAddress ?? settings.showHomeAddress,
                    showOfficeAddress: showOfficeAddress ?? settings.showOfficeAddress,
                    updatedBy: session.user.id
                }
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error updating privacy settings:', error);
        return NextResponse.json({ error: 'Failed to update privacy settings' }, { status: 500 });
    }
}
