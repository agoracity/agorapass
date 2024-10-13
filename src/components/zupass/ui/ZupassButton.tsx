"use client";

import { useState, useEffect } from 'react';
import { useZuAuth } from '@/components/zupass/zuauthLogic';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { showSuccessAlertWithoutRedirect, showErrorAlertWithSpace } from '@/utils/alertUtils';
import { matchTicketToType } from '../zupass-config';
import { saveZupassTicket } from '@/utils/zupassUtils';
import useAttestationCheck from '@/utils/hooks/useAttestationCheck';
import { ethers } from 'ethers';
import Swal from 'sweetalert2';

export default function ZupassButton({ user, text, wallets }: { user: any, text: string, wallets: any }) {
    const { handleZuAuth, isLoading, result, handleSign, apiResponse } = useZuAuth(user);
    const [isLoadingBackend, setIsLoadingBackend] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { refetch: refetchAttestations, isLoading: isLoadingAttestations, error: attestationError } = useAttestationCheck(user.wallet.address);

    useEffect(() => {
        if (result && result.pcds) {
            sendPcdsToBackend(result.pcds);
        }
    }, [result]);

    useEffect(() => {
        if (apiResponse) {
            handleApiResponse(apiResponse);
        }
    }, [apiResponse]);

    const onZuAuth = async () => {
        await handleZuAuth();
    };

    const sendPcdsToBackend = async (pcds: any) => {
        setIsLoadingBackend(true);
        try {
            await handleSign(pcds, wallets, user);
        } catch (error) {
            console.error("Error sending PCDs to backend:", error);
        } finally {
            setIsLoadingBackend(false);
        }
    };

    const handleApiResponse = async (response: any) => {
        if (response.message && Array.isArray(response.message)) {
            const failedTickets = response.message.filter((ticket: { error: any; }) => ticket.error);
            const successfulTickets = response.message.filter((ticket: { error: any; }) => !ticket.error);

            if (successfulTickets.length > 0) {
                const successMessage = await Promise.all(successfulTickets.map(async (ticket: { eventId: string; productId: string; productName: any; attestationUID: string; nullifier: string; issuer: string; category: string; subcategory: string; platform: string; }) => {
                    const ticketType = matchTicketToType(ticket.eventId, ticket.productId) || ticket.productName || 'Unknown ticket';
                    
                    // Save the ticket to the database
                    try {
                        await saveZupassTicket({
                            userId: user.id,
                            nullifier: ticket.nullifier,
                            attestationUID: ticket.attestationUID,
                            ticketType: ticketType,
                            issuer: ticket.issuer,
                            category: ticket.category,
                            subcategory: ticket.subcategory,
                            platform: ticket.platform
                        });
                        return `${ticketType} verified and saved successfully`;
                    } catch (error) {
                        console.error("Error saving Zupass ticket:", error);
                        return `${ticketType} verified but failed to save`;
                    }
                }));
                showSuccessAlertWithoutRedirect('PCD Verification Successful', successMessage.join('\n'));
            }

            if (failedTickets.length > 0) {
                console.log(failedTickets);
                const errorMessage = failedTickets.map((ticket: { eventId: string; productId: string; error: string; }) => {
                    const ticketType = matchTicketToType(ticket.eventId, ticket.productId) || 'Unknown ticket';
                    return `${ticketType}: ${ticket.error}`;
                }).join('\n');
                showErrorAlertWithSpace('PCD Verification Failed', errorMessage);
            }
        } else if (response.error) {
            showErrorAlertWithSpace('Error', response.error);
        }
    };

    const openDialog = () => {
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
    };

    const handleConnectZupass = async () => {
        closeDialog();
        await onZuAuth();
    };

    const handleReconnectZupass = async () => {
        Swal.showLoading();
        console.log("Reconnecting Zupass...");
        closeDialog();
        try {
            const { data: attestations } = await refetchAttestations();
            console.log("User attestations:", attestations);

            if (attestations && attestations.length > 0) {
                for (const attestation of attestations) {
                    const decodedData = JSON.parse(attestation.decodedDataJson);
                    
                    const nullifier = decodedData.find((item: any) => item.name === 'nullifier')?.value?.value;
                    const credentialType = decodedData.find((item: any) => item.name === 'credentialType')?.value?.value;
                    const issuer = decodedData.find((item: any) => item.name === 'issuer')?.value?.value;
                    const category = decodedData.find((item: any) => item.name === 'category')?.value?.value;
                    const subcategory = decodedData.find((item: any) => item.name === 'subcategory')?.value?.value;
                    const platform = decodedData.find((item: any) => item.name === 'platform')?.value?.value;

                    // Convert bytes32 values to strings
                    const ticketType = credentialType ? ethers.decodeBytes32String(credentialType) : '';
                    const decodedIssuer = issuer ? ethers.decodeBytes32String(issuer) : '';
                    const decodedCategory = category ? ethers.decodeBytes32String(category) : '';
                    const decodedSubcategory = subcategory ? ethers.decodeBytes32String(subcategory) : '';
                    const decodedPlatform = platform ? ethers.decodeBytes32String(platform) : '';

                    const userId = await getUserIdByWallet(ethers.getAddress(attestation.recipient));
                    
                    if (userId) {
                        try {
                            const result = await saveZupassTicket({
                                userId,
                                nullifier,
                                attestationUID: attestation.id,
                                ticketType,
                                issuer: decodedIssuer,
                                category: decodedCategory,
                                subcategory: decodedSubcategory,
                                platform: decodedPlatform
                            });
                            console.log(`Attestation saved successfully for user ${userId}`, result);
                        } catch (error) {
                            console.error("Error saving attestation:", error);
                        }
                    } else {
                        console.error(`No user found for wallet address: ${attestation.recipient}`);
                    }
                }
                showSuccessAlertWithoutRedirect('Zupass Reconnected', 'Your Zupass attestations have been updated.');
            } else {
                showErrorAlertWithSpace('No Attestations Found', 'No Zupass attestations were found for your account.');
            }
        } catch (error) {
            console.error("Error fetching attestations:", error);
            showErrorAlertWithSpace('Error', 'Failed to fetch Zupass attestations. Please try again.');
        }
    };

    // Helper function to get userId by wallet address
    const getUserIdByWallet = async (wallet: string): Promise<string | null> => {
        try {
            const response = await fetch(`/api/users/wallet/${wallet}`);
            if (!response.ok) {
                throw new Error('Failed to fetch user');
            }
            const user = await response.json();
            return user.id;
        } catch (error) {
            console.error("Error fetching user by wallet:", error);
            return null;
        }
    };

    return (
        <>
            <Button 
                onClick={() => setIsDialogOpen(true)} 
                className="bg-[#f0b90b] hover:bg-[#d9a60b] text-[#19473f] font-semibold font-[Tahoma] flex items-center justify-center px-3 py-2 text-sm sm:text-base"
            >
                <Image
                    src="/zupass.webp"
                    alt="Zupass"
                    width={20}
                    height={20}
                    className="w-5 h-5 sm:w-6 sm:h-6 mr-2 rounded-full object-cover"
                />
                <span>{text}</span>
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-[#19473f] text-white">
                    <DialogHeader>
                        <DialogTitle className="text-[#f0b90b] text-2xl">Connect with Zupass</DialogTitle>
                        <DialogDescription className="text-white/80">
                            Connect your Zupass, if you want to add more tickets, also click on the button below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Button 
                            onClick={onZuAuth} 
                            disabled={isLoading || isLoadingBackend || isLoadingAttestations}
                            className="bg-[#f0b90b] hover:bg-[#d9a60b] text-[#19473f] font-semibold"
                        >
                            {isLoading || isLoadingBackend || isLoadingAttestations ? 'Connecting...' : 'Connect your Zupass'}
                        </Button>
                        <p className="text-sm text-center text-gray-300 mt-2">
                            <button 
                                onClick={handleReconnectZupass}
                                className="text-gray-300 hover:text-[#f0b90b] underline focus:outline-none"
                                disabled={isLoadingAttestations}
                            >
                                {isLoadingAttestations ? "Checking attestations..." : "Already connected but doesn't appear? Reconnect"}
                            </button>
                        </p>
                    </div>
                    
                </DialogContent>
            </Dialog>
        </>
    );
}