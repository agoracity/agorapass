import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const ticket = await request.json();
    
    const result = await prisma.zupass.upsert({
      where: { attestationUID: ticket.attestationUID },
      update: {
        userId: ticket.userId,
        nullifier: ticket.nullifier,
        ticketType: ticket.ticketType,
        issuer: ticket.issuer,
        category: ticket.category,
        subcategory: ticket.subcategory,
        platform: ticket.platform
      },
      create: {
        userId: ticket.userId,
        nullifier: ticket.nullifier,
        attestationUID: ticket.attestationUID,
        ticketType: ticket.ticketType,
        issuer: ticket.issuer,
        category: ticket.category,
        subcategory: ticket.subcategory,
        platform: ticket.platform
      }
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error saving/updating Zupass ticket:", error);
    return NextResponse.json({ success: false, error: 'Failed to save Zupass ticket' }, { status: 500 });
  }
}