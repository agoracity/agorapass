'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import React from 'react';
import { base, polygon, } from 'viem/chains';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
            config={{
                defaultChain: base,
                supportedChains: [base, polygon],
                // Customize Privy's appearance in your app
                appearance: {
                    theme: 'light',
                    accentColor: '#19473f',
                    logo: 'agora.png',
                    landingHeader: 'Hop into Agora City',
                },
                // Create embedded wallets for users who don't have a wallet
                embeddedWallets: {
                    createOnLogin: 'users-without-wallets',
                },
            }}
        >
            {children}
        </PrivyProvider>
    );
}