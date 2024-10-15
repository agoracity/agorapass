export const siteName = "AgoraPass";

export const EAS_CONFIG = {
    EAS_CONTRACT_ADDRESS: "0x4200000000000000000000000000000000000021",
    PRETRUST_SCHEMA: process.env.PRETRUST_SCHEMA || "0xe6428e26d2e2c1a92ac3f5b30014a228940017aa3e621e9f16f02f0ecb748de9",
    VOUCH_SCHEMA: process.env.VOUCH_SCHEMA || "0xfbc2df315b41c1b399470f3f4e5ba5caa772a328bb75d1a20bb5dbac1e75e8e7",
    GRAPHQL_URL: process.env.GRAPHQL_URL || "https://base-sepolia.easscan.org/graphql",
}
export const communityData = {
    endorsementType: "Social",
    power: "1",
    chainId: 84532,
    category: "Zuzalu",
    graphql: "https://base-sepolia.easscan.org/graphql",
    schema: process.env.VOUCH_SCHEMA || "0xfbc2df315b41c1b399470f3f4e5ba5caa772a328bb75d1a20bb5dbac1e75e8e7",
    platform: "AgoraPass",
    verifyingContract: "0x4200000000000000000000000000000000000021",
}