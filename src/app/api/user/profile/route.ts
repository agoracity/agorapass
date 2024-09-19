import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import privy from '@/lib/privy';

export const dynamic = 'force-dynamic'; // Force Next.js to treat this route as dynamic
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
                avatarType: true,
                wallet: true,
                rankScore: true,
                podUrl: true,
                Zupass: {
                    select: {
                        semaphoreId: true,
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
