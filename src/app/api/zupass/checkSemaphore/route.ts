import { NextRequest, NextResponse } from 'next/server';
import { fetchAttestationsMadePretrust } from '@/lib/fetchers/attestations';
import prisma from '@/lib/db';
import { ethers } from 'ethers';

function stringToBytes32(str: string): string {
    // Pad the string to 32 bytes
    const paddedStr = str.padEnd(32, '\0');
    // Convert to hex
    return '0x' + Buffer.from(paddedStr).toString('hex');
}

export async function POST(request: NextRequest) {
    const { semaphoreId, ticketType, walletAddress, email } = await request.json();

    try {
        const attestations = await fetchAttestationsMadePretrust(
            process.env.SCHEMA_ID_ZUPASS as string,
            semaphoreId
        );

        const matchingAttestations = attestations.filter((attestation: { decodedDataJson: string; recipient: string }) => {
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

        console.log('matchingAttestations', matchingAttestations);
        if (matchingAttestations.length > 0) {
            const isSameWallet = matchingAttestations.some((attestation: { recipient: string }) =>
                attestation.recipient.toLowerCase() === walletAddress.toLowerCase()
            );

            if (isSameWallet) {
                const matchingAttestation = matchingAttestations.find((attestation: { recipient: string }) =>
                    attestation.recipient.toLowerCase() === walletAddress.toLowerCase()
                );
                console.log('matchingAttestation', matchingAttestation);
                if (matchingAttestation) {
                    const existingZupass = await prisma.zupass.findUnique({
                        where: { attestationUID: matchingAttestation.id }
                    });
                    const decodedData = JSON.parse(matchingAttestation.decodedDataJson);
                    const nullifierField = decodedData.find((field: any) => field.name === "nullifier");
                    const nullifier = nullifierField.value.value
                    const issuerField = decodedData.find((field: any) => field.name === "issuer");
                    const issuer = issuerField.value.value
                    const group = ethers.decodeBytes32String(issuer);
                    if (!existingZupass) {
                        const user = await prisma.user.findUnique({ where: { wallet: walletAddress } });
                        if (user) {
                            await prisma.zupass.create({
                                data: {
                                    userId: user.id,
                                    email: email,
                                    nullifier: nullifier,
                                    group: group,
                                    ticketType: ticketType,
                                    semaphoreId: semaphoreId,
                                    issuer: issuer,
                                    attestationUID: matchingAttestation.id
                                }
                            });
                        }
                    }
                }
            }

            return NextResponse.json({ exists: true, isSameWallet, count: matchingAttestations.length });
        } else {
            return NextResponse.json({ exists: false, isSameWallet: false, count: 0 });
        }
    } catch (error) {
        console.error('Error checking attestations:', error);
        return NextResponse.json({ error: 'Failed to check attestations' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}