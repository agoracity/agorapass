import { NextRequest, NextResponse } from 'next/server';
import { supportedEvents, whitelistedTickets, matchTicketToType } from '@/components/zupass/zupass-config';
import { isEqualEdDSAPublicKey } from '@pcd/eddsa-pcd';
import {
    ZKEdDSAEventTicketPCD,
    ZKEdDSAEventTicketPCDPackage
} from '@pcd/zk-eddsa-event-ticket-pcd';

// const nullifiers = new Set<string>();    

type TicketType = keyof typeof whitelistedTickets;

export const POST = async (req: NextRequest) => {
    const nullifiers = new Set<string>();

    try {
        const { pcds, nonce } = await req.json();

        if (!Array.isArray(pcds) || pcds.length === 0) {
            return NextResponse.json({ message: "No PCDs specified or invalid input format." }, { status: 400 });
        }

        const validPcds: ZKEdDSAEventTicketPCD[] = [];
        const responses: { error: string; status: number }[] = [];

        if (!nonce) {
            return NextResponse.json({ message: "No nonce provided" }, { status: 401 });
        }

        const bigIntNonce = BigInt("0x" + nonce);

        for (const { type, pcd: inputPCD } of pcds) {
            if (type !== "zk-eddsa-event-ticket-pcd") {
                responses.push({ error: `Invalid PCD type: ${type}`, status: 400 });
                continue;
            }
            console.log("inputPCD", inputPCD);
            const pcd = await ZKEdDSAEventTicketPCDPackage.deserialize(inputPCD);
            console.log("pcd", pcd);
            if (!inputPCD || !pcd) {
                responses.push({
                    error: "Invalid PCD format or deserialization error",
                    status: 400
                });
                continue;
            }
            //here
            //!TODO Save nonce in session, use watermark
            // if (pcd.claim.watermark.toString() !== bigIntNonce.toString()) {
            //     responses.push({ error: "PCD watermark doesn't match", status: 401 });
            //     continue;
            // }

            if (!pcd.claim.nullifierHash) {
                responses.push({
                    error: "PCD ticket nullifier has not been defined",
                    status: 401
                });
                continue;
            }

            if (pcd.claim.partialTicket.eventId) {
                const eventId = pcd.claim.partialTicket.eventId;
                if (!supportedEvents.includes(eventId)) {
                    responses.push({
                        error: `PCD ticket is not for a supported event: ${eventId}`,
                        status: 400
                    });
                    continue;
                }
            } else {
                let eventError = false;
                for (const eventId of pcd.claim.validEventIds ?? []) {
                    if (!supportedEvents.includes(eventId)) {
                        responses.push({
                            error: `PCD ticket is not restricted to supported events: ${eventId}`,
                            status: 400
                        });
                        eventError = true;
                        break;
                    }
                }
                if (eventError) continue;
            }

            if (!(await ZKEdDSAEventTicketPCDPackage.verify(pcd))) {
                responses.push({ error: "ZK ticket PCD is not valid", status: 401 });
                continue;
            }

            try {
                const pcd = await ZKEdDSAEventTicketPCDPackage.deserialize(inputPCD);
                // console.log('pcd', pcd)
                const groups: string[] = [];

                // Extract the desired fields and collect ticket types
                const eventId = pcd.claim.partialTicket.eventId;
                const productId = pcd.claim.partialTicket.productId;

                if (!eventId || !productId) {
                    throw new Error("No product or event selected.");
                }

                const ticketType = matchTicketToType(eventId, productId);
                if (!ticketType) {
                    throw new Error("Unable to determine ticket type.");
                }
                groups.push(ticketType);

                // const payload = {
                //     nonce: nonce,
                //     email: pcd.claim.partialTicket.attendeeEmail,
                //     external_id: pcd.claim.partialTicket.attendeeSemaphoreId,
                //     add_groups: groups.join(",")
                // };

                // console.log('Payload:', payload); // Log payload for verification

                if (pcd.claim.nullifierHash) {
                    nullifiers.add(pcd.claim.nullifierHash);
                } else {
                    throw new Error("Nullifier hash is undefined.");
                }
                nullifiers.add(pcd.claim.nullifierHash);
                validPcds.push(pcd);
            } catch (error) {
                console.error('Error processing PCD:', error);
                responses.push({ error: "Error processing PCD", status: 500 });
            }
        }

        if (validPcds.length > 0) {
            for (let pcd of validPcds) {
                let isValid = false;

                for (let type of Object.keys(whitelistedTickets) as TicketType[]) {
                    const tickets = whitelistedTickets[type];

                    if (tickets) {
                        for (let ticket of tickets) {
                            const publicKey = ticket.publicKey;

                            if (isEqualEdDSAPublicKey(publicKey, pcd.claim.signer)) {
                                isValid = true;
                                break;
                            }
                        }
                    }

                    if (isValid) {
                        break;
                    }
                }

                if (!isValid) {
                    console.error(`[ERROR] PCD is not signed by Zupass`);
                    responses.push({ error: "PCD is not signed by Zupass", status: 401 });
                }
            }

            // Ensure 'payload' is available in the scope
            const payload = {
                nonce: nonce,
                nullifiers: Array.from(nullifiers),
                email: validPcds[0].claim.partialTicket.attendeeEmail,
                external_id: validPcds[0].claim.partialTicket.attendeeSemaphoreId,
                add_groups: validPcds
                    .filter(pcd => pcd.claim.partialTicket.eventId && pcd.claim.partialTicket.productId)
                    .map(pcd => {
                        const ticketType = matchTicketToType(pcd.claim.partialTicket.eventId!, pcd.claim.partialTicket.productId!);
                        const productName = Object.values(whitelistedTickets)
                            .flat()
                            .find(ticket => ticket.productId === pcd.claim.partialTicket.productId)?.productName || '';
                        return {
                            group: ticketType,
                            ticketType: productName
                        };
                    })
            };

            const finalResponse = {
                attendeeEmail: validPcds[0].claim.partialTicket.attendeeEmail,
                payload: payload,
                status: 200
            };

            // console.log('Final Response:', finalResponse); // Log final response for verification

            return NextResponse.json(finalResponse, { status: 200 });
        } else {
            return NextResponse.json({ message: "No valid PCDs found" }, { status: 400 });
        }
    } catch (error: any) {
        console.error(`[ERROR] ${error.message}`);
        return NextResponse.json(`Unknown error: ${error.message}`, { status: 500 });
    }
};
