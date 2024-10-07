import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import privy from '@/lib/privy';


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


        const { name, bio } = await request.json();

        let updateData: any = {};
        if (name !== undefined) {
            if (typeof name !== 'string' || (name.trim().length > 0 && name.trim().length < 2)) {
                return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
            }
            updateData.name = name.trim();
        }
        if (bio !== undefined) updateData.bio = bio;

        const updatedUser = await prisma.user.update({
            where: {
                id: verifiedClaims.userId,
            },
            data: updateData,
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

