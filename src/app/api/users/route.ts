import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { DateTime } from 'luxon';
import { Prisma } from '@prisma/client'

export async function POST(request: NextRequest) {
    try {

        const { name, email, bio, wallet, id } = await request.json();
        // console.log('Received data:', { name, email, bio, wallet });

        // const id = verifiedClaims.userId
        const userEmail = email?.address || ''
        const walletAddress = wallet.address
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { id: id },
        });

        if (existingUser) {
            return NextResponse.json({ error: 'User with this Id already exists' }, { status: 400 });
        }

        // Create a new user using Prisma
        const newUser = await prisma.user.create({
            data: {
                name,
                email: userEmail,
                bio,
                wallet: walletAddress,
                id,
                vouchReset: DateTime.now().plus({ days: 30 }).toISO(), // Calculate 30 days from now
                vouchesAvailables: 3
            },
        });

        // Return success response with the newly created user
        return NextResponse.json({ newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        // Return error response if something goes wrong
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}

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
        const whereClause: Prisma.UserWhereInput = searchQuery
            ? {
                name: {
                    contains: searchQuery,
                    mode: 'insensitive' as Prisma.QueryMode,
                },
            }
            : {};

        const users = await prisma.user.findMany({
            skip,
            take: pageSize,
            orderBy: {
                rankScore: sortOrder,
            },
            where: whereClause,
            select: {
                email: true,
                wallet: true,
                rankScore: true,
                name: true,
                bio: true,
                avatarType: true,
                twitter: true,
                farcaster: true,
            },
        });

        const totalUsers = await prisma.user.count({
            where: whereClause,
        });

        const hasMore = skip + pageSize < totalUsers;
        const nextPage = hasMore ? pageNumber + 1 : undefined;

        return NextResponse.json({
            users,
            total: totalUsers,
            hasMore,
            nextPage,
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}