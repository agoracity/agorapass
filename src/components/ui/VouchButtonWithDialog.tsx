"use client"
import React, { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { handleVouch } from '@/utils/handleAttestation';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { UserProfile } from './UserProfile';
import { Twitter, Zap } from 'lucide-react';
import Link from 'next/link';
import getAvatar from '@/components/ui/ProfileAvatar';

interface VouchButtonCustomProps {
    recipient: string;
    className?: string;
    graphqlEndpoint: string;
    schema: string;
    chain: string;
    platform: string;
    verifyingContract: string;
    buttonText?: string;
    // New props
    name?: string;
    bio?: string;
    twitter?: string;
    farcaster?: string;
    rankScore?: number;
    directVouch?: boolean; 
}

const VouchButtonCustom: React.FC<VouchButtonCustomProps> = ({ 
    recipient, 
    className, 
    graphqlEndpoint, 
    schema, 
    chain, 
    platform, 
    verifyingContract,
    buttonText = 'View', 
    name,
    bio,
    twitter,
    farcaster,
    rankScore,
    directVouch = false 
}) => {
    
    const { getAccessToken, user, login, authenticated, ready } = usePrivy();
    const [authStatus, setAuthStatus] = useState(false);
    const { wallets } = useWallets();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    useEffect(() => {
        if (ready) {
            setAuthStatus(authenticated);
        }
    }, [ready, authenticated]);

    const handleVouchConfirm = () => {
        if (authStatus) {
            handleVouch(recipient, user, wallets, getAccessToken, schema, chain, platform, verifyingContract);
        } else {
            login();
        }
        setIsDialogOpen(false);
    };

    const handleDirectVouch = () => {
        if (authStatus) {
            handleVouch(recipient, user, wallets, getAccessToken, schema, chain, platform, verifyingContract);
        } else {
            login();
        }
    };

    const buttonStyles = `inline-flex w-full items-center justify-center rounded-xl bg-[#19473f] text-primary-foreground hover:bg-[#19473f]/90 px-6 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-50 ${className}`;

    const avatar = getAvatar(recipient, "w-16 h-16");
    const displayName = name || recipient;

    if (directVouch) {
        return (
            <Button className={buttonStyles} onClick={handleDirectVouch}>
                {buttonText}
            </Button>
        );
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button className={buttonStyles}>
                    {buttonText}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle className="hidden">User Profile</DialogTitle>
                <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                        {avatar}
                        <div>
                            <h2 className="text-xl font-bold">{displayName}</h2>
                            <p className="text-sm text-gray-500">{recipient}</p>
                        </div>
                    </div>
                    {bio && <p className="text-sm">{bio}</p>}
                    <div className="flex space-x-2">
                        {twitter && (
                            <Link href={`https://twitter.com/${twitter}`} target="_blank" rel="noopener noreferrer">
                                <Twitter className="w-5 h-5 text-blue-400" />
                            </Link>
                        )}
                        {farcaster && (
                            <Link href={`https://warpcast.com/${farcaster}`} target="_blank" rel="noopener noreferrer">
                                <Zap className="w-5 h-5 text-purple-600" />
                            </Link>
                        )}
                    </div>
                    {rankScore !== undefined && (
                        <p className="text-sm">Rank Score: {rankScore.toFixed(2)}</p>
                    )}
                    <UserProfile
                        isOwnProfile={false}
                        recipient={recipient}
                        onVouch={handleVouchConfirm}
                        onCancel={() => setIsDialogOpen(false)}
                        graphqlEndpoint={graphqlEndpoint}
                        platform={platform}
                        isAuthenticated={authStatus}
                        name={displayName}
                        bio={bio}
                        twitter={twitter}
                        farcaster={farcaster}
                        rankScore={rankScore}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default VouchButtonCustom;
