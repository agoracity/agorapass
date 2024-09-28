import client from '../ApolloClient';
import GET_ATTESTATIONS from '@/graphql/Attestations';
import GET_ATTESTATIONS_REDUCED from '@/graphql/AttestationsReduced';
import GET_AGGREGATE_ATTESTATIONS from '@/graphql/AggregateAttestation';
import GET_ATTESTATION from '@/graphql/getAttestation';
import COUNT_ATTESTATIONS_MADE from '@/graphql/AttestationsMadeCount';
import COUNT_ATTESTATIONS_RECEIVED from '@/graphql/AttestationsReceivedCount';
import FIND_FIRST_ENS_NAME from '@/graphql/getENSNamebyAddress';
import LAST_THREE_ATTESTATIONS from '@/graphql/LastThreeAttestations';
import ATTESTATIONS_MADE from '@/graphql/AttestationsMade';
import ATTESTATIONS_RECEIVED from '@/graphql/AttestationsReceived';
import ATTESTATIONS_PRETRUST_CHECK from '@/graphql/AttestationPretrustCheck';
import { Attestation } from "@/types/attestations";

export const fetchAttestations = async (page: number, pageSize: number) => {
    const { data } = await client.query({
        query: GET_ATTESTATIONS,
        variables: {
            where: { id: process.env.NEXT_PUBLIC_SCHEMA_ID },
            skip: page * pageSize,
            take: pageSize,
        },
    });
    return data.schema.attestations;
};

export const fetchAggregateAttestations = async () => {
    const { data } = await client.query({
        query: GET_AGGREGATE_ATTESTATIONS,
        variables: {
            where: {
                schemaId: {
                    equals: process.env.NEXT_PUBLIC_SCHEMA_ID
                },
                decodedDataJson: {
                    contains: "0x41676f7261506173730000000000000000000000000000000000000000000000"
                },
            }
        },
    });
    return data.aggregateAttestation._count._all;
};

export const fetchAttestation = async (id: string) => {
    const { data } = await client.query({
        query: GET_ATTESTATION,
        variables: {
            where: { id },
        },
    });
    return data.getAttestation;
};

export const fetchAttestationsMadeCount = async (schemaId: string, address: string) => {
    const { data } = await client.query({
        query: COUNT_ATTESTATIONS_MADE,
        variables: {
            where: {
                schemaId: { equals: schemaId },
                attester: { equals: address },
            },
        },
    });
    return data.aggregateAttestation._count.attester;
};

export const fetchAttestationsReceivedCount = async (schemaId: string, address: string) => {
    const { data } = await client.query({
        query: COUNT_ATTESTATIONS_RECEIVED,
        variables: {
            where: {
                schemaId: { equals: schemaId },
                recipient: { equals: address },
            },
        },
    });
    return data.aggregateAttestation._count.recipient;
};

export const fetchEnsNameByAddress = async (address: string) => {
    const { data } = await client.query({
        query: FIND_FIRST_ENS_NAME,
        variables: {
            where: {
                id: {
                    equals: address.toLowerCase(),
                },
            },
        },
    });
    return data.findFirstEnsName?.name || null;
};

export const fetchAttestationsReduced = async (page: number, pageSize: number): Promise<Attestation[]> => {
    const { data } = await client.query({
        query: GET_ATTESTATIONS_REDUCED,
        variables: {
            where: { id: process.env.NEXT_PUBLIC_SCHEMA_ID },
            skip: page * pageSize,
            take: pageSize,
            orderBy: [{ timeCreated: 'desc' }] // Pass orderBy as an array
        },
    });

    return data?.schema?.attestations ?? [];
};

export const LastThreeAttestations = async (schemaId: string, attester: string) => {
    const { data } = await client.query({
        query: LAST_THREE_ATTESTATIONS,
        variables: {
            schemaId,
            attester,
            take: 3,
            orderBy: [{ timeCreated: 'desc' }] // Pass orderBy as an array
        },
    });
    return data.attestations;
};

export const fetchAttestationsMade = async (schemaId: string, address: string) => {
    const { data } = await client.query({
        query: ATTESTATIONS_MADE,
        variables: {
            schemaId,
            address,
        },
    });
    return data.attestations;
};

export const fetchAttestationsReceived = async (schemaId: string, address: string) => {
    const { data } = await client.query({
        query: ATTESTATIONS_RECEIVED,
        variables: {
            schemaId,
            address,
        },
    });
    return data.attestations;
};

export const fetchAttestationsMadePretrust = async (schemaId: string, address: string) => {
    const { data } = await client.query({
        query: ATTESTATIONS_PRETRUST_CHECK,
        variables: {
            schemaId,
            address,
        },
    });
    return data.attestations;
};
