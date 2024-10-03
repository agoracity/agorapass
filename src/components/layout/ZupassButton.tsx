"use client";

import { useState, useEffect } from 'react';
import { useZuAuth } from '@/components/zupass/zuauthLogic';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { showSuccessAlert, showErrorAlertWithSpace } from '@/utils/alertUtils';
import { matchTicketToType } from '@/components/zupass/zupass-config';

export default function ZupassButton({ user, text, wallets }: { user: any, text: string, wallets: any }) {
    const { handleZuAuth, isLoading, result, handleSign, apiResponse } = useZuAuth(user);
    const [isLoadingBackend, setIsLoadingBackend] = useState(false);

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

    const handleApiResponse = (response: any) => {
        if (response.message && Array.isArray(response.message)) {
            const failedTickets = response.message.filter((ticket: { error: any; }) => ticket.error);
            const successfulTickets = response.message.filter((ticket: { error: any; }) => !ticket.error);

            if (successfulTickets.length > 0) {
                const successMessage = successfulTickets.map((ticket: { eventId: string; productId: string; productName: any; }) => {
                    const ticketType = matchTicketToType(ticket.eventId, ticket.productId) || ticket.productName || 'Unknown ticket';
                    return `${ticketType} verified successfully`;
                }).join('\n');
                showSuccessAlert('PCD Verification Successful', successMessage, '/dashboard');
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


    return (
        <Button 
            onClick={onZuAuth} 
            disabled={isLoading || isLoadingBackend} 
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
                {isLoading || isLoadingBackend ? 'Loading...' : text}
            </span>
        </Button>
    );
}