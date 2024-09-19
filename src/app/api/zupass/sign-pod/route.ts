import { NextRequest, NextResponse } from 'next/server';
import { POD, podEntriesFromSimplifiedJSON } from "@pcd/pod";
import { PODPCD, PODPCDPackage } from "@pcd/pod-pcd";
import { v5 as uuidv5 } from 'uuid';
import { constructZupassPcdAddRequestUrl } from '@pcd/passport-interface';
import { Zupass } from '@/config/siteConfig';
import prisma from '@/lib/db';

const ZUPASS_SIGNING_KEY = process.env.ZUPASS_SIGNING_KEY;
const FROG_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

export async function POST(request: NextRequest) {
  if (!ZUPASS_SIGNING_KEY) {
    return NextResponse.json({ message: 'Server configuration error: Signing key not set' }, { status: 500 });
  }

  const { timestamp, owner, wallet } = await request.json();

  try {
    // Check if user already has a POD URL
    const existingUser = await prisma.user.findUnique({
      where: { wallet },
      select: { podUrl: true },
    });

    if (existingUser && existingUser.podUrl) {
      return NextResponse.json(existingUser.podUrl);
    }

    // If no existing POD URL, generate a new one
    const pod = POD.sign(
      podEntriesFromSimplifiedJSON(JSON.stringify({
        zupass_display: Zupass.zupass_display,
        zupass_title: Zupass.zupass_title,
        zupass_image_url: Zupass.zupass_image_url,
        timestamp,
        issuer: "AgoraPass",
        owner,
        wallet
      })),
      ZUPASS_SIGNING_KEY
    );

    // Create PODPCD
    const podpcd = new PODPCD(
      uuidv5(`${pod.contentID}`, FROG_NAMESPACE),
      pod
    );

    const serializedPODPCD = await PODPCDPackage.serialize(podpcd);

    const url = constructZupassPcdAddRequestUrl(
      Zupass.url,
      process.env.NEXT_PUBLIC_BASE_URL + "#/popup",
      serializedPODPCD,
      Zupass.folder,
      true,
    );

    // Update user in the database
    await prisma.user.update({
      where: { wallet },
      data: {
        podUrl: url,
      },
    });

    return NextResponse.json(url);
  } catch (error) {
    console.error('Error creating or retrieving PODPCD:', error);
    return NextResponse.json({ message: 'Error creating or retrieving PODPCD' }, { status: 500 });
  }
}