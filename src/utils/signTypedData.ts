import { createWalletClient, custom } from 'viem';
import { base, baseSepolia } from 'viem/chains';

export const signTypedData = async (user: { wallet: { walletClientType: string; }; }, wallets: any[], chainId: number, typedData: { types: any; domain: any; primaryType: any; message: any; }) => {
    let signature;

    if (user.wallet.walletClientType === 'privy') {
        const wallet = wallets[0];
        await wallet.switchChain(chainId);
        const provider = await wallet.getEthereumProvider();
        const address = wallet.address;
        signature = await provider.request({
            method: 'eth_signTypedData_v4',
            params: [address, JSON.stringify(typedData)],
        });
    } else {
        const wallet = wallets.find(wallet => wallet.walletClientType === user.wallet.walletClientType);
        if (!wallet) {
            throw new Error('Desired wallet not found');
        }
        await wallet.switchChain(chainId);
        const provider = await wallet.getEthereumProvider();
        const address = wallet.address;
        const defaultChain = chainId === 8453 ? base : baseSepolia;
        const walletClient = createWalletClient({
            account: address as `0x${string}`,
            chain: defaultChain,
            transport: custom(provider),
        });
        
        signature = await walletClient.signTypedData({
            //@ts-expect-error !TO DO check how to fix this
            address,
            domain: typedData.domain,
            types: typedData.types,
            primaryType: typedData.primaryType,
            message: typedData.message,
        });
    }

    console.log('signature', signature)
    return signature;
};
