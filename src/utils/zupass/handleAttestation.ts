import generateAttestation from './generateAttestation';
import { signTypedData } from '../signTypedData';
import fetchNonce from '../fetchNonce';
import { showLoadingAlert, showErrorAlert, showOnlySucessWithRedirect } from '../alertUtils';
import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { ethers } from 'ethers';

export const handleVouch = async (
    user: any,
    wallets: any,
    getAccessToken: any,
    payload: any
) => {
    if (!user?.wallet?.address) {
        showErrorAlert('User wallet address is not defined.');
        return;
    }

    let nonce = await fetchNonce(user.wallet.address);

    if (nonce === undefined) {
        showErrorAlert('Failed to fetch nonce.');
        return;
    }
    showLoadingAlert();

    try {
        const token = getAccessToken;
        if (!token) {
            showErrorAlert('Something went wrong. Try reloading the page.');
            return;
        }

        const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID ?? '84532', 10);
        const schemaUID = process.env.SCHEMA_ID_ZUPASS || "0x9075dee7661b8b445a2f0caa3fc96223b8cc2593c796c414aed93f43d022b0f9";
        const attester = user?.wallet.address;
        
        console.log('payload', payload);

        let connectedCount = 0;
        const tickets = Array.isArray(payload.add_groups) ? payload.add_groups : [payload];
        let totalTickets = tickets.length;
        let results = [];

        for (const ticket of tickets) {
            // set nullifier
            const nullifier = ethers.keccak256(
                ethers.concat([
                    ethers.toUtf8Bytes(payload.external_id),
                    ethers.encodeBytes32String(ticket.ticketType)
                ])
            );

            // Check if semaphoreId already exists using the API route
            try {
                const response = await fetch('/api/zupass/checkSemaphore', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ semaphoreId: nullifier, ticketType: ticket.ticketType }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                if (result.exists) {
                    console.log(`Ticket ${ticket.ticketType} already connected. Skipping.`);
                    connectedCount++;
                    results.push({ ticketType: ticket.ticketType, alreadyConnected: true });
                    continue;  // Skip to the next ticket
                }

                const schemaEncoder = new SchemaEncoder("string nullifier,bytes32 category,bytes32 subcategory,bytes32[] subsubcategory,bytes32 issuer,bytes32 credentialType,bytes32 platform");
                const encodedData = schemaEncoder.encodeData([
                    { name: "nullifier", value: nullifier, type: "string" },
                    { name: "category", value: ethers.encodeBytes32String('Community'), type: "bytes32" },
                    { name: "subcategory", value: ethers.encodeBytes32String(ticket.ticketType), type: "bytes32" },
                    { name: "subsubcategory", value: [ethers.encodeBytes32String('short')], type: "bytes32[]" },
                    { name: "issuer", value: ethers.encodeBytes32String(ticket.group), type: "bytes32" },
                    { name: "credentialType", value: ethers.encodeBytes32String('Ticket'), type: "bytes32" },
                    { name: "platform", value: ethers.encodeBytes32String("Zupass"), type: "bytes32" }
                ]);

                const domain = {
                    name: 'EAS',
                    version: '1.2.0',
                    chainId: chainId,
                    verifyingContract: '0x4200000000000000000000000000000000000021'
                };

                const types = {
                    Attest: [
                        { name: 'schema', type: 'bytes32' },
                        { name: 'recipient', type: 'address' },
                        { name: 'expirationTime', type: 'uint64' },
                        { name: 'revocable', type: 'bool' },
                        { name: 'refUID', type: 'bytes32' },
                        { name: 'data', type: 'bytes' },
                        { name: 'value', type: 'uint256' },
                        { name: 'nonce', type: 'uint256' },
                        { name: 'deadline', type: 'uint64' }
                    ]
                };

                const value = {
                    schema: schemaUID,
                    recipient: attester,
                    expirationTime: 0,
                    revocable: true,
                    refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
                    data: encodedData,
                    deadline: 0,
                    value: 0,
                    nonce: nonce
                };

                const typedData = {
                    types: types,
                    domain: domain,
                    primaryType: 'Attest',
                    message: value,
                };
                console.log('Before signTypedData', user, wallets, chainId, typedData)
                const signature = await signTypedData(user, wallets, chainId, typedData);
                console.log('After signTypedData', signature)
                await generateAttestation(token, attester, signature, nullifier, {
                    ...payload,
                    group: ticket.group,
                    ticketType: ticket.ticketType,
                    email: payload.email

                });
                console.log('After generateAttestation')
                
                // If we reach here, a new ticket was successfully connected
                console.log(`Ticket ${ticket.ticketType} connected successfully.`);

                results.push({ ticketType: ticket.ticketType, alreadyConnected: false });

                // Increment nonce for the next attestation
                nonce++;
            } catch (error) {
                console.error('Error processing ticket:', error);
                results.push({ ticketType: ticket.ticketType, error: true });
            }
        }

        if (connectedCount === totalTickets) {
            showErrorAlert('All Zupass tickets are already connected to an account.');
        } else if (connectedCount > 0) {
            showOnlySucessWithRedirect('Some Zupass tickets were already connected. New tickets added successfully.', 'Go to profile', `/me`);
        } else {
            showOnlySucessWithRedirect('Zupass tickets connected successfully.', 'Go to profile', `/me`);
        }

        return results;

    } catch (error) {
        console.log(error)
        showErrorAlert('An error occurred while attesting to connect your Zupass tickets');
        throw error;
    }
};
