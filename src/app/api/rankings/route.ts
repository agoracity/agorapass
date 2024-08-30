import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const page = searchParams.get('page') ?? '1';
    const limit = searchParams.get('limit') ?? '12';
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc';
    const searchQuery = searchParams.get('searchQuery') || '';

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    try {
        const rankings = await prisma.ranking.findMany({
            skip,
            take: pageSize,
            orderBy: {
                id: sortOrder,
            },
        });



        const totalUsers = await prisma.ranking.count({
            where: {
                address: {
                    contains: searchQuery,
                    mode: 'insensitive',
                },
            },
        });

        const hasMore = skip + pageSize < totalUsers;
        const nextPage = hasMore ? pageNumber + 1 : undefined;
        
        return NextResponse.json({
            rankings,
            total: totalUsers,
            hasMore,
            nextPage,
        });
    } catch (error) {
        console.error('Error fetching rankings:', error);
        return NextResponse.json({ error: 'Failed to fetch rankings' }, { status: 500 });
    }
}