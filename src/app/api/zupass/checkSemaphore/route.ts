import { NextRequest, NextResponse } from 'next/server';
import { fetchAttestationsMadePretrust } from '@/lib/fetchers/attestations';

function stringToBytes32(str: string): string {
    // Pad the string to 32 bytes
    const paddedStr = str.padEnd(32, '\0');
    // Convert to hex
    return '0x' + Buffer.from(paddedStr).toString('hex');
}

export async function POST(request: NextRequest) {
    const { semaphoreId, ticketType } = await request.json();

    try {
        const attestations = await fetchAttestationsMadePretrust(
            process.env.SCHEMA_ID_ZUPASS as string,
            semaphoreId
        );
        const existingAttestation = attestations.find((attestation: { decodedDataJson: string }) => {
            try {
                const decodedData = JSON.parse(attestation.decodedDataJson);
                const subcategoryField = decodedData.find((field: any) => field.name === "subcategory");
                if (subcategoryField && subcategoryField.value && subcategoryField.value.value) {
                    const subcategoryValue = subcategoryField.value.value;
                    const requestTicketTypeBytes32 = stringToBytes32(ticketType);
                    return subcategoryValue === requestTicketTypeBytes32;
                }
            } catch (error) {
                console.error('Error parsing attestation:', error);
            }
            return false;
        });

        console.log('existingAttestation', existingAttestation);
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