export interface User {
    name: string;
    wallet: string;
    trustedBy: number;
    bio?: string;
    twitter?: string;
    farcaster?: string;
    image?: string;
    rankScore?: number;
    avatarType: "metamask" | "blockies";
}
