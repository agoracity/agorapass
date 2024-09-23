const fetchNonce = async (wallet: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_STAMP_API_URL;
    const response = await fetch(`${apiUrl}/attestation/nonce?attester=${wallet}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Error fetching EAS nonce');
    }

    const data = await response.json();
    return data.easNonce;
};
export default fetchNonce