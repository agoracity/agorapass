interface ZupassTicket {
    userId: string;
    nullifier: string;
    attestationUID: string;
    ticketType: string;
    issuer: string;
    category: string;
    subcategory: string;
    platform: string;
}

export async function saveZupassTicket(ticket: ZupassTicket) {
    const response = await fetch('/api/zupass/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ticket),
    });
  
    if (!response.ok) {
      throw new Error('Failed to save Zupass ticket');
    }
  
    return response.json();
};
