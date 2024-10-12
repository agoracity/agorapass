import { useQuery } from '@tanstack/react-query';
import { usePrivy } from '@privy-io/react-auth';

const fetchUser = async (getAccessToken: () => Promise<string | null>, privyUser: any) => {
    const accessToken = await getAccessToken();
    if (!accessToken) {
        throw new Error('User is not authenticated');
    }

    try {
        const response = await fetch('/api/user', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            if (response.status === 404) {
                // User does not exist, initiate creation
                return createUserIfNeeded(getAccessToken, privyUser);
            } else {
                const errorText = await response.text();
                throw new Error(`Failed to fetch user data: ${errorText}`);
            }
        }

        return response.json();
    } catch (error) {
        console.error('Error fetching user:', error);
        throw new Error('Failed to fetch user data');
    }
};

const fetchUserProfile = async (getAccessToken: () => Promise<string | null>, privyUser: any) => {
    const accessToken = await getAccessToken();
    if (!accessToken) {
        throw new Error('User is not authenticated');
    }

    try {
        const response = await fetch(`/api/user/${privyUser.wallet.address}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            if (response.status === 404) {
                // User does not exist, initiate creation
                return createUserIfNeeded(getAccessToken, privyUser);
            } else {
                const errorText = await response.text();
                throw new Error(`Failed to fetch user data: ${errorText}`);
            }
        }

        return response.json();
    } catch (error) {
        console.error('Error fetching user:', error);
        throw new Error('Failed to fetch user data');
    }
};

const createUserIfNeeded = async (getAccessToken: () => Promise<string | null>, privyUser: any) => {
    const accessToken = await getAccessToken();
    if (!accessToken) {
        throw new Error('User is not authenticated');
    }

    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(privyUser),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create user: ${errorText}`);
        }

        return response.json();
    } catch (error) {
        console.error('Error creating user:', error);
        throw new Error('Failed to create user');
    }
};

export const useFetchUser = (updateTrigger?: boolean) => {
    const { getAccessToken, user: privyUser } = usePrivy();

    return useQuery({
        queryKey: ['user', updateTrigger],  // Include `updateTrigger` in the query key
        queryFn: () => fetchUser(getAccessToken, privyUser),
        placeholderData: true,  // Keep previous data while fetching new data
        refetchOnWindowFocus: false,  // Prevent refetch on window focus, if desired
        refetchOnReconnect: true,  // Refetch data when reconnecting to the internet
        refetchInterval: false,  // Disable interval-based refetching
    });
};


export const useFetchUserProfile = (updateTrigger?: boolean) => {
    const { getAccessToken, user: privyUser } = usePrivy();

    return useQuery({
        queryKey: ['userProfile', updateTrigger],  // Include `updateTrigger` in the query key
        queryFn: () => fetchUserProfile(getAccessToken, privyUser),
        placeholderData: true,  // Keep previous data while fetching new data
        refetchOnWindowFocus: false,  // Prevent refetch on window focus, if desired
        refetchOnReconnect: true,  // Refetch data when reconnecting to the internet
        refetchInterval: false,  // Disable interval-based refetching
    });
};

