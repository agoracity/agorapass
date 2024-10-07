export interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    bio?: string | null;
    wallet: string;
    twitter?: string | null;
    farcaster?: string | null;
    createdAt: Date;
    rankScore: number;
    Zupass?: ZupassEntry[];
}

interface ZupassEntry {
    email: string;
    nullifier: string;
    group: string;
    ticketType: string;
    semaphoreId: string;
    issuer: string;
    attestationUID: string;
    createdAt: Date;
}
