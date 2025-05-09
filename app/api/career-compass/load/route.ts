import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/prisma/prisma';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = session.user.id;        // First check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            console.error(`User with ID ${userId} not found in database when loading report`);
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const report = await prisma.careerCompassReport.findUnique({
            where: { userId },
        });

        if (report) {
            return NextResponse.json({ report });
        } else {
            return NextResponse.json({ report: null }, { status: 200 }); // Return 200 with null for no report yet
        }
    } catch (error) {
        console.error('Error loading career compass report:', error);
        return NextResponse.json({ error: 'Failed to load report' }, { status: 500 });
    }
}
