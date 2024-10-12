import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const wallet = params.slug;

  try {
    const user = await prisma.user.findUnique({
      where: { wallet },
      select: { 
        id: true,
        rankScore: true,
        Zupass: {
          select: {
            attestationUID: true,
          }
        }
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const response = {
      id: user.id,
      rankScore: user.rankScore,
      zupass: user.Zupass.length > 0 ? user.Zupass[0] : null
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}