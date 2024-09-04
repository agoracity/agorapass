import { NextRequest, NextResponse } from 'next/server';
import privy from '@/lib/privy';
import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { ethers } from 'ethers';
import prisma from '@/lib/db';
import { toBigInt } from 'ethers';
import { Utils } from 'alchemy-sdk';
import { updateEigenScore } from '@/utils/updateEigenScore';
const easContractAddress = "0x4200000000000000000000000000000000000021";
const schemaUID = process.env.SCHEMA_ID || "0x5ee00c7a6606190e090ea17749ec77fe23338387c23c0643c4251380f37eebc3";

const eas = new EAS(easContractAddress);
// Signer must be an ethers-like signer.
const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const ALCHEMY_URL = process.env.ALCHEMY_URL!;

const provider = new ethers.JsonRpcProvider(ALCHEMY_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
await eas.connect(signer);

export async function POST(request: NextRequest) {
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
            // console.log('verifiedClaims', verifiedClaims);
        } catch (error) {
            console.error('Token verification failed:', error);
            return NextResponse.json({ error: 'Token verification failed' }, { status: 401 });
        }

        // Extract user data from request body
        const { platform, endorsementType, power, wallet, attester, signature } = await request.json();

        const id = verifiedClaims.userId;
        const recipient = wallet;
        const user = await prisma.user.findUnique({
            where: { id: id },
            select: {
                vouchesAvailables: true,
                wallet: true
            }
        });

        if (!user || user.vouchesAvailables <= 0) {
            return new Response('You have no vouches available.', {
                status: 550,
            });
        }

        const walletAddress = user.wallet;

        // Check if the recipient is the same as the attester
        if (recipient === attester) {
            return NextResponse.json({ error: "You can't vouch yourself." }, { status: 400 });
        }
        // Encode the data using SchemaEncoder
        const schemaEncoder = new SchemaEncoder("uint8 power,string endorsementType,string platform");

        //! TO DO maybe remove some hardcoded values?
        const encodedData = schemaEncoder.encodeData([
            { name: "power", value: "1", type: "uint8" },
            { name: "endorsementType", value: "Social", type: "string" },
            { name: "platform", value: "Agora Pass", type: "string" }
        ]);


        let flatSig = signature
        // console.log('Signature', flatSig)
        let expandedSig = Utils.splitSignature(flatSig);
        // console.log('expandedSig', expandedSig)


        // Create the delegated attestation
        const transaction = await eas.attestByDelegation({
            schema: schemaUID,
            data: {
                recipient: recipient,
                expirationTime: toBigInt(0), // Unix timestamp of when attestation expires (0 for no expiration)
                revocable: true,
                refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
                data: encodedData
            },
            signature: expandedSig,
            attester: attester,
            deadline: toBigInt(0) // Unix timestamp of when signature expires (0 for no expiration)
        });

        const newAttestationUID = await transaction.wait();

        // Update user's vouchesAvailables
        await prisma.user.update({
            where: { id: id },
            data: { vouchesAvailables: { decrement: 1 } },
        });

        // console.log('New attestation UID:', newAttestationUID);
        // console.log('Transaction receipt:', transaction.receipt);
        try {
            const result = await updateEigenScore();
            console.log('Data updated successfully:', result);
            // Handle result if needed
        } catch (error) {
            console.error('Error updating eigenScore:', error);
        }
        // Return success response with the newly created attestation UID
        return NextResponse.json({ newAttestationUID });
    } catch (error) {
        console.error('Error creating attestation:', error);
        // Return error response if something goes wrong
        return NextResponse.json({ error: 'Failed to create attestation' }, { status: 500 });
    }
}
