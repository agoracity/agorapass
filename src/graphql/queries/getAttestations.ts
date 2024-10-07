const GET_ATTESTATIONS = `
  query GetAttestations($schemaId: String!, $jsonFilter: String) {
    attestations(
      where: {
        schemaId: { equals: $schemaId },
        decodedDataJson: { contains: $jsonFilter }
      }
    ) {
      id
      recipient
      attester
    }
  }
`;

export default GET_ATTESTATIONS;