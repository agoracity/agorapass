async function generateAttestation(token: string, attester: string, signature: string, nullifier: any, payload: any) {
    const url = '/api/zupass/createAttestation';

    const body = JSON.stringify({
        attester,
        signature,
        nullifier,
        payload: {
            ...payload,
            group: payload.group,
            ticketType: payload.ticketType
        }
    });

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
        },
        body: body
    });

    if (!response.ok) {
        // Throw a general error
        throw new Error(`Error creating attestation: ${response.statusText}`);
    }


    return await response.json();
}

export default generateAttestation;
