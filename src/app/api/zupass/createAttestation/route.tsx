import { NextRequest, NextResponse } from 'next/server';
import privy from '@/lib/privy';
import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { ethers } from 'ethers';
import prisma from '@/lib/db';
import { toBigInt } from 'ethers';
import { Utils } from 'alchemy-sdk';

const easContractAddress = "0x4200000000000000000000000000000000000021";
const schemaUID = process.env.SCHEMA_ID_ZUPASS || "0x9075dee7661b8b445a2f0caa3fc96223b8cc2593c796c414aed93f43d022b0f9";

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
        const { attester, signature, nullifier, payload } = await request.json();

        const id = verifiedClaims.userId;
        const recipient = attester;

        const walletAddress = attester;
        const groups = payload.add_groups

        const schemaEncoder = new SchemaEncoder("string nullifier,bytes32 category,bytes32 subcategory,bytes32[] subsubcategory,bytes32 issuer,bytes32 credentialType,bytes32 platform");
        const encodedData = schemaEncoder.encodeData([
            { name: "nullifier", value: nullifier, type: "string" },
            { name: "category", value: ethers.encodeBytes32String('Community'), type: "bytes32" },
            { name: "subcategory", value: ethers.encodeBytes32String('Pop-up cities'), type: "bytes32" },
            { name: "subsubcategory", value: [ethers.encodeBytes32String('short')], type: "bytes32[]" },
            { name: "issuer", value: ethers.encodeBytes32String(groups), type: "bytes32" },
            { name: "credentialType", value: ethers.encodeBytes32String('Ticket'), type: "bytes32" },
            { name: "platform", value: "Zupass", type: "bytes32" }
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


        // console.log('New attestation UID:', newAttestationUID);
        // console.log('Transaction receipt:', transaction.receipt);


        const user = await prisma.user.findUnique({
            where: { id: id }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }


        // Write to the Zupass table
        const newZupass = await prisma.zupass.upsert({
            where: { userId: user.id },
            update: {
                email: payload.email,
                nullifier: nullifier,
                group: payload.group,
                ticketType: payload.ticketType,
                semaphoreId: payload.external_id,
                issuer: 'Zupass',
                attestationUID: newAttestationUID
            },
            create: {
                userId: user.id,
                email: payload.email,
                nullifier: nullifier,
                group: payload.group,
                ticketType: payload.ticketType,
                semaphoreId: payload.external_id,
                issuer: 'Zupass',
                attestationUID: newAttestationUID
            }
        });
        // console.log('newZupass', newZupass);

        //here i want to write to zupass table
        // Return success response with the newly created attestation UID
        return NextResponse.json({ newAttestationUID });
    } catch (error) {
        console.error('Error creating attestation:', error);
        // Return error response if something goes wrong
        return NextResponse.json({ error: 'Failed to create attestation' }, { status: 500 });
    }
}
