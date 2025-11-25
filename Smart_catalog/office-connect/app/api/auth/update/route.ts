import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getSession, login } from '@/lib/auth';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const {
            avatarUrl, password, newPassword, email,
            fullName, gender, birthYear, maritalStatus, workUnit,
            homeAddress, officeAddress, homeCoordinates, officeCoordinates
        } = await request.json();
        const userId = session.user.id;

        const updateData: any = {};

        if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
        if (email !== undefined) updateData.email = email;
        if (fullName !== undefined) updateData.fullName = fullName;
        if (gender !== undefined) updateData.gender = gender;
        if (birthYear !== undefined && birthYear !== 0) updateData.birthYear = parseInt(birthYear.toString());
        if (maritalStatus !== undefined) updateData.maritalStatus = maritalStatus;
        if (workUnit !== undefined) updateData.workUnit = workUnit;
        if (homeAddress !== undefined) updateData.homeAddress = homeAddress;
        if (officeAddress !== undefined) updateData.officeAddress = officeAddress;
        if (homeCoordinates !== undefined) updateData.homeCoordinates = homeCoordinates;
        if (officeCoordinates !== undefined) updateData.officeCoordinates = officeCoordinates;

        if (newPassword) {
            // Verify current password if changing it
            if (!password) {
                return NextResponse.json({ error: 'Current password required' }, { status: 400 });
            }

            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
            }

            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        // Refresh session with new data
        await login({
            id: updatedUser.id,
            username: updatedUser.username,
            avatarUrl: updatedUser.avatarUrl
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error('Update error:', error);
        return NextResponse.json(
            { error: `Failed to update profile: ${(error as Error).message}` },
            { status: 500 }
        );
    }
}
