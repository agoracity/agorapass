import gql from 'graphql-tag';

const ATTESTATIONS_PRETRUST_CHECK = gql`
  query AttestationPretrustCheck($schemaId: String!, $decodedData: String) {
    attestations(
      where: {
        schemaId: { equals: $schemaId },
        decodedDataJson: { contains: $decodedData }
      }
    ) {
      id
      recipient
      timeCreated
      txid
      decodedDataJson
    }
  }
`;

export default ATTESTATIONS_PRETRUST_CHECK;