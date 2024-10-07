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
}

const VouchButtonCustom: React.FC<VouchButtonCustomProps> = ({ 
    recipient, 
    className, 
    graphqlEndpoint, 
    schema, 
    chain, 
    platform, 
    verifyingContract,
    buttonText = 'View', // Default text if not provided
    name,
    bio,
    twitter,
    farcaster,
    rankScore
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
        handleVouch(recipient, user, wallets, getAccessToken, schema, chain, platform, verifyingContract);
        setIsDialogOpen(false);
    };

    const buttonStyles = `inline-flex w-full items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 px-6 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-50 ${className}`;

    const avatar = getAvatar(recipient, "w-16 h-16");
    const displayName = name || recipient;
    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button className={buttonStyles}>
                    {buttonText}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle className="hidden">User Profile</DialogTitle>
                {authStatus ? (
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
                        />
                    </div>
                ) : (
                    <>
                        <DialogTitle>Login Required</DialogTitle>
                        <DialogDescription>
                            You need to be logged in to vouch for a user.
                        </DialogDescription>
                        <DialogFooter>
                            <Button onClick={() => { login(); setIsDialogOpen(false); }}>
                                Log In
                            </Button>
                            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default VouchButtonCustom;
