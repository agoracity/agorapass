import { ethers } from 'ethers';

export function normalizeAddress(address: string): string {
    try {
        // This will convert the address to checksum format
        return ethers.getAddress(address);
    } catch (error) {
        console.error('Invalid Ethereum address:', address);
        return address; // Return the original address if it's invalid
    }
}