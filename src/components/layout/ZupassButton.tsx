"use client";
import { useZupass } from "@/components/zupass/zupass";
import { useZupassPopupMessages } from "@pcd/passport-interface";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { showLoadingAlert } from "@/utils/alertUtils";
import ShinyButton from "@/components/ui/ShinyButton";
export default function ZupassButton() {

    const [loading, setLoading] = useState(false);
    const { login } = useZupass();
    const [multiPCDs] = useZupassPopupMessages();


    useEffect(() => {
        if (multiPCDs) {
            console.log("🚀 ~ multiPCDs:", multiPCDs);
        }
    }, [multiPCDs]);

    const { getAccessToken, user } = usePrivy();
    const { wallets } = useWallets();
    const loginHandler = async () => {
        setLoading(true);
        showLoadingAlert();
        const token = await getAccessToken();
        await login(user, wallets, token);
        setLoading(false);
    };

    if (loading) {
        return (
            <p>loading...</p>
        );
    }

    return (
        // <Button onClick={loginHandler} className="bg-accentdark hover:bg-accentdarker text-[#19473f] font-semibold font-[Tahoma]">Connect Zupass</Button>
        <ShinyButton onClick={loginHandler} className="bg-accentdark hover:bg-accentdarker text-[#19473f] font-semibold font-[Tahoma]">Connect Zupass</ShinyButton>
    );
}
