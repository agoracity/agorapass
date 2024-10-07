const createUser = async (user: any, accessToken: string) => {
    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(user),
        });
        if (response.ok) {
            console.log('User created successfully');
        } else {
            console.error('Failed to create user');
        }
    } catch (error) {
        console.error('Error creating user:', error);
    }
};
export default createUser