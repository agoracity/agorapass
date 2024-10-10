import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import privy from '@/lib/privy';

export async function POST(request: NextRequest) {
    try {
        // Verify Privy token
        const authorization = request.headers.get('authorization');
        if (!authorization || typeof authorization !== 'string') {
            return NextResponse.json({ error: 'Authorization header missing or invalid' }, { status: 401 });
        }

        let verifiedClaims;
        try {
            verifiedClaims = await privy.verifyAuthToken(authorization);
        } catch (error) {
            return NextResponse.json({ error: 'Token verification failed' }, { status: 401 });
        }

        // Fetch user data from the database
        const user = await prisma.user.findUnique({
            where: { id: verifiedClaims.userId },
            select: { wallet: true, rankScore: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Prepare the request to the stamp endpointauthorization
        const stampResponse = await fetch(process.env.NEXT_PUBLIC_STAMP_API_URL + '/pod/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authorization,
                'x-privy-app-id': 'agora',
            },
            body: JSON.stringify({
                wallet: user.wallet,
                AgoraScore: user.rankScore.toString()
            }),
        });

        if (!stampResponse.ok) {
            throw new Error('Failed to create POD');
        }

        const pod = await stampResponse.json();
        return NextResponse.json(pod);
    } catch (error) {
        console.error('Error creating POD:', error);
        return NextResponse.json({ error: 'Failed to create POD' }, { status: 500 });
    }
}