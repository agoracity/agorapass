
const ATTESTATIONS_PRETRUST_CHECK = `
  query AttestationPretrustCheck($schemaId: String!, $decodedData: String) {
    attestations(
      where: {
        schemaId: { equals: $schemaId },
        decodedDataJson: { contains: $decodedData }
      }
    ) {
      id
      recipient
      decodedDataJson
    }
  }
`;

export default ATTESTATIONS_PRETRUST_CHECK;