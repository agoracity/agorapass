import { NextRequest, NextResponse } from 'next/server';
import { fetchAttestationsMadePretrust } from '@/lib/fetchers/attestations';

export async function POST(request: NextRequest) {
    const { semaphoreId, ticketType } = await request.json();

    try {
        const attestations = await fetchAttestationsMadePretrust(
            process.env.SCHEMA_ID_ZUPASS as string,
            semaphoreId
        );

        const existingAttestation = attestations.find(
            (attestation: { decodedDataJson: string; }) => JSON.parse(attestation.decodedDataJson).ticketType === ticketType
        );

        if (existingAttestation) {
            return NextResponse.json({ exists: true });
        } else {
            return NextResponse.json({ exists: false });
        }
    } catch (error) {
        console.error('Error checking attestations:', error);
        return NextResponse.json({ error: 'Failed to check attestations' }, { status: 500 });
    }
}