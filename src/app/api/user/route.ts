import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import privy from '@/lib/privy';

export async function GET(request: NextRequest) {
    try {
        // Verify Privy token
        const authorization = request.headers.get('authorization');

        if (!authorization || typeof authorization !== 'string') {
            console.error('Authorization header is missing or invalid');
            return NextResponse.json({ error: 'Authorization header missing or invalid' }, { status: 401 });
        }
        let verifiedClaims;
        try {
            verifiedClaims = await privy.verifyAuthToken(authorization);
        } catch (error) {
            console.error('Token verification failed:', error);
            return NextResponse.json({ error: 'Token verification failed' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: {
                id: verifiedClaims.userId,
            },
            select: {
                email: true,
                vouchesAvailables: true,
                createdAt:true,
                vouchReset:true,
                name:true,
                bio:true,
                avatarType: true,
                wallet: true,
                Zupass: {
                    select: {
                        group: true,
                    },
                },
            },
        });
        

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        // Verify Privy token
        const authorization = request.headers.get('authorization');

        if (!authorization || typeof authorization !== 'string') {
            console.error('Authorization header is missing or invalid');
            return NextResponse.json({ error: 'Authorization header missing or invalid' }, { status: 401 });
        }

        let verifiedClaims;
        try {
            verifiedClaims = await privy.verifyAuthToken(authorization);
        } catch (error) {
            console.error('Token verification failed:', error);
            return NextResponse.json({ error: 'Token verification failed' }, { status: 401 });
        }


        const { name, bio, avatarType } = await request.json();

        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
        }
        const updatedUser = await prisma.user.update({
            where: {
                id: verifiedClaims.userId,
            },
            data: {
                name: name.trim(),
                bio,
                avatarType
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

