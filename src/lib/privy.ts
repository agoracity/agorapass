import { PrivyClient } from '@privy-io/server-auth';

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const privyAppSecret = process.env.PRIVY_APP_SECRET;

if (!privyAppId || !privyAppSecret) {
    throw new Error('Privy environment variables are not set.');
}

const privy = new PrivyClient(privyAppId, privyAppSecret);

export default privy;
