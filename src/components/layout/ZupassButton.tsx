"use client";

import { useState, useEffect } from 'react';
import { useZuAuth } from '@/components/zupass/zuauthLogic';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
export default function ZupassButton({ user, text, wallets }: { user: any, text: string, wallets: any }) {
    const { handleZuAuth, isLoading, result, handleSign } = useZuAuth(user);
    const [isLoadingBackend, setIsLoadingBackend] = useState(false);

    useEffect(() => {
        if (result && result.pcds) {
            sendPcdsToBackend(result.pcds);
        }
    }, [result]);

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