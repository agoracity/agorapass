export async function checkSemaphoreAttestation(semaphoreId: string, ticketType: string, walletAddress: string, email: string) {
    try {
        const response = await fetch('/api/zupass/checkSemaphore', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ semaphoreId, ticketType, walletAddress, email }),
        });

        if (!response.ok) {
            throw new Error('Failed to check Semaphore attestation');
        }

        return await response.json();
    } catch (error) {
        console.error('Error checking Semaphore attestation:', error);
        throw error;
    }
}