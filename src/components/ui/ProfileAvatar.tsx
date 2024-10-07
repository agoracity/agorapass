import React from 'react';
import { createAvatar } from '@dicebear/core';
import { funEmoji } from '@dicebear/collection';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';

export default function ProfileAvatar(wallet: string, className?: string): React.ReactElement {
    const seed = wallet.toLowerCase();
    const avatarSvg = createAvatar(funEmoji, {
        seed: seed,
        size: 100,
        radius: 50,
    }).toString();

    return (
        <Avatar className={`cursor-pointer hover:opacity-80 transition-opacity ${className}`}>
            <AvatarImage src={`data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg)}`} alt={`Avatar for ${wallet}`} />
            <AvatarFallback>{wallet.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
    );
}