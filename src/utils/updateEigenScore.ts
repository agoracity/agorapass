const EIGENSCORE_URL = process.env.EIGENSCORE_URL || 'http://localhost:8000';
const EIGENSCORE_API_TOKEN = process.env.EIGENSCORE_API_TOKEN;
const EIGENSCORE_ENDPOINT = '/rankings/agora';

export async function updateEigenScore() {
    if (!EIGENSCORE_API_TOKEN) {
        throw new Error('EIGENSCORE_API_TOKEN is not set');
    }

    try {
        const response = await fetch(`${EIGENSCORE_URL}${EIGENSCORE_ENDPOINT}`, {
            method: 'GET',
            headers: {
                'access-token': EIGENSCORE_API_TOKEN,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Data updated successfully:', result);
        return result;
    } catch (error) {
        console.error('Failed to update eigenScore:', error);
        throw error;
    }
}