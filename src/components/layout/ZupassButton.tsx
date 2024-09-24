"use client";

import { useState, useEffect } from 'react';
import { useZuAuth } from '@/components/zupass/zuauthLogic';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { matchTicketToType, whitelistedTickets } from '@/components/zupass/zupass-config';
import { checkSemaphoreAttestation } from '@/utils/checkSemaphoreAttestation';

export default function ZupassButton({ user }: { user: any }) {
    const { handleZuAuth, isLoading, result, handleSign } = useZuAuth(user);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [signingStates, setSigningStates] = useState<{ [key: string]: boolean }>({});
    const [linkedStates, setLinkedStates] = useState<{ [key: string]: boolean }>({});
    const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
    const [pcdInfos, setPcdInfos] = useState<React.ReactNode[]>([]);
    const [isCheckingAttestation, setIsCheckingAttestation] = useState(false);

    useEffect(() => {
        if (result && result.pcds) {
            setIsCheckingAttestation(true);
            Promise.all(result.pcds.map((pcd: any, index: number) => renderPcdInfo(pcd, index)))
                .then(infos => {
                    setPcdInfos(infos);
                    setIsCheckingAttestation(false);
                });
        }
    }, [result]);

    const onZuAuth = async () => {
        await handleZuAuth();
        setIsDialogOpen(true);
    };

    const handleSignWithLoading = async (pcdData: any, index: number) => {
        setSigningStates(prev => ({ ...prev, [index]: true }));
        try {
            await handleSign(pcdData);
        } finally {
            setSigningStates(prev => ({ ...prev, [index]: false }));
        }
    };

    const renderPcdInfo = async (pcdWrapper: any, index: number) => {
        console.log("PCD wrapper:", pcdWrapper);

        try {
            const pcdData = JSON.parse(pcdWrapper.pcd);
            console.log("Parsed PCD data:", pcdData);

            const eventId = pcdData.claim?.partialTicket?.eventId || "Not specified";
            const productId = pcdData.claim?.partialTicket?.productId || "Not specified";
            const semaphoreId = pcdData.claim?.partialTicket?.attendeeSemaphoreId || "";

            const ticketType = matchTicketToType(eventId, productId);
            const ticketInfo = ticketType ? whitelistedTickets[ticketType].find(t => t.eventId === eventId && t.productId === productId) : null;

            const displayTicketType = ticketInfo ? ticketInfo.productName : "Unknown";
            const displayEventName = ticketInfo ? ticketInfo.eventName : "Unknown Event";

            // Check if the ticket is already linked
            const isLinked = await checkSemaphoreAttestation(semaphoreId, ticketType || "", user.wallet.address, user.email);
            setLinkedStates(prev => ({ ...prev, [index]: isLinked.exists && isLinked.isSameWallet }));

            return (
                <div key={index} className="mb-4 p-4 border rounded">
                    <p>Ticket Type: {displayTicketType}</p>
                    <p>Event Name: {displayEventName}</p>
                    {isLinked.exists && isLinked.isSameWallet ? (
                        <p className="text-green-600 font-semibold mt-2">Signed</p>
                    ) : (
                        <Button 
                            onClick={() => handleSignWithLoading(pcdData, index)} 
                            disabled={signingStates[index]}
                            className="mt-2"
                        >
                            {signingStates[index] ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing...
                                </>
                            ) : (
                                'Sign'
                            )}
                        </Button>
                    )}
                </div>
            );
        } catch (error) {
            console.error("Error processing PCD:", error);
            return (
                <div key={index} className="mb-4 p-4 border rounded bg-red-100">
                    <p>Error: Unable to process ticket information</p>
                </div>
            );
        }
    };

    return (
        <>
            <Button 
                onClick={onZuAuth} 
                disabled={isLoading} 
                className="bg-[#f0b90b] hover:bg-[#d9a60b] text-[#19473f] font-semibold font-[Tahoma] flex items-center justify-center px-3 py-2 text-sm sm:text-base"
            >
                <Image
                    src="/zupass.webp"
                    alt="Zupass"
                    width={20}
                    height={20}
                    className="w-5 h-5 sm:w-6 sm:h-6 mr-2 rounded-full object-cover"
                />
                <span>
                    {isLoading ? 'Auth...' : 'Link Zupass'}
                </span>
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Your Zupass Tickets</DialogTitle>
                    </DialogHeader>
                    {isLoading || isCheckingAttestation ? (
                        <div className="flex items-center justify-center mt-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="ml-2">Loading...</span>
                        </div>
                    ) : result && result.pcds ? (
                        <div>{pcdInfos}</div>
                    ) : (
                        <p>No tickets found or there was an error processing the result.</p>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}