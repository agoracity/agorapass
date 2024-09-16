import { NextRequest, NextResponse } from 'next/server';
import { POD, podEntriesFromSimplifiedJSON } from "@pcd/pod";
import { PODPCD, PODPCDPackage } from "@pcd/pod-pcd";
import { v5 as uuidv5 } from 'uuid';

const ZUPASS_SIGNING_KEY = process.env.ZUPASS_SIGNING_KEY;
const FROG_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

export async function POST(request: NextRequest) {
  if (!ZUPASS_SIGNING_KEY) {
    return NextResponse.json({ message: 'Server configuration error: Signing key not set' }, { status: 500 });
  }

  const { timestamp, owner } = await request.json();

  try {
    const pod = await POD.sign(
      podEntriesFromSimplifiedJSON(JSON.stringify({
        zupass_display: "collectable",
        zupass_title: `AGORA`,
        timestamp,
        issuer: "AgoraPass",
        owner
      })),
      ZUPASS_SIGNING_KEY
    );

    // Create PODPCD
    const podpcd = new PODPCD(
      uuidv5(`${pod.contentID}`, FROG_NAMESPACE),
      pod
    );

    // Serialize PODPCD
    const serializedPODPCD = await PODPCDPackage.serialize(podpcd);

    // Convert BigInt values to strings before sending response
    const serializedData = JSON.parse(JSON.stringify(
      { podpcd: serializedPODPCD },
      (_, value) => typeof value === 'bigint' ? value.toString() : value
    ));

    return NextResponse.json(serializedData);
  } catch (error) {
    console.error('Error creating PODPCD:', error);
    return NextResponse.json({ message: 'Error creating PODPCD' }, { status: 500 });
  }
}