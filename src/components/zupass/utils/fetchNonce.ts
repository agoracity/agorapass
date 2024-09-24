const fetchNonce = async (wallet: string, accessToken: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_STAMP_API_URL}/attestation/nonce?attester=${wallet}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'x-privy-app-id': process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
        },
    });

    if (!response.ok) {
        throw new Error('Error fetching EAS nonce');
    }

    const data = await response.json();
    return data.easNonce;
};

export default fetchNonce;