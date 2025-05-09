import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";
import { prisma } from "@/prisma/prisma";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const body = await request.json();
        const { structuredData, markdownReport } = body;

        if (!structuredData || !markdownReport) {
            return NextResponse.json({ error: "Missing structuredData or markdownReport" }, { status: 400 });
        }

        // Verify user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            console.error(`User with ID ${userId} not found when trying to save report.`);
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        await prisma.careerCompassReport.upsert({
            where: { userId },
            update: {
                structuredData,
                markdownReport,
                updatedAt: new Date(),
            },
            create: {
                userId,
                structuredData,
                markdownReport,
            },
        });

        return NextResponse.json({ message: "Report saved successfully" }, { status: 200 });

    } catch (error) {
        console.error('Error saving career compass report:', error);
        const errorMessage = error instanceof Error ? error.message : "Failed to save report";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
