"use client"
import React, { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { handleVouch } from '@/utils/handleAttestation';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { UserProfile } from './UserProfile';
interface VouchButtonCustomProps {
    recipient: string;
    className?: string;
    graphqlEndpoint: string;
    schema: string;
    chain: string;
    platform: string;
    verifyingContract: string;
    buttonText?: string; 
}

const VouchButtonCustom: React.FC<VouchButtonCustomProps> = ({ 
    recipient, 
    className, 
    graphqlEndpoint, 
    schema, 
    chain, 
    platform, 
    verifyingContract,
    buttonText = 'View' // Default text if not provided
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

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button className={buttonStyles}>
                    {buttonText}
                </Button>
            </DialogTrigger>
            <DialogContent>
                {authStatus ? (
                    <UserProfile
                        isOwnProfile={false}
                        recipient={recipient}
                        onVouch={handleVouchConfirm}
                        onCancel={() => setIsDialogOpen(false)}
                        graphqlEndpoint={graphqlEndpoint}
                        platform={platform}
                        isAuthenticated={authStatus}
                    />
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
