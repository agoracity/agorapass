export async function updateEigenScore() {
    const EIGENSCORE_URL = process.env.EIGENSCORE_URL || 'http://localhost:8000';
    const EIGENSCORE_API_TOKEN = process.env.EIGENSCORE_API_TOKEN || '';

    // Send the POST request to the Python app
    const response = await fetch(`${EIGENSCORE_URL}/rankings/agora`, {
        method: 'GET',
        headers: {
            'access-token': EIGENSCORE_API_TOKEN,
            'Content-Type': 'application/json',
        },
    });

    // Handle the response from the Python app
    if (!response.ok) {
        throw new Error('Failed to update eigenScore');
    }

    const result = await response.json();
    console.log('Data updated successfully:', result);

    return result;
}
