import { ethers } from 'ethers';

export function calculateNullifier(attendeeSemaphoreId: string, productId: string): string {
  return ethers.hexlify(
    ethers.keccak256(
      ethers.concat([
        ethers.toUtf8Bytes(attendeeSemaphoreId),
        ethers.toUtf8Bytes(productId)
      ])
    ).slice(0, 66)
  );
}