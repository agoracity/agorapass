async function revokeAttestation(signature: string, uid: string, token: string, address: string) {
    const url = process.env.NEXT_PUBLIC_STAMP_API_URL +  '/attestation/revoke';


    const body = JSON.stringify({
        uid,
        signature,
        address
    });

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
            'x-privy-app-id': 'AgoraPass'
        },
        body: body
    });

    if (!response.ok) {
        // if (response.status === 550) {
        //     throw new Error("You have no vouches available.");
        // } else if (response.status === 400) {
        //     throw new Error("You can't vouch yourself.");
        // } else {
        // Throw a general error for other status codes
        throw new Error(`Error creating attestation: ${response.statusText}`);
        // }
    }


    return await response.json();
}

export default revokeAttestation;