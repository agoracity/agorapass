async function generateAttestation(token: string, platform: string, recipient: string, attester: string, signature: string, ) {
    const url = process.env.NEXT_PUBLIC_STAMP_API_URL + '/attestation';

    const body = JSON.stringify({
        platform,
        recipient,
        attester,
        signature
    });

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
            'x-privy-app-id': 'agora',
        },
        body: body
    });

    const responseBody = await response.json();
    if (!response.ok || responseBody.error) {
        if (responseBody.status === 550) {
            throw new Error("You have no vouches available.");
        } else if (responseBody.status === 400) {
            throw new Error("You can't vouch yourself.");
        } else {
            // Throw a general error for other status codes
            throw new Error(`Error creating attestation: ${responseBody.error || response.statusText}`);
        }
    }

    return responseBody;
}

export default generateAttestation;
